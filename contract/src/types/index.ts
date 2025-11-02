/**
 * Shared TypeScript types for the cross-chain yield aggregator
 */

export interface StellarConfig {
  network: 'testnet' | 'mainnet';
  horizonUrl: string;
  privateKey: string;
  publicKey?: string;
  cctpTokenMessenger?: string;
  messageTransmitter?: string;
  usdcAddress: string;
}

export interface SolanaConfig {
  network: 'devnet' | 'testnet' | 'mainnet-beta';
  rpcUrl: string;
  privateKey: string;
  cctpTokenMessenger?: string;
  messageTransmitter?: string;
  usdcMint: string;
}

export interface EthereumConfig {
  rpcUrl: string;
  privateKey: string;
  chainId: number;
  usdc: string;
  tokenMessenger: string;
  messageTransmitter: string;
}

export interface AaveConfig {
  poolAddress: string;
  poolDataProviderAddress: string;
  aUSDCAddress: string;
}

export type BridgeProvider = 'circle' | 'manual';

export interface BridgeConfig {
  circleAttestationApi: string;
  provider: BridgeProvider;
}

export interface MarinadeConfig {
  programId: string;
}

export interface AllbridgeConfig {
  coreApiUrl: string;
  jupiterUrl: string;
  wormholeMessengerProgramId: string;
  solanaLookupTable: string;
  sorobanNetworkPassphrase: string;
  sorobanRpcUrl: string;
  trustlineLimit: string;
  stellarTokenSymbol: string;
  stellarTokenAddress?: string;
  solanaTokenSymbol: string;
  solanaTokenAddress?: string;
  statusPollIntervalMs: number;
  statusMaxAttempts: number;
}

export interface AppConfig {
  stellar: StellarConfig;
  solana?: SolanaConfig;
  ethereum?: EthereumConfig;
  bridge: BridgeConfig;
  marinade?: MarinadeConfig;
  aave?: AaveConfig;
  allbridge?: AllbridgeConfig;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionStep {
  // Deposit flow (Stellar → Solana)
  XLM_RECEIVED = 'XLM_RECEIVED',
  XLM_TO_USDC_SWAP = 'XLM_TO_USDC_SWAP',
  USDC_BURN_STELLAR = 'USDC_BURN_STELLAR',
  BRIDGE_ATTESTATION = 'BRIDGE_ATTESTATION',
  USDC_MINT_SOLANA = 'USDC_MINT_SOLANA',
  MARINADE_STAKE = 'MARINADE_STAKE',

  // Withdrawal flow (Solana → Stellar)
  MARINADE_UNSTAKE = 'MARINADE_UNSTAKE',
  USDC_BURN_SOLANA = 'USDC_BURN_SOLANA',
  BRIDGE_ATTESTATION_RETURN = 'BRIDGE_ATTESTATION_RETURN',
  USDC_MINT_STELLAR = 'USDC_MINT_STELLAR',
  USDC_TO_XLM_SWAP = 'USDC_TO_XLM_SWAP',
  XLM_RETURNED = 'XLM_RETURNED',

  // Ethereum yield flow (Stellar → Ethereum → Aave)
  USDC_BURN_STELLAR_TO_ETH = 'USDC_BURN_STELLAR_TO_ETH',
  BRIDGE_ATTESTATION_STELLAR_TO_ETH = 'BRIDGE_ATTESTATION_STELLAR_TO_ETH',
  USDC_MINT_ETHEREUM = 'USDC_MINT_ETHEREUM',
  AAVE_SUPPLY = 'AAVE_SUPPLY',
  YIELD_ACCUMULATION = 'YIELD_ACCUMULATION',
  AAVE_WITHDRAW = 'AAVE_WITHDRAW',
  USDC_BURN_ETHEREUM = 'USDC_BURN_ETHEREUM',
  BRIDGE_ATTESTATION_ETH_TO_STELLAR = 'BRIDGE_ATTESTATION_ETH_TO_STELLAR',
  USDC_MINT_STELLAR_FROM_ETH = 'USDC_MINT_STELLAR_FROM_ETH',
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

  // Ethereum transaction hashes
  ethereumTxHashes: {
    mint?: string;
    supply?: string;
    withdraw?: string;
    burn?: string;
  };

  // Bridge data
  bridgeData?: {
    messageHash?: string;
    attestation?: string;
    bridgeTxHash?: string;
    bridgeTransferId?: string;
    destinationTxHash?: string;
    expectedDestinationAmount?: string;
  };
  
  // Amounts at each step
  amounts: {
    xlmDeposit?: string;
    usdcAfterSwap?: string;
    usdcBridged?: string;
    mSolReceived?: string;
    usdcFromUnstake?: string;
    xlmReturned?: string;
    // Ethereum/Aave specific
    aUSDCReceived?: string;
    yieldEarned?: string;
    usdcWithdrawnFromAave?: string;
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

