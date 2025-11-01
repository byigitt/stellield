/**
 * Circle attestation service for CCTP bridge
 * Polls Circle's API to get attestations for burn transactions
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AttestationResponse, BridgeStatus } from './types';

export class CircleAttestationService {
  private client: AxiosInstance;
  private apiUrl: string;

  constructor() {
    this.apiUrl = config.bridge.circleAttestationApi;
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('Circle attestation service initialized', {
      apiUrl: this.apiUrl,
    });
  }

  /**
   * Get attestation for a message hash
   */
  async getAttestation(messageHash: string): Promise<AttestationResponse> {
    try {
      logger.debug('Fetching attestation', { messageHash });

      const response = await this.client.get(
        `/attestations/${messageHash}`
      );

      const { status, attestation } = response.data;

      logger.debug('Attestation response received', {
        messageHash,
        status,
        hasAttestation: !!attestation,
      });

      return {
        status,
        attestation,
        messageHash,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.debug('Attestation not yet available', { messageHash });
        return {
          status: 'pending',
          messageHash,
        };
      }

      logger.error('Failed to fetch attestation', {
        messageHash,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Poll for attestation until it's available or timeout
   */
  async waitForAttestation(
    messageHash: string,
    maxAttempts: number = 60,
    delayMs: number = 5000
  ): Promise<string> {
    // Check if we're in mock mode (for testing)
    if (process.env.CCTP_MOCK_MODE === 'true') {
      logger.warn('⚠️  MOCK MODE: Using fake attestation for testing', {
        messageHash,
      });
      await this.sleep(2000); // Simulate small delay
      return this.generateMockAttestation(messageHash);
    }

    logger.info('Waiting for attestation', {
      messageHash,
      maxAttempts,
      delayMs,
    });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.getAttestation(messageHash);

        if (result.status === 'complete' && result.attestation) {
          logger.info('Attestation received', {
            messageHash,
            attempt,
            attestation: result.attestation.slice(0, 20) + '...',
          });
          return result.attestation;
        }

        if (result.status === 'failed') {
          throw new Error(`Attestation failed for message ${messageHash}`);
        }

        // Still pending, wait and retry
        logger.debug('Attestation pending, retrying...', {
          attempt,
          maxAttempts,
          messageHash,
        });

        await this.sleep(delayMs);
      } catch (error: any) {
        if (attempt === maxAttempts) {
          logger.error('Max attempts reached waiting for attestation', {
            messageHash,
            attempts: maxAttempts,
          });
          throw new Error(
            `Failed to get attestation after ${maxAttempts} attempts`
          );
        }

        // Continue polling on errors (except on last attempt)
        await this.sleep(delayMs);
      }
    }

    throw new Error(
      `Attestation timeout after ${maxAttempts * delayMs}ms`
    );
  }

  /**
   * Generate a mock attestation for testing purposes
   * DO NOT USE IN PRODUCTION
   */
  private generateMockAttestation(messageHash: string): string {
    // Create a fake attestation signature
    // In production, this would be a real signature from Circle
    return '0x' + Buffer.from(`MOCK_ATTESTATION_${messageHash}`).toString('hex').padEnd(130, '0');
  }

  /**
   * Get bridge status for a transaction
   */
  async getBridgeStatus(
    sourceTxHash: string,
    messageHash: string
  ): Promise<BridgeStatus> {
    try {
      const attestationResponse = await this.getAttestation(messageHash);

      let status: BridgeStatus['status'] = 'initiated';
      
      if (attestationResponse.status === 'complete') {
        status = attestationResponse.attestation ? 'attested' : 'initiated';
      } else if (attestationResponse.status === 'failed') {
        status = 'failed';
      }

      return {
        sourceTxHash,
        messageHash,
        status,
        attestation: attestationResponse.attestation,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get bridge status', error);
      throw error;
    }
  }

  /**
   * Verify attestation signature (optional validation)
   */
  async verifyAttestation(
    messageHash: string,
    attestation: string
  ): Promise<boolean> {
    try {
      // In production, this would verify the attestation signature
      // against Circle's attestation service public keys
      
      logger.debug('Verifying attestation', {
        messageHash,
        attestationLength: attestation.length,
      });

      // Placeholder: In production, implement proper signature verification
      return attestation.length > 0;
    } catch (error) {
      logger.error('Failed to verify attestation', error);
      return false;
    }
  }

  /**
   * Get attestation with retry logic and exponential backoff
   */
  async getAttestationWithRetry(
    messageHash: string,
    maxRetries: number = 5
  ): Promise<AttestationResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.getAttestation(messageHash);
        return result;
      } catch (error: any) {
        lastError = error;
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        
        logger.warn('Attestation fetch failed, retrying...', {
          attempt: attempt + 1,
          maxRetries,
          backoffMs,
          error: error.message,
        });

        if (attempt < maxRetries - 1) {
          await this.sleep(backoffMs);
        }
      }
    }

    throw lastError || new Error('Failed to get attestation after retries');
  }

  /**
   * Check if message is ready for claiming on destination
   */
  async isReadyToClaim(messageHash: string): Promise<boolean> {
    try {
      const response = await this.getAttestation(messageHash);
      return response.status === 'complete' && !!response.attestation;
    } catch (error) {
      logger.error('Failed to check claim readiness', error);
      return false;
    }
  }

  /**
   * Get estimated time for attestation
   * Circle typically provides attestations within 10-20 minutes
   */
  getEstimatedAttestationTime(): number {
    // Return estimated time in milliseconds
    return 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Helper method to sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Parse message hash from transaction
   * This would extract the hash from transaction logs/events
   */
  parseMessageHashFromTx(_txData: any): string | null {
    try {
      // In production, parse the actual transaction data
      // to extract the MessageSent event and get the hash
      
      logger.debug('Parsing message hash from transaction');
      
      // Placeholder implementation
      return null;
    } catch (error) {
      logger.error('Failed to parse message hash', error);
      return null;
    }
  }

  /**
   * Bulk fetch attestations for multiple message hashes
   */
  async getAttestations(
    messageHashes: string[]
  ): Promise<Map<string, AttestationResponse>> {
    const results = new Map<string, AttestationResponse>();

    await Promise.all(
      messageHashes.map(async (hash) => {
        try {
          const attestation = await this.getAttestation(hash);
          results.set(hash, attestation);
        } catch (error) {
          logger.error('Failed to fetch attestation in bulk', { hash, error });
        }
      })
    );

    return results;
  }
}

