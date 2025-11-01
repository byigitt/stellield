/**
 * Main entry point for Stellar-Ethereum Cross-Chain Yield Bridge
 */

import { EthYieldOrchestrator } from './orchestrator/eth-yield';
import { StellarToEthOrchestrator } from './orchestrator/stellar-to-eth';
import { logger, LogLevel } from './utils/logger';

// Set log level from environment or default to INFO
const logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
logger.setLogLevel(logLevel);

// Export main components
export { EthYieldOrchestrator, StellarToEthOrchestrator };
export { StellarClient } from './stellar/client';
export { StellarSwap } from './stellar/swap';
export { StellarCCTPBurn } from './stellar/cctp-burn';
export { EthereumClient } from './ethereum/client';
export { AaveV3Service } from './ethereum/aave';
export { CircleAttestationService } from './bridge/attestation';
export { StateManager } from './orchestrator/state';
export * from './types';

/**
 * Example usage
 */
async function main() {
  try {
    logger.info('Stellar-Ethereum Cross-Chain Yield Bridge');
    logger.info('==========================================');
    logger.info('');
    logger.info('This is a PoC for cross-chain yield generation with Aave V3.');
    logger.info('');
    logger.info('Flow:');
    logger.info('1. XLM → USDC (Stellar swap)');
    logger.info('2. USDC burn on Stellar → Bridge (CCTP) → USDC mint on Ethereum');
    logger.info('3. Supply USDC to Aave V3 → Earn yield');
    logger.info('4. Withdraw from Aave V3 → USDC burn on Ethereum');
    logger.info('5. Bridge back → USDC mint on Stellar → USDC → XLM');
    logger.info('');
    logger.info('See examples/ directory for usage examples.');
    logger.info('');
    logger.info('Run: pnpm demo or pnpm demo:bridge');
  } catch (error) {
    logger.error('Error in main', error);
    process.exit(1);
  }
}

// Run main if this file is executed directly
if (require.main === module) {
  main();
}
