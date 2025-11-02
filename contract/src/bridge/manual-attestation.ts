import { BridgeAttestationProvider } from './attestation-provider';
import { AttestationResponse, BridgeStatus } from './types';
import { logger } from '../utils/logger';

/**
 * Manual attestation provider for custom bridges.
 * Resolves immediately and expects the caller to handle finality off-chain.
 */
export class ManualAttestationService implements BridgeAttestationProvider {
  async waitForAttestation(messageHash: string): Promise<string> {
    logger.warn('Manual attestation mode enabled; skipping remote attestation polling.', {
      messageHash,
    });

    // Return a deterministic placeholder so downstream steps still receive a value.
    return `0xmanual_${messageHash}`;
  }

  async getAttestation(messageHash: string): Promise<AttestationResponse> {
    return {
      status: 'complete',
      attestation: `0xmanual_${messageHash}`,
      messageHash,
    };
  }

  async getBridgeStatus(sourceTxHash: string, messageHash: string): Promise<BridgeStatus> {
    return {
      sourceTxHash,
      messageHash,
      status: 'completed',
      attestation: `0xmanual_${messageHash}`,
      timestamp: new Date(),
    };
  }

  async verifyAttestation(messageHash: string, attestation: string): Promise<boolean> {
    logger.warn('Manual attestation verification is a no-op. Ensure your custom bridge verifies finality.', {
      messageHash,
      attestationPreview: attestation.slice(0, 16),
    });
    return true;
  }
}
