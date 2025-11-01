/**
 * Main entry point for the Stellar-Solana Cross-Chain Yield Aggregator
 */

import { DepositOrchestrator } from './orchestrator/deposit';
import { WithdrawOrchestrator } from './orchestrator/withdraw';
import { logger, LogLevel } from './utils/logger';

// Set log level from environment or default to INFO
const logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
logger.setLogLevel(logLevel);

// Export main components
export { DepositOrchestrator, WithdrawOrchestrator };
export { StellarClient } from './stellar/client';
export { StellarSwap } from './stellar/swap';
export { StellarCCTPBurn } from './stellar/cctp-burn';
export { SolanaClient } from './solana/client';
export { SolanaCCTPMint } from './solana/cctp-mint';
export { MarinadeStaking } from './solana/marinade';
export { CircleAttestationService } from './bridge/attestation';
export { StateManager } from './orchestrator/state';
export * from './types';

/**
 * Example usage
 */
async function main() {
  try {
    logger.info('Stellar-Solana Cross-Chain Yield Aggregator');
    logger.info('===========================================');
    logger.info('');
    logger.info('This is a PoC for cross-chain yield generation.');
    logger.info('');
    logger.info('Flow:');
    logger.info('1. Deposit: XLM → USDC (Stellar DEX) → Bridge (CCTP) → Solana → Stake (Marinade)');
    logger.info('2. Withdraw: Unstake (Marinade) → Solana → Bridge (CCTP) → USDC → XLM (Stellar DEX)');
    logger.info('');
    logger.info('See examples/ directory for usage examples.');
    logger.info('');
    logger.info('Run: pnpm example:deposit or pnpm example:withdraw');
  } catch (error) {
    logger.error('Error in main', error);
    process.exit(1);
  }
}

// Run main if this file is executed directly
if (require.main === module) {
  main();
}

