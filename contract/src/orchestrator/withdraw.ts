/**
 * Withdrawal flow orchestrator
 * Coordinates the reverse flow: Unstake → Bridge → Swap → XLM
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarClient } from '../stellar/client';
import { StellarSwap } from '../stellar/swap';
import { SolanaClient } from '../solana/client';
import { MarinadeStaking } from '../solana/marinade';
import { CircleAttestationService } from '../bridge/attestation';
import { StateManager } from './state';
import { TransactionState, TransactionStatus, TransactionStep } from '../types';
import { logger } from '../utils/logger';

export interface WithdrawOptions {
  mSolAmount: string;
  minXLMAmount?: string;
  slippagePercent?: number;
  useDelayedUnstake?: boolean;
}

export interface WithdrawResult {
  transactionId: string;
  state: TransactionState;
  finalXLMAmount: string;
  profitAmount?: string;
}

export class WithdrawOrchestrator {
  private stellarClient: StellarClient;
  private stellarSwap: StellarSwap;
  private solanaClient: SolanaClient;
  private marinade: MarinadeStaking;
  private attestation: CircleAttestationService;
  private stateManager: StateManager;

  constructor(stateManager?: StateManager) {
    // Initialize clients
    this.stellarClient = new StellarClient();
    this.stellarSwap = new StellarSwap(this.stellarClient);
    
    this.solanaClient = new SolanaClient();
    this.marinade = new MarinadeStaking(this.solanaClient);
    
    this.attestation = new CircleAttestationService();
    this.stateManager = stateManager || new StateManager();

    logger.info('Withdraw orchestrator initialized');
  }

  /**
   * Execute the full withdrawal flow
   */
  async executeWithdraw(options: WithdrawOptions): Promise<WithdrawResult> {
    const { 
      mSolAmount, 
      minXLMAmount, 
      slippagePercent = 1,
      useDelayedUnstake = false 
    } = options;

    // Create transaction state
    const state = this.stateManager.createTransaction(
      this.solanaClient.getPublicKeyString(),
      mSolAmount
    );

    try {
      logger.info('Starting withdrawal flow', {
        transactionId: state.id,
        mSolAmount,
        useDelayedUnstake,
      });

      // Step 1: Unstake from Marinade
      const solAmount = await this.unstakeFromMarinade(
        state.id,
        parseFloat(mSolAmount),
        useDelayedUnstake
      );

      // Step 2: Convert SOL to USDC (would use Solana DEX in production)
      // For PoC, we assume we have USDC
      const usdcAmount = solAmount; // Placeholder conversion

      // Step 3: Burn USDC on Solana
      const burnResult = await this.burnUSDCOnSolana(
        state.id,
        usdcAmount.toString()
      );

      // Step 4: Get attestation from Circle
      const attestation = await this.getAttestation(
        state.id,
        burnResult.messageHash
      );

      // Step 5: Mint USDC on Stellar
      await this.mintUSDCOnStellar(
        state.id,
        burnResult.messageHash,
        attestation
      );

      // Step 6: Swap USDC to XLM
      const xlmAmount = await this.swapUSDCtoXLM(
        state.id,
        usdcAmount.toString(),
        minXLMAmount,
        slippagePercent
      );

      // Mark as completed
      this.stateManager.updateStatus(state.id, TransactionStatus.COMPLETED);
      this.stateManager.updateStep(state.id, TransactionStep.XLM_RETURNED);

      const finalState = this.stateManager.getState(state.id)!;

      // Calculate profit (if original deposit is tracked)
      const profit = await this.calculateProfit(state.id, xlmAmount);

      logger.info('Withdrawal flow completed', {
        transactionId: state.id,
        mSolAmount,
        xlmAmount,
        profit,
      });

      return {
        transactionId: state.id,
        state: finalState,
        finalXLMAmount: xlmAmount,
        profitAmount: profit,
      };
    } catch (error: any) {
      logger.error('Withdrawal flow failed', {
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
   * Step 1: Unstake from Marinade
   */
  private async unstakeFromMarinade(
    txId: string,
    mSolAmount: number,
    useDelayedUnstake: boolean
  ): Promise<number> {
    try {
      logger.info('Step 1: Unstaking from Marinade', { 
        txId, 
        mSolAmount,
        delayed: useDelayedUnstake 
      });
      
      this.stateManager.updateStep(txId, TransactionStep.MARINADE_UNSTAKE);
      this.stateManager.updateStatus(txId, TransactionStatus.PROCESSING);

      let signature: string;
      let solReceived: number;

      if (useDelayedUnstake) {
        // Delayed unstake (no fee, but must wait for epoch end)
        signature = await this.marinade.delayedUnstakeMSol(mSolAmount);
        // Calculate expected SOL
        solReceived = await this.marinade.calculateSolForMSol(mSolAmount);
      } else {
        // Liquid unstake (immediate, with small fee)
        const unstakeResult = await this.marinade.unstakeMSol(mSolAmount);
        signature = unstakeResult.transactionSignature;
        solReceived = parseFloat(unstakeResult.solReceived);
      }

      // Update state
      this.stateManager.updateSolanaTx(txId, 'unstake', signature);
      this.stateManager.updateAmounts(txId, {
        usdcFromUnstake: solReceived.toString(),
      });

      logger.info('Unstaking completed', {
        txId,
        signature,
        solReceived,
      });

      return solReceived;
    } catch (error) {
      logger.error('Unstaking failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 2: Burn USDC on Solana
   */
  private async burnUSDCOnSolana(
    txId: string,
    usdcAmount: string
  ): Promise<{ transactionSignature: string; messageHash: string }> {
    try {
      logger.info('Step 2: Burning USDC on Solana', { txId, usdcAmount });
      
      this.stateManager.updateStep(txId, TransactionStep.USDC_BURN_SOLANA);

      // Note: This would require implementing CCTP burn on Solana
      // For now, we create a placeholder transaction
      const messageHash = `solana_burn_${Date.now()}`;
      const signature = 'placeholder_signature';

      // Update state
      this.stateManager.updateSolanaTx(txId, 'burn', signature);
      this.stateManager.updateBridgeData(txId, { messageHash });

      logger.info('USDC burn completed', {
        txId,
        signature,
        messageHash,
      });

      return {
        transactionSignature: signature,
        messageHash,
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
      
      this.stateManager.updateStep(txId, TransactionStep.BRIDGE_ATTESTATION_RETURN);

      // Wait for attestation
      const attestationResult = await this.attestation.waitForAttestation(
        messageHash,
        300, // max attempts
        5000 // delay in ms
      );

      // Update state
      this.stateManager.updateBridgeData(txId, { attestation: attestationResult });

      logger.info('Attestation received', { txId, messageHash });

      return attestationResult;
    } catch (error) {
      logger.error('Attestation failed', { txId, messageHash, error });
      throw error;
    }
  }

  /**
   * Step 4: Mint USDC on Stellar
   */
  private async mintUSDCOnStellar(
    txId: string,
    _messageHash: string,
    _attestation: string
  ): Promise<string> {
    try {
      logger.info('Step 4: Minting USDC on Stellar', { txId });
      
      this.stateManager.updateStep(txId, TransactionStep.USDC_MINT_STELLAR);

      // Note: This would require implementing CCTP mint on Stellar
      // For now, we create a placeholder
      const txHash = `stellar_mint_${Date.now()}`;

      // Update state
      this.stateManager.updateStellarTx(txId, 'mint', txHash);

      logger.info('USDC minted on Stellar', { txId, txHash });

      return txHash;
    } catch (error) {
      logger.error('USDC mint failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 5: Swap USDC to XLM
   */
  private async swapUSDCtoXLM(
    txId: string,
    usdcAmount: string,
    minXLMAmount?: string,
    slippagePercent: number = 1
  ): Promise<string> {
    try {
      logger.info('Step 5: Swapping USDC to XLM', { txId, usdcAmount });
      
      this.stateManager.updateStep(txId, TransactionStep.USDC_TO_XLM_SWAP);

      // Get quote for USDC to XLM swap
      const usdcAsset = this.stellarClient.getUSDCAsset();
      const xlmAsset = StellarSdk.Asset.native();
      const quote = await this.stellarSwap.getSwapQuote(
        usdcAmount,
        usdcAsset,
        xlmAsset // XLM (native asset) is the destination
      );

      // Calculate minimum output with slippage tolerance
      const calculatedMin = this.stellarSwap.calculateMinOutput(
        quote.outputAmount,
        slippagePercent
      );

      // If user provided a minimum, validate it's achievable
      if (minXLMAmount && parseFloat(minXLMAmount) > parseFloat(quote.outputAmount)) {
        logger.warn('User-provided minXLMAmount exceeds expected output', {
          minXLMAmount,
          expectedOutput: quote.outputAmount,
          usingCalculatedMin: calculatedMin,
        });
      }

      // Use the calculated minimum (safer) or user's minimum if it's lower
      let minOutput = calculatedMin;
      if (minXLMAmount && parseFloat(minXLMAmount) < parseFloat(calculatedMin)) {
        minOutput = minXLMAmount;
      }

      // Execute swap
      const txHash = await this.stellarSwap.swapUSDCtoXLM(
        usdcAmount,
        minOutput
      );

      // Update state with actual expected amount
      this.stateManager.updateStellarTx(txId, 'returnSwap', txHash);
      this.stateManager.updateAmounts(txId, {
        xlmReturned: quote.outputAmount,
      });

      logger.info('USDC to XLM swap completed', {
        txId,
        txHash,
        xlmReceived: quote.outputAmount,
      });

      return quote.outputAmount;
    } catch (error) {
      logger.error('USDC to XLM swap failed', { txId, error });
      throw error;
    }
  }

  /**
   * Calculate profit from yield
   */
  private async calculateProfit(
    txId: string,
    finalXLM: string
  ): Promise<string | undefined> {
    try {
      const state = this.stateManager.getState(txId);
      if (!state || !state.amounts.xlmDeposit) {
        return undefined;
      }

      const initial = parseFloat(state.amounts.xlmDeposit);
      const final = parseFloat(finalXLM);
      const profit = final - initial;

      return profit > 0 ? profit.toFixed(7) : '0';
    } catch (error) {
      logger.error('Failed to calculate profit', error);
      return undefined;
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

  /**
   * Estimate withdrawal time
   */
  async estimateWithdrawalTime(useDelayedUnstake: boolean): Promise<number> {
    // Liquid unstake: ~20 minutes (attestation + swaps)
    // Delayed unstake: add ~2-3 days for epoch end
    
    const baseTime = 20 * 60 * 1000; // 20 minutes in ms
    const delayedTime = useDelayedUnstake ? 3 * 24 * 60 * 60 * 1000 : 0; // 3 days
    
    return baseTime + delayedTime;
  }

  /**
   * Check if withdrawal is possible
   */
  async canWithdraw(mSolAmount: string): Promise<{
    possible: boolean;
    reason?: string;
  }> {
    try {
      const balance = await this.marinade.getMSolBalance();
      const required = parseFloat(mSolAmount);

      if (balance < required) {
        return {
          possible: false,
          reason: `Insufficient mSOL balance. Have ${balance}, need ${required}`,
        };
      }

      return { possible: true };
    } catch (error: any) {
      return {
        possible: false,
        reason: error.message,
      };
    }
  }
}

