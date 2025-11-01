/**
 * Shared TypeScript types for the cross-chain yield aggregator
 */

export interface StellarConfig {
  network: 'testnet' | 'mainnet';
  horizonUrl: string;
  privateKey: string;
  cctpTokenMessenger?: string;
  usdcAddress: string;
}

export interface SolanaConfig {
  network: 'devnet' | 'testnet' | 'mainnet-beta';
  rpcUrl: string;
  privateKey: string;
  cctpTokenMessenger?: string;
  usdcMint: string;
}

export interface BridgeConfig {
  circleAttestationApi: string;
}

export interface MarinadeConfig {
  programId: string;
}

export interface AppConfig {
  stellar: StellarConfig;
  solana: SolanaConfig;
  bridge: BridgeConfig;
  marinade: MarinadeConfig;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionStep {
  // Deposit flow
  XLM_RECEIVED = 'XLM_RECEIVED',
  XLM_TO_USDC_SWAP = 'XLM_TO_USDC_SWAP',
  USDC_BURN_STELLAR = 'USDC_BURN_STELLAR',
  BRIDGE_ATTESTATION = 'BRIDGE_ATTESTATION',
  USDC_MINT_SOLANA = 'USDC_MINT_SOLANA',
  MARINADE_STAKE = 'MARINADE_STAKE',
  
  // Withdrawal flow
  MARINADE_UNSTAKE = 'MARINADE_UNSTAKE',
  USDC_BURN_SOLANA = 'USDC_BURN_SOLANA',
  BRIDGE_ATTESTATION_RETURN = 'BRIDGE_ATTESTATION_RETURN',
  USDC_MINT_STELLAR = 'USDC_MINT_STELLAR',
  USDC_TO_XLM_SWAP = 'USDC_TO_XLM_SWAP',
  XLM_RETURNED = 'XLM_RETURNED',
}

export interface TransactionState {
  id: string;
  status: TransactionStatus;
  currentStep: TransactionStep;
  userAddress: string;
  amount: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Stellar transaction hashes
  stellarTxHashes: {
    deposit?: string;
    swap?: string;
    burn?: string;
    mint?: string;
    returnSwap?: string;
  };
  
  // Solana transaction signatures
  solanaTxSignatures: {
    mint?: string;
    stake?: string;
    unstake?: string;
    burn?: string;
  };
  
  // Bridge data
  bridgeData?: {
    messageHash?: string;
    attestation?: string;
  };
  
  // Amounts at each step
  amounts: {
    xlmDeposit?: string;
    usdcAfterSwap?: string;
    usdcBridged?: string;
    mSolReceived?: string;
    usdcFromUnstake?: string;
    xlmReturned?: string;
  };
  
  error?: string;
}

export interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  priceImpact: string;
  route: string[];
}

export interface BridgeMessage {
  messageHash: string;
  attestation?: string;
  sourceDomain: number;
  destinationDomain: number;
  nonce: string;
  sender: string;
  recipient: string;
  amount: string;
}

