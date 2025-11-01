/**
 * Example: Withdrawal flow
 * Demonstrates the full withdrawal process: Unstake → Bridge → Swap → XLM
 */

import { WithdrawOrchestrator } from '../src/orchestrator/withdraw';
import { logger, LogLevel } from '../src/utils/logger';

// Set verbose logging for examples
logger.setLogLevel(LogLevel.DEBUG);

async function runWithdrawExample() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║    Stellar-Solana Cross-Chain Withdrawal Example       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log();

  try {
    // Initialize orchestrator
    logger.info('Initializing withdrawal orchestrator...');
    const orchestrator = new WithdrawOrchestrator();

    // Define withdrawal parameters
    const withdrawOptions = {
      mSolAmount: '0.1', // 0.1 mSOL (reduced for low testnet balance)
      minXLMAmount: undefined, // Let the system calculate minimum based on slippage
      slippagePercent: 10, // 10% slippage tolerance (testnet has very high volatility/low liquidity)
      useDelayedUnstake: false, // Use liquid unstake (immediate, with small fee)
    };

    logger.info('Withdrawal parameters:', withdrawOptions);
    console.log();
    console.log('⚠️  IMPORTANT: This is a PoC on TESTNET/DEVNET');
    console.log('⚠️  Make sure you have:');
    console.log('    - mSOL tokens in your Solana wallet');
    console.log('    - Stellar testnet account configured');
    console.log('    - Proper configuration in .env file');
    console.log();

    // Check if withdrawal is possible
    logger.info('Checking withdrawal eligibility...');
    const canWithdraw = await orchestrator.canWithdraw(withdrawOptions.mSolAmount);
    
    if (!canWithdraw.possible) {
      console.log('❌ Cannot withdraw:', canWithdraw.reason);
      process.exit(1);
    }

    console.log('✅ Withdrawal check passed');
    console.log();

    // Estimate withdrawal time
    const estimatedTime = await orchestrator.estimateWithdrawalTime(
      withdrawOptions.useDelayedUnstake
    );
    console.log(`⏱️  Estimated time: ${Math.round(estimatedTime / 60000)} minutes`);
    console.log();

    logger.info('Starting withdrawal flow...');
    console.log('═══════════════════════════════════════════════════════');
    console.log();

    // Execute withdrawal
    const result = await orchestrator.executeWithdraw(withdrawOptions);

    console.log();
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Withdrawal completed successfully!');
    console.log();
    console.log('Transaction ID:', result.transactionId);
    console.log('Status:', result.state.status);
    console.log('Current Step:', result.state.currentStep);
    console.log();
    console.log('Amounts:');
    console.log('  mSOL Unstaked:', withdrawOptions.mSolAmount);
    console.log('  USDC From Unstake:', result.state.amounts.usdcFromUnstake);
    console.log('  XLM Returned:', result.finalXLMAmount);
    console.log();
    if (result.profitAmount) {
      console.log('💰 Profit (Yield):', result.profitAmount, 'XLM');
    }
    console.log();
    console.log('Transaction Signatures:');
    console.log('  Solana Unstake:', result.state.solanaTxSignatures.unstake);
    console.log('  Solana Burn:', result.state.solanaTxSignatures.burn);
    console.log('  Stellar Mint:', result.state.stellarTxHashes.mint);
    console.log('  Stellar Swap:', result.state.stellarTxHashes.returnSwap);
    console.log();
    console.log('Bridge:');
    console.log('  Message Hash:', result.state.bridgeData?.messageHash);
    console.log('  Attestation:', result.state.bridgeData?.attestation?.slice(0, 20) + '...');
    console.log();
    console.log('═══════════════════════════════════════════════════════');

  } catch (error: any) {
    console.log();
    console.log('═══════════════════════════════════════════════════════');
    console.log('❌ Withdrawal failed!');
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
runWithdrawExample().catch((error) => {
  logger.error('Unhandled error in withdrawal example', error);
  process.exit(1);
});

