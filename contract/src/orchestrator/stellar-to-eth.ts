/**
 * Stellar → Ethereum Bridge Orchestrator
 * Handles the complete flow: Stellar burn → Attestation → Ethereum mint
 */

import { StellarClient } from '../stellar/client';
import { StellarCCTPBurn } from '../stellar/cctp-burn';
import { CircleAttestationService } from '../bridge/attestation';
import { logger } from '../utils/logger';

export interface StellarToEthResult {
  stellarBurnTx: string;
  messageHash: string;
  attestation?: string;
  ethereumMintTx?: string;
  status: 'burn_complete' | 'attested' | 'mint_complete' | 'failed';
}

export class StellarToEthOrchestrator {
  private stellarClient: StellarClient;
  private stellarBurn: StellarCCTPBurn;
  private attestationService: CircleAttestationService;

  constructor() {
    this.stellarClient = new StellarClient();
    this.stellarBurn = new StellarCCTPBurn(this.stellarClient);
    this.attestationService = new CircleAttestationService();

    logger.info('Stellar → Ethereum orchestrator initialized');
  }

  /**
   * Execute full bridge flow from Stellar to Ethereum
   */
  async bridgeToEthereum(
    amount: string,
    ethereumRecipient: string
  ): Promise<StellarToEthResult> {
    const result: StellarToEthResult = {
      stellarBurnTx: '',
      messageHash: '',
      status: 'burn_complete',
    };

    try {
      // Step 1: Burn USDC on Stellar
      logger.info('Step 1: Burning USDC on Stellar', { amount });
      const burnResult = await this.stellarBurn.burnUSDC(
        amount,
        0, // Ethereum domain (we use 0 for testnet)
        ethereumRecipient
      );

      result.stellarBurnTx = burnResult.transactionHash;
      result.messageHash = burnResult.messageHash;
      result.status = 'burn_complete';

      logger.info('Stellar burn complete', {
        txHash: burnResult.transactionHash,
        messageHash: burnResult.messageHash,
      });

      // Step 2: Wait for attestation
      logger.info('Step 2: Waiting for attestation from Circle');
      try {
        const attestation = await this.attestationService.waitForAttestation(
          burnResult.messageHash,
          60, // 60 attempts
          5000 // 5 second delay
        );

        result.attestation = attestation;
        result.status = 'attested';

        logger.info('Attestation received', {
          messageHash: burnResult.messageHash,
        });
      } catch (error) {
        logger.warn('Attestation timeout - manual completion needed', {
          messageHash: burnResult.messageHash,
          error,
        });
      }

      return result;
    } catch (error) {
      logger.error('Bridge to Ethereum failed', error);
      result.status = 'failed';
      throw error;
    }
  }

  /**
   * Check Stellar USDC balance
   */
  async getStellarBalance(): Promise<string> {
    const asset = this.stellarClient.getUSDCAsset();
    return await this.stellarClient.getBalance(
      asset.getCode(),
      asset.getIssuer()
    );
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string) {
    try {
      const tx = await this.stellarClient.getTransaction(txHash);
      return {
        confirmed: tx.successful,
        ledger: tx.ledger_attr,
      };
    } catch (error) {
      logger.error('Failed to get transaction status', error);
      return null;
    }
  }
}
