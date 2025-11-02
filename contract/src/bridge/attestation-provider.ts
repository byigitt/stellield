import { AttestationResponse, BridgeStatus } from './types';

export interface BridgeAttestationProvider {
  waitForAttestation(
    messageHash: string,
    maxAttempts?: number,
    delayMs?: number
  ): Promise<string>;

  getAttestation?(messageHash: string): Promise<AttestationResponse>;

  getBridgeStatus?(
    sourceTxHash: string,
    messageHash: string
  ): Promise<BridgeStatus>;

  verifyAttestation?(messageHash: string, attestation: string): Promise<boolean>;
}
