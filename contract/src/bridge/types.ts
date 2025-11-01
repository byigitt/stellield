/**
 * CCTP bridge message types and utilities
 */

export interface CCTPMessage {
  version: number;
  sourceDomain: number;
  destinationDomain: number;
  nonce: string;
  sender: string;
  recipient: string;
  destinationCaller: string;
  messageBody: string;
}

export interface AttestationResponse {
  status: 'pending' | 'complete' | 'failed';
  attestation?: string;
  messageHash: string;
}

export enum ChainDomain {
  Ethereum = 0,
  Avalanche = 1,
  Optimism = 2,
  Arbitrum = 3,
  Solana = 5,
  Base = 6,
  Polygon = 7,
}

export interface BridgeStatus {
  sourceTxHash: string;
  messageHash: string;
  status: 'initiated' | 'attested' | 'completed' | 'failed';
  attestation?: string;
  destinationTxHash?: string;
  timestamp: Date;
}

