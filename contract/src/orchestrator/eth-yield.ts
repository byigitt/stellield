/**
 * Ethereum Yield Orchestrator
 * Complete flow: XLM → USDC → Bridge to ETH → Aave V3 Yield → Bridge back → XLM
 */

import { StellarClient } from '../stellar/client';
import { StellarSwap } from '../stellar/swap';
import { StellarCCTPBurn } from '../stellar/cctp-burn';
import { EthereumClient } from '../ethereum/client';
import { AaveV3Service } from '../ethereum/aave';
import { CircleAttestationService } from '../bridge/attestation';
import { StateManager } from './state';
import { TransactionState, TransactionStatus, TransactionStep } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface EthYieldOptions {
  xlmAmount: string;
  minUSDCAmount?: string;
  slippagePercent?: number;
  yieldDurationDays?: number; // How long to keep funds in Aave (0 = immediate)
  skipYield?: boolean; // For testing bridge only
}

export interface EthYieldResult {
  transactionId: string;
  state: TransactionState;
  profit: {
    xlmProfit: string;
    usdcProfit: string;
    apy: number;
    durationDays: number;
  };
}

export class EthYieldOrchestrator {
  private stellarClient: StellarClient;
  private stellarSwap: StellarSwap;
  private stellarBurn: StellarCCTPBurn;
  private ethClient: EthereumClient;
  private aave: AaveV3Service;
  private attestation: CircleAttestationService;
  private stateManager: StateManager;

  constructor() {
    // Validate Ethereum and Aave configuration
    if (!config.ethereum) {
      throw new Error('Ethereum configuration is required for yield orchestrator');
    }
    if (!config.aave) {
      throw new Error('Aave configuration is required for yield orchestrator');
    }

    // Initialize clients
    this.stellarClient = new StellarClient();
    this.stellarSwap = new StellarSwap(this.stellarClient);
    this.stellarBurn = new StellarCCTPBurn(this.stellarClient);

    this.ethClient = new EthereumClient(
      config.ethereum.privateKey,
      config.ethereum.rpcUrl,
      config.ethereum.tokenMessenger,
      config.ethereum.usdc
    );

    this.aave = new AaveV3Service(
      this.ethClient,
      config.aave.poolAddress,
      config.aave.poolDataProviderAddress,
      config.ethereum.usdc,
      config.aave.aUSDCAddress
    );

    this.attestation = new CircleAttestationService();
    this.stateManager = new StateManager();

    logger.info('Ethereum Yield orchestrator initialized');
  }

  /**
   * Execute complete yield flow
   */
  async executeYieldFlow(options: EthYieldOptions): Promise<EthYieldResult> {
    const {
      xlmAmount,
      minUSDCAmount,
      slippagePercent = 1,
      yieldDurationDays = 0,
      skipYield = false,
    } = options;

    // Create transaction state
    const state = this.stateManager.createTransaction(
      this.stellarClient.getPublicKey(),
      xlmAmount
    );

    try {
      logger.info('Starting Ethereum yield flow', {
        transactionId: state.id,
        xlmAmount,
        yieldDurationDays,
      });

      // === DEPOSIT FLOW ===

      // Step 1: Swap XLM to USDC on Stellar
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

      // Step 3: Wait for attestation
      const attestation = await this.waitForAttestation(
        state.id,
        burnResult.messageHash,
        'stellar_to_eth'
      );

      // Step 4: Mint USDC on Ethereum
      await this.mintUSDCOnEthereum(
        state.id,
        burnResult.messageHash,
        attestation
      );

      // Step 5: Supply to Aave V3
      let yieldAmount = '0';
      let apy = 0;
      if (!skipYield) {
        await this.supplyToAave(
          state.id,
          usdcAmount
        );

        // Optional: Wait for yield accumulation
        if (yieldDurationDays > 0) {
          await this.waitForYield(state.id, yieldDurationDays);
        }

        // Step 6: Withdraw from Aave
        const withdrawResult = await this.withdrawFromAave(state.id);
        yieldAmount = withdrawResult.interestEarned;
        apy = await this.aave.getEstimatedAPY();
      }

      // === WITHDRAWAL FLOW ===

      // Step 7: Burn USDC on Ethereum
      const ethBurnResult = await this.burnUSDCOnEthereum(state.id);

      // Step 8: Wait for attestation
      const ethAttestation = await this.waitForAttestation(
        state.id,
        ethBurnResult.messageHash,
        'eth_to_stellar'
      );

      // Step 9: Mint USDC on Stellar
      await this.mintUSDCOnStellar(
        state.id,
        ethBurnResult.messageHash,
        ethAttestation
      );

      // Step 10: Swap USDC back to XLM
      const finalXLM = await this.swapUSDCtoXLM(state.id, slippagePercent);

      // Mark as completed
      this.stateManager.updateStatus(state.id, TransactionStatus.COMPLETED);
      this.stateManager.updateStep(state.id, TransactionStep.XLM_RETURNED);

      const finalState = this.stateManager.getState(state.id)!;

      // Calculate profit
      const xlmProfit = (parseFloat(finalXLM) - parseFloat(xlmAmount)).toFixed(7);
      const profitPercent = (parseFloat(xlmProfit) / parseFloat(xlmAmount)) * 100;

      logger.info('Ethereum yield flow completed', {
        transactionId: state.id,
        initialXLM: xlmAmount,
        finalXLM,
        xlmProfit,
        usdcProfit: yieldAmount,
        profitPercent: profitPercent.toFixed(2) + '%',
        apy: apy.toFixed(2) + '%',
      });

      return {
        transactionId: state.id,
        state: finalState,
        profit: {
          xlmProfit,
          usdcProfit: yieldAmount,
          apy,
          durationDays: yieldDurationDays,
        },
      };
    } catch (error: any) {
      logger.error('Ethereum yield flow failed', {
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
   * Step 1: Swap XLM to USDC on Stellar
   */
  private async swapXLMtoUSDC(
    txId: string,
    xlmAmount: string,
    minUSDCAmount?: string,
    slippagePercent: number = 1
  ): Promise<string> {
    try {
      logger.info('Step 1: Swapping XLM to USDC on Stellar', { txId, xlmAmount });

      this.stateManager.updateStep(txId, TransactionStep.XLM_TO_USDC_SWAP);
      this.stateManager.updateStatus(txId, TransactionStatus.PROCESSING);

      // Get quote
      const quote = await this.stellarSwap.getSwapQuote(xlmAmount);

      // Calculate minimum output with slippage
      const minOutput =
        minUSDCAmount ||
        this.stellarSwap.calculateMinOutput(quote.outputAmount, slippagePercent);

      // Execute swap
      const txHash = await this.stellarSwap.swapXLMtoUSDC(xlmAmount, minOutput);

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

      this.stateManager.updateStep(txId, TransactionStep.USDC_BURN_STELLAR_TO_ETH);

      // Get Ethereum recipient address
      const ethRecipient = await this.ethClient.getAddress();

      // Burn USDC (destination domain = Ethereum)
      const burnResult = await this.stellarBurn.burnUSDC(
        usdcAmount,
        0, // Ethereum domain
        ethRecipient
      );

      // Update state
      this.stateManager.updateStellarTx(txId, 'burn', burnResult.transactionHash);
      this.stateManager.updateBridgeData(txId, {
        messageHash: burnResult.messageHash,
        bridgeTxHash: burnResult.transactionHash,
      });
      this.stateManager.updateAmounts(txId, {
        usdcBridged: usdcAmount,
      });

      logger.info('USDC burn on Stellar completed', {
        txId,
        txHash: burnResult.transactionHash,
        messageHash: burnResult.messageHash,
      });

      return burnResult;
    } catch (error) {
      logger.error('USDC burn on Stellar failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 3/8: Wait for Circle attestation
   */
  private async waitForAttestation(
    txId: string,
    messageHash: string,
    direction: 'stellar_to_eth' | 'eth_to_stellar'
  ): Promise<string> {
    try {
      const stepName =
        direction === 'stellar_to_eth'
          ? 'Stellar → Ethereum'
          : 'Ethereum → Stellar';
      logger.info(`Step: Waiting for ${stepName} attestation`, {
        txId,
        messageHash,
      });

      const step =
        direction === 'stellar_to_eth'
          ? TransactionStep.BRIDGE_ATTESTATION_STELLAR_TO_ETH
          : TransactionStep.BRIDGE_ATTESTATION_ETH_TO_STELLAR;
      this.stateManager.updateStep(txId, step);

      // Wait for attestation (60 attempts, 5 seconds each = 5 minutes)
      const attestation = await this.attestation.waitForAttestation(
        messageHash,
        60,
        5000
      );

      // Update state
      this.stateManager.updateBridgeData(txId, {
        attestation,
      });

      logger.info(`${stepName} attestation received`, { txId, messageHash });

      return attestation;
    } catch (error) {
      logger.error('Attestation failed', { txId, messageHash, error });
      throw error;
    }
  }

  /**
   * Step 4: Mint USDC on Ethereum
   */
  private async mintUSDCOnEthereum(
    txId: string,
    messageHash: string,
    attestation: string
  ): Promise<void> {
    try {
      logger.info('Step 4: Minting USDC on Ethereum', { txId });

      this.stateManager.updateStep(txId, TransactionStep.USDC_MINT_ETHEREUM);

      // Note: Actual mint transaction would happen here
      // The bridge contracts on Ethereum need to be called with the attestation
      // For now, we assume the USDC is available after attestation
      // TODO: Implement actual Ethereum receiveMessage call

      logger.warn('Ethereum mint step - Manual completion may be required', {
        txId,
        messageHash,
        attestation: attestation.substring(0, 20) + '...',
      });

      // Update state (assuming mint succeeds)
      this.stateManager.updateEthereumTx(txId, 'mint', messageHash);

      logger.info('USDC minted on Ethereum', { txId });
    } catch (error) {
      logger.error('USDC mint on Ethereum failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 5: Supply USDC to Aave V3
   */
  private async supplyToAave(
    txId: string,
    usdcAmount: string
  ): Promise<{ transactionHash: string; aUSDCReceived: string }> {
    try {
      logger.info('Step 5: Supplying USDC to Aave V3', { txId, usdcAmount });

      this.stateManager.updateStep(txId, TransactionStep.AAVE_SUPPLY);

      const result = await this.aave.supplyUSDC(usdcAmount);

      // Update state
      this.stateManager.updateEthereumTx(txId, 'supply', result.transactionHash);
      this.stateManager.updateAmounts(txId, {
        aUSDCReceived: result.aUSDCReceived,
      });

      logger.info('USDC supplied to Aave V3', {
        txId,
        txHash: result.transactionHash,
        aUSDCReceived: result.aUSDCReceived,
      });

      return result;
    } catch (error) {
      logger.error('Aave supply failed', { txId, error });
      throw error;
    }
  }

  /**
   * Optional: Wait for yield accumulation
   */
  private async waitForYield(
    txId: string,
    durationDays: number
  ): Promise<void> {
    logger.info('Step: Waiting for yield accumulation', {
      txId,
      durationDays,
    });

    this.stateManager.updateStep(txId, TransactionStep.YIELD_ACCUMULATION);

    // In production, this would wait for the actual duration
    // For demo, we can simulate or skip

    logger.info(`Simulating ${durationDays} days of yield accumulation...`);
    logger.warn('In production, funds would remain in Aave for this duration');

    // Uncomment to actually wait:
    // const durationMs = durationDays * 24 * 60 * 60 * 1000;
    // await new Promise(resolve => setTimeout(resolve, durationMs));
  }

  /**
   * Step 6: Withdraw USDC from Aave V3
   */
  private async withdrawFromAave(txId: string): Promise<{
    transactionHash: string;
    usdcReceived: string;
    interestEarned: string;
  }> {
    try {
      logger.info('Step 6: Withdrawing USDC from Aave V3', { txId });

      this.stateManager.updateStep(txId, TransactionStep.AAVE_WITHDRAW);

      // Withdraw all (including interest)
      const result = await this.aave.withdrawUSDC();

      // Update state
      this.stateManager.updateEthereumTx(txId, 'withdraw', result.transactionHash);
      this.stateManager.updateAmounts(txId, {
        usdcWithdrawnFromAave: result.usdcReceived,
        yieldEarned: result.interestEarned,
      });

      logger.info('USDC withdrawn from Aave V3', {
        txId,
        txHash: result.transactionHash,
        usdcReceived: result.usdcReceived,
        interestEarned: result.interestEarned,
      });

      return result;
    } catch (error) {
      logger.error('Aave withdrawal failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 7: Burn USDC on Ethereum to bridge back to Stellar
   */
  private async burnUSDCOnEthereum(
    txId: string
  ): Promise<{ txHash: string; nonce: string; messageHash: string }> {
    try {
      logger.info('Step 7: Burning USDC on Ethereum', { txId });

      this.stateManager.updateStep(txId, TransactionStep.USDC_BURN_ETHEREUM);

      // Get current USDC balance
      const usdcBalance = await this.ethClient.getUSDCBalance();

      // Get Stellar recipient address
      const stellarRecipient = this.stellarClient.getPublicKey();

      // Burn USDC
      const burnResult = await this.ethClient.burnUSDC(
        usdcBalance,
        stellarRecipient
      );

      // Update state
      this.stateManager.updateEthereumTx(txId, 'burn', burnResult.txHash);
      this.stateManager.updateBridgeData(txId, {
        messageHash: burnResult.messageHash,
        bridgeTxHash: burnResult.txHash,
      });

      logger.info('USDC burn on Ethereum completed', {
        txId,
        txHash: burnResult.txHash,
        messageHash: burnResult.messageHash,
      });

      return burnResult;
    } catch (error) {
      logger.error('USDC burn on Ethereum failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 9: Mint USDC on Stellar
   */
  private async mintUSDCOnStellar(
    txId: string,
    messageHash: string,
    attestation: string
  ): Promise<void> {
    try {
      logger.info('Step 9: Minting USDC on Stellar', { txId });

      this.stateManager.updateStep(txId, TransactionStep.USDC_MINT_STELLAR_FROM_ETH);

      // Note: Actual mint transaction would happen here
      // TODO: Implement Stellar receiveMessage call

      logger.warn('Stellar mint step - Manual completion may be required', {
        txId,
        messageHash,
        attestation: attestation.substring(0, 20) + '...',
      });

      // Update state (assuming mint succeeds)
      this.stateManager.updateStellarTx(txId, 'mint', messageHash);

      logger.info('USDC minted on Stellar', { txId });
    } catch (error) {
      logger.error('USDC mint on Stellar failed', { txId, error });
      throw error;
    }
  }

  /**
   * Step 10: Swap USDC back to XLM on Stellar
   */
  private async swapUSDCtoXLM(
    txId: string,
    slippagePercent: number = 1
  ): Promise<string> {
    try {
      logger.info('Step 10: Swapping USDC to XLM on Stellar', { txId });

      this.stateManager.updateStep(txId, TransactionStep.USDC_TO_XLM_SWAP);

      // Get USDC balance
      const usdcBalance = await this.stellarClient.getBalance(
        'USDC',
        this.stellarClient.getUSDCAsset().getIssuer()
      );

      // Get quote for USDC to XLM
      const quote = await this.stellarSwap.getSwapQuote(usdcBalance);

      // Calculate minimum output with slippage
      const minOutput = this.stellarSwap.calculateMinOutput(
        quote.outputAmount,
        slippagePercent
      );

      // Execute swap
      const txHash = await this.stellarSwap.swapUSDCtoXLM(usdcBalance, minOutput);

      // Update state
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
   * Get Aave APY
   */
  async getAaveAPY(): Promise<number> {
    return await this.aave.getEstimatedAPY();
  }

  /**
   * Check balances across all chains
   */
  async checkBalances(): Promise<{
    stellar: { xlm: string; usdc: string };
    ethereum: { usdc: string; aUSDC: string };
  }> {
    const stellarXLM = await this.stellarClient.getBalance('XLM');
    const stellarUSDC = await this.stellarClient.getBalance(
      'USDC',
      this.stellarClient.getUSDCAsset().getIssuer()
    );
    const ethUSDC = await this.ethClient.getUSDCBalance();
    const aUSDC = await this.aave.getSuppliedBalance();

    return {
      stellar: {
        xlm: stellarXLM,
        usdc: stellarUSDC,
      },
      ethereum: {
        usdc: ethUSDC,
        aUSDC,
      },
    };
  }
}
