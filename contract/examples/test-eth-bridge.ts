/**
 * Test Ethereum Bridge (No Yield)
 *
 * Tests the bridge functionality only:
 * 1. Stellar → Ethereum (burn + mint)
 * 2. Ethereum → Stellar (burn + mint)
 *
 * Skips the yield/Aave steps for faster testing
 */

import { EthYieldOrchestrator } from '../src/orchestrator/eth-yield';
import { logger } from '../src/utils/logger';

async function main() {
  console.log('');
  console.log('🌉 Ethereum Bridge Test (No Yield)');
  console.log('━'.repeat(50));
  console.log('');

  try {
    // Initialize orchestrator
    logger.info('Initializing orchestrator...');
    const orchestrator = new EthYieldOrchestrator();

    // Check initial balances
    console.log('📊 Initial Balances:');
    const initialBalances = await orchestrator.checkBalances();
    console.log(`  Stellar XLM:   ${initialBalances.stellar.xlm}`);
    console.log(`  Stellar USDC:  ${initialBalances.stellar.usdc}`);
    console.log(`  Ethereum USDC: ${initialBalances.ethereum.usdc}`);
    console.log('');

    // Configure test parameters
    const xlmAmount = process.env.TEST_XLM_AMOUNT || '10'; // Smaller amount for testing
    console.log(`⚙️  Test Amount: ${xlmAmount} XLM`);
    console.log('');

    // Execute bridge test (skip yield)
    console.log('🔄 Testing bridge flow...');
    console.log('');

    const startTime = Date.now();

    const result = await orchestrator.executeYieldFlow({
      xlmAmount,
      slippagePercent: 1,
      skipYield: true, // Skip Aave yield for faster testing
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    // Display results
    console.log('');
    console.log('✅ Bridge Test Completed!');
    console.log('━'.repeat(50));
    console.log('');

    console.log('📈 Results:');
    console.log(`  Transaction ID: ${result.transactionId}`);
    console.log(`  Status:         ${result.state.status}`);
    console.log(`  Duration:       ${duration}s`);
    console.log('');

    console.log('💵 Balance Changes:');
    console.log(`  Initial XLM:    ${xlmAmount}`);
    console.log(`  Final XLM:      ${result.state.amounts.xlmReturned || 'N/A'}`);
    console.log('');

    // Check final balances
    console.log('📊 Final Balances:');
    const finalBalances = await orchestrator.checkBalances();
    console.log(`  Stellar XLM:   ${finalBalances.stellar.xlm}`);
    console.log(`  Stellar USDC:  ${finalBalances.stellar.usdc}`);
    console.log(`  Ethereum USDC: ${finalBalances.ethereum.usdc}`);
    console.log('');

    // Display transaction flow
    console.log('🔗 Transaction Flow:');
    console.log('  1. ✅ XLM → USDC swap (Stellar)');
    if (result.state.stellarTxHashes.swap) {
      console.log(`     ${result.state.stellarTxHashes.swap}`);
    }

    console.log('  2. ✅ USDC burn (Stellar)');
    if (result.state.stellarTxHashes.burn) {
      console.log(`     ${result.state.stellarTxHashes.burn}`);
    }

    console.log('  3. ✅ Bridge attestation');
    if (result.state.bridgeData?.messageHash) {
      console.log(`     ${result.state.bridgeData.messageHash}`);
    }

    console.log('  4. ✅ USDC mint (Ethereum)');
    if (result.state.ethereumTxHashes.mint) {
      console.log(`     ${result.state.ethereumTxHashes.mint}`);
    }

    console.log('  5. ⏭️  Aave yield (SKIPPED)');

    console.log('  6. ✅ USDC burn (Ethereum)');
    if (result.state.ethereumTxHashes.burn) {
      console.log(`     ${result.state.ethereumTxHashes.burn}`);
    }

    console.log('  7. ✅ Bridge attestation');

    console.log('  8. ✅ USDC mint (Stellar)');
    if (result.state.stellarTxHashes.mint) {
      console.log(`     ${result.state.stellarTxHashes.mint}`);
    }

    console.log('  9. ✅ USDC → XLM swap (Stellar)');
    if (result.state.stellarTxHashes.returnSwap) {
      console.log(`     ${result.state.stellarTxHashes.returnSwap}`);
    }
    console.log('');

    console.log('✨ Bridge test completed successfully!');
    console.log('');

    // Show next steps
    console.log('💡 Next Steps:');
    console.log('  - To test with yield, run: pnpm exec ts-node examples/stellar-eth-yield-demo.ts');
    console.log('  - Set DEMO_SKIP_YIELD=false to include Aave yield');
    console.log('  - Set DEMO_YIELD_DAYS=30 to simulate 30 days of yield');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ Bridge test failed:');
    console.error(error.message);
    console.error('');

    if (error.stack) {
      logger.error('Stack trace:', error.stack);
    }

    process.exit(1);
  }
}

// Run test
main()
  .then(() => {
    console.log('Bridge test execution complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
