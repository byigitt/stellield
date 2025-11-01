/**
 * Example: Deposit flow
 * Demonstrates the full deposit process: XLM → USDC → Bridge → Stake
 */

import { DepositOrchestrator } from '../src/orchestrator/deposit';
import { logger, LogLevel } from '../src/utils/logger';

// Set verbose logging for examples
logger.setLogLevel(LogLevel.DEBUG);

async function runDepositExample() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     Stellar-Solana Cross-Chain Deposit Example         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log();

  try {
    // Initialize orchestrator
    logger.info('Initializing deposit orchestrator...');
    const orchestrator = new DepositOrchestrator();

    // Define deposit parameters
    const depositOptions = {
      xlmAmount: '1', // 1 XLM (reduced for low testnet balance)
      minUSDCAmount: '0.5', // Minimum 0.5 USDC expected
      slippagePercent: 1, // 1% slippage tolerance
      skipStaking: false, // Don't skip staking (go all the way)
    };

    logger.info('Deposit parameters:', depositOptions);
    console.log();
    console.log('⚠️  IMPORTANT: This is a PoC on TESTNET/DEVNET');
    console.log('⚠️  Make sure you have:');
    console.log('    - Stellar testnet account with XLM');
    console.log('    - Solana devnet account with SOL');
    console.log('    - Proper configuration in .env file');
    console.log();

    // Ask for confirmation (in production)
    logger.info('Starting deposit flow...');
    console.log('═══════════════════════════════════════════════════════');
    console.log();

    // Execute deposit
    const result = await orchestrator.executeDeposit(depositOptions);

    console.log();
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Deposit completed successfully!');
    console.log();
    console.log('Transaction ID:', result.transactionId);
    console.log('Status:', result.state.status);
    console.log('Current Step:', result.state.currentStep);
    console.log();
    console.log('Amounts:');
    console.log('  XLM Deposited:', result.state.amounts.xlmDeposit);
    console.log('  USDC After Swap:', result.state.amounts.usdcAfterSwap);
    console.log('  USDC Bridged:', result.state.amounts.usdcBridged);
    console.log('  mSOL Received:', result.finalMSolAmount);
    console.log();
    console.log('Estimated Annual Yield:', result.totalYieldPotential);
    console.log();
    console.log('Transaction Hashes:');
    console.log('  Stellar Swap:', result.state.stellarTxHashes.swap);
    console.log('  Stellar Burn:', result.state.stellarTxHashes.burn);
    console.log('  Solana Mint:', result.state.solanaTxSignatures.mint);
    console.log('  Solana Stake:', result.state.solanaTxSignatures.stake);
    console.log();
    console.log('Bridge:');
    console.log('  Message Hash:', result.state.bridgeData?.messageHash);
    console.log('  Attestation:', result.state.bridgeData?.attestation?.slice(0, 20) + '...');
    console.log();
    console.log('═══════════════════════════════════════════════════════');

    // Export state for later withdrawal
    const stateJson = orchestrator.getStateManager().exportState(result.transactionId);
    logger.debug('Transaction state (for withdrawal):', stateJson);

  } catch (error: any) {
    console.log();
    console.log('═══════════════════════════════════════════════════════');
    console.log('❌ Deposit failed!');
    console.log();
    console.log('Error:', error.message);
    console.log();
    if (error.stack) {
      logger.debug('Stack trace:', error.stack);
    }
    console.log('═══════════════════════════════════════════════════════');
    process.exit(1);
  }
}

// Run the example
runDepositExample().catch((error) => {
  logger.error('Unhandled error in deposit example', error);
  process.exit(1);
});

