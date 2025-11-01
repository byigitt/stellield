/**
 * Deposit flow orchestrator
 * Coordinates the entire flow: XLM → USDC → Bridge → Stake
 */

import { StellarClient } from '../stellar/client';
import { StellarSwap } from '../stellar/swap';
import { StellarCCTPBurn } from '../stellar/cctp-burn';
import { SolanaClient } from '../solana/client';
import { SolanaCCTPMint } from '../solana/cctp-mint';
import { MarinadeStaking } from '../solana/marinade';
import { CircleAttestationService } from '../bridge/attestation';
import { StateManager } from './state';
import { TransactionState, TransactionStatus, TransactionStep } from '../types';
import { logger } from '../utils/logger';

export interface DepositOptions {
  xlmAmount: string;
  minUSDCAmount?: string;
  slippagePercent?: number;
  skipStaking?: boolean;
}

export interface DepositResult {
  transactionId: string;
  state: TransactionState;
  finalMSolAmount?: string;
  totalYieldPotential?: string;
}

export class DepositOrchestrator {
  private stellarClient: StellarClient;
  private stellarSwap: StellarSwap;
  private stellarCCTP: StellarCCTPBurn;
  private solanaClient: SolanaClient;
  private solanaCCTP: SolanaCCTPMint;
  private marinade: MarinadeStaking;
  private attestation: CircleAttestationService;
  private stateManager: StateManager;

  constructor() {
    // Initialize clients
    this.stellarClient = new StellarClient();
    this.stellarSwap = new StellarSwap(this.stellarClient);
    this.stellarCCTP = new StellarCCTPBurn(this.stellarClient);
    
    this.solanaClient = new SolanaClient();
    this.solanaCCTP = new SolanaCCTPMint(this.solanaClient);
    this.marinade = new MarinadeStaking(this.solanaClient);
    
    this.attestation = new CircleAttestationService();
    this.stateManager = new StateManager();

    logger.info('Deposit orchestrator initialized');
  }

  /**
   * Execute the full deposit flow
   */
  async executeDeposit(options: DepositOptions): Promise<DepositResult> {
    const { xlmAmount, minUSDCAmount, slippagePercent = 1, skipStaking = false } = options;

    // Create transaction state
    const state = this.stateManager.createTransaction(
      this.stellarClient.getPublicKey(),
      xlmAmount
    );

    try {
      logger.info('Starting deposit flow', {
        transactionId: state.id,
        xlmAmount,
        skipStaking,
      });

      // Step 1: Swap XLM to USDC
      const usdcAmount = await this.swapXLMtoUSDC(
        state.id,
        xlmAmount,
        minUSDCAmount,
        slippagePercent
      );

      // Step 2: Burn USDC on Stellar
      const burnResult = await this.burnUSDCOnStellar(
        state.id,
        usdcAmount
      );

      // Step 3: Get attestation from Circle
      const attestation = await this.getAttestation(
        state.id,
        burnResult.messageHash
      );

      // Step 4: Mint USDC on Solana
      await this.mintUSDCOnSolana(
        state.id,
        burnResult.messageHash,
        attestation,
        Buffer.from('') // Message bytes would come from burn result
      );

      // Step 5: Stake with Marinade (optional)
      let mSolAmount: string | undefined;
      if (!skipStaking) {
        mSolAmount = await this.stakeWithMarinade(state.id, parseFloat(usdcAmount));
      }

      // Mark as completed
      this.stateManager.updateStatus(state.id, TransactionStatus.COMPLETED);
      this.stateManager.updateStep(state.id, TransactionStep.MARINADE_STAKE);

      const finalState = this.stateManager.getState(state.id)!;

      logger.info('Deposit flow completed', {
        transactionId: state.id,
        xlmAmount,
        usdcAmount,
        mSolAmount,
      });

      return {
        transactionId: state.id,
        state: finalState,
        finalMSolAmount: mSolAmount,
        totalYieldPotential: await this.calculateYieldPotential(mSolAmount),
      };
    } catch (error: any) {
      logger.error('Deposit flow failed', {
        transactionId: state.id,
        error: error.message,
      });

      this.stateManager.updateStatus(
        state.id,
        TransactionStatus.FAILED,
        error.message
      );

      throw error;
    }
  }

  /**
   * Step 1: Swap XLM to USDC
   */
  private async swapXLMtoUSDC(
    txId: string,
    xlmAmount: string,
    minUSDCAmount?: string,
    slippagePercent: number = 1
  ): Promise<string> {
    try {
      logger.info('Step 1: Swapping XLM to USDC', { txId, xlmAmount });
      
      this.stateManager.updateStep(txId, TransactionStep.XLM_TO_USDC_SWAP);
      this.stateManager.updateStatus(txId, TransactionStatus.PROCESSING);

      // Get quote
      const quote = await this.stellarSwap.getSwapQuote(xlmAmount);
      
      // Calculate minimum output with slippage
      const minOutput = minUSDCAmount || 
        this.stellarSwap.calculateMinOutput(quote.outputAmount, slippagePercent);

      // Execute swap
      const txHash = await this.stellarSwap.swapXLMtoUSDC(
        xlmAmount,
        minOutput
      );

      // Update state
      this.stateManager.updateStellarTx(txId, 'swap', txHash);
      this.stateManager.updateAmounts(txId, {
        usdcAfterSwap: quote.outputAmount,
      });

      logger.info('XLM to USDC swap completed', {
        txId,
        txHash,
        usdcReceived: quote.outputAmount,
      });

      return quote.outputAmount;
    } catch (error) {
      logger.error('XLM to USDC swap failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 2: Burn USDC on Stellar
   */
  private async burnUSDCOnStellar(
    txId: string,
    usdcAmount: string
  ): Promise<{ transactionHash: string; messageHash: string }> {
    try {
      logger.info('Step 2: Burning USDC on Stellar', { txId, usdcAmount });
      
      this.stateManager.updateStep(txId, TransactionStep.USDC_BURN_STELLAR);

      // Get Solana recipient address
      const solanaRecipient = this.solanaClient.getPublicKeyString();
      const destinationDomain = this.stellarCCTP.getSolanaDomain();

      // Burn USDC
      const burnResult = await this.stellarCCTP.burnUSDC(
        usdcAmount,
        destinationDomain,
        solanaRecipient
      );

      // Update state
      this.stateManager.updateStellarTx(txId, 'burn', burnResult.transactionHash);
      this.stateManager.updateBridgeData(txId, {
        messageHash: burnResult.messageHash,
      });
      this.stateManager.updateAmounts(txId, {
        usdcBridged: usdcAmount,
      });

      logger.info('USDC burn completed', {
        txId,
        txHash: burnResult.transactionHash,
        messageHash: burnResult.messageHash,
      });

      return {
        transactionHash: burnResult.transactionHash,
        messageHash: burnResult.messageHash,
      };
    } catch (error) {
      logger.error('USDC burn failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 3: Get attestation from Circle
   */
  private async getAttestation(
    txId: string,
    messageHash: string
  ): Promise<string> {
    try {
      logger.info('Step 3: Getting attestation', { txId, messageHash });
      
      this.stateManager.updateStep(txId, TransactionStep.BRIDGE_ATTESTATION);

      // Wait for attestation
      const attestation = await this.attestation.waitForAttestation(
        messageHash,
        300, // max attempts
        5000 // delay in ms
      );

      // Update state
      this.stateManager.updateBridgeData(txId, { attestation });

      logger.info('Attestation received', { txId, messageHash });

      return attestation;
    } catch (error) {
      logger.error('Attestation failed', { txId, messageHash, error });
      throw error;
    }
  }

  /**
   * Step 4: Mint USDC on Solana
   */
  private async mintUSDCOnSolana(
    txId: string,
    messageHash: string,
    attestation: string,
    messageBytes: Buffer
  ): Promise<string> {
    try {
      logger.info('Step 4: Minting USDC on Solana', { txId });
      
      this.stateManager.updateStep(txId, TransactionStep.USDC_MINT_SOLANA);

      // Mint USDC
      const mintResult = await this.solanaCCTP.receiveAndMintUSDC(
        messageHash,
        attestation,
        messageBytes
      );

      // Update state
      this.stateManager.updateSolanaTx(txId, 'mint', mintResult.transactionSignature);

      logger.info('USDC minted on Solana', {
        txId,
        signature: mintResult.transactionSignature,
      });

      return mintResult.transactionSignature;
    } catch (error) {
      logger.error('USDC mint failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 5: Stake with Marinade
   * 
   * ⚠️ IMPORTANT: This is a PoC limitation!
   * After minting USDC on Solana (Step 4), we need to:
   *   1. Swap USDC to SOL using Jupiter or Orca DEX
   *   2. Then stake the SOL with Marinade
   * 
   * Currently, this step is passing USDC amount as if it were SOL,
   * which causes an "Insufficient SOL balance" error.
   * 
   * For testing, either:
   *   - Skip staking (skipStaking: true)
   *   - Ensure you have enough SOL in your Solana wallet
   *   - Implement the USDC->SOL swap step
   */
  private async stakeWithMarinade(
    txId: string,
    solAmount: number
  ): Promise<string> {
    try {
      logger.info('Step 5: Staking with Marinade', { txId, solAmount });
      
      this.stateManager.updateStep(txId, TransactionStep.MARINADE_STAKE);

      // TODO: Add USDC to SOL swap here before staking
      // For now, this assumes you already have SOL in your wallet
      
      const stakeResult = await this.marinade.stakeSol(solAmount);

      // Update state
      this.stateManager.updateSolanaTx(txId, 'stake', stakeResult.transactionSignature);
      this.stateManager.updateAmounts(txId, {
        mSolReceived: stakeResult.mSolReceived,
      });

      logger.info('Staking completed', {
        txId,
        mSolReceived: stakeResult.mSolReceived,
      });

      return stakeResult.mSolReceived;
    } catch (error) {
      logger.error('Staking failed', { txId, error });
      throw error;
    }
  }

  /**
   * Calculate potential yield
   */
  private async calculateYieldPotential(mSolAmount?: string): Promise<string> {
    if (!mSolAmount) return '0';

    try {
      const apy = await this.marinade.getEstimatedAPY();
      const amount = parseFloat(mSolAmount);
      const yearlyYield = amount * (apy / 100);
      
      return yearlyYield.toFixed(4);
    } catch (error) {
      logger.error('Failed to calculate yield potential', error);
      return '0';
    }
  }

  /**
   * Get transaction state
   */
  getTransactionState(txId: string): TransactionState | undefined {
    return this.stateManager.getState(txId);
  }

  /**
   * Get state manager
   */
  getStateManager(): StateManager {
    return this.stateManager;
  }
}

