/**
 * Stellar → Ethereum → Aave V3 Yield → Stellar Demo
 *
 * Complete automated yield flow:
 * 1. XLM → USDC (Stellar swap)
 * 2. USDC burn on Stellar
 * 3. Bridge attestation
 * 4. USDC mint on Ethereum
 * 5. Supply USDC to Aave V3
 * 6. Earn yield
 * 7. Withdraw USDC from Aave
 * 8. USDC burn on Ethereum
 * 9. Bridge attestation
 * 10. USDC mint on Stellar
 * 11. USDC → XLM (Stellar swap)
 * 12. Calculate profit
 */

import { EthYieldOrchestrator } from '../src/orchestrator/eth-yield';
import { logger } from '../src/utils/logger';
import { config } from '../src/config';

async function main() {
  console.log('');
  console.log('🚀 Stellar → ETH → Aave V3 Yield Demo');
  console.log('━'.repeat(50));
  console.log('');

  try {
    // Initialize orchestrator
    logger.info('Initializing Ethereum yield orchestrator...');
    const orchestrator = new EthYieldOrchestrator();

    // Check initial balances
    console.log('📊 Initial Balances:');
    const initialBalances = await orchestrator.checkBalances();
    console.log(`  Stellar XLM:  ${initialBalances.stellar.xlm}`);
    console.log(`  Stellar USDC: ${initialBalances.stellar.usdc}`);
    console.log(`  Ethereum USDC: ${initialBalances.ethereum.usdc}`);
    console.log(`  Aave aUSDC:    ${initialBalances.ethereum.aUSDC}`);
    console.log('');

    // Get Aave APY
    const apy = await orchestrator.getAaveAPY();
    console.log(`💰 Current Aave USDC APY: ${apy.toFixed(2)}%`);
    console.log('');

    // Configure yield parameters
    const xlmAmount = process.env.DEMO_XLM_AMOUNT || '100'; // Default 100 XLM
    const yieldDurationDays = parseInt(process.env.DEMO_YIELD_DAYS || '0', 10); // 0 = immediate
    const skipYield = process.env.DEMO_SKIP_YIELD === 'true';

    console.log('⚙️  Configuration:');
    console.log(`  XLM Amount:       ${xlmAmount}`);
    console.log(`  Yield Duration:   ${yieldDurationDays} days`);
    console.log(`  Skip Yield:       ${skipYield}`);
    console.log('');

    // Execute yield flow
    console.log('🔄 Starting yield flow...');
    console.log('');

    const startTime = Date.now();

    const result = await orchestrator.executeYieldFlow({
      xlmAmount,
      slippagePercent: 1,
      yieldDurationDays,
      skipYield,
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    // Display results
    console.log('');
    console.log('✅ Yield Flow Completed!');
    console.log('━'.repeat(50));
    console.log('');

    console.log('📈 Results:');
    console.log(`  Transaction ID:    ${result.transactionId}`);
    console.log(`  Status:            ${result.state.status}`);
    console.log(`  Duration:          ${duration}s`);
    console.log('');

    console.log('💵 Financial Summary:');
    console.log(`  Initial XLM:       ${xlmAmount}`);
    console.log(`  Final XLM:         ${result.state.amounts.xlmReturned || 'N/A'}`);
    console.log(`  XLM Profit:        ${result.profit.xlmProfit}`);
    console.log(`  USDC Yield:        ${result.profit.usdcProfit}`);
    console.log(`  APY:               ${result.profit.apy.toFixed(2)}%`);
    console.log(`  Duration:          ${result.profit.durationDays} days`);
    console.log('');

    // Calculate profit percentage
    const profitPercent =
      (parseFloat(result.profit.xlmProfit) / parseFloat(xlmAmount)) * 100;
    console.log(`📊 Profit Percentage: ${profitPercent.toFixed(2)}%`);
    console.log('');

    // Check final balances
    console.log('📊 Final Balances:');
    const finalBalances = await orchestrator.checkBalances();
    console.log(`  Stellar XLM:  ${finalBalances.stellar.xlm}`);
    console.log(`  Stellar USDC: ${finalBalances.stellar.usdc}`);
    console.log(`  Ethereum USDC: ${finalBalances.ethereum.usdc}`);
    console.log(`  Aave aUSDC:    ${finalBalances.ethereum.aUSDC}`);
    console.log('');

    // Display transaction hashes
    console.log('🔗 Transaction Hashes:');
    console.log('  Stellar:');
    if (result.state.stellarTxHashes.swap) {
      console.log(`    Swap (XLM→USDC):  ${result.state.stellarTxHashes.swap}`);
    }
    if (result.state.stellarTxHashes.burn) {
      console.log(`    Burn:             ${result.state.stellarTxHashes.burn}`);
    }
    if (result.state.stellarTxHashes.mint) {
      console.log(`    Mint:             ${result.state.stellarTxHashes.mint}`);
    }
    if (result.state.stellarTxHashes.returnSwap) {
      console.log(`    Swap (USDC→XLM):  ${result.state.stellarTxHashes.returnSwap}`);
    }

    console.log('  Ethereum:');
    if (result.state.ethereumTxHashes.mint) {
      console.log(`    Mint:             ${result.state.ethereumTxHashes.mint}`);
    }
    if (result.state.ethereumTxHashes.supply) {
      console.log(`    Aave Supply:      ${result.state.ethereumTxHashes.supply}`);
    }
    if (result.state.ethereumTxHashes.withdraw) {
      console.log(`    Aave Withdraw:    ${result.state.ethereumTxHashes.withdraw}`);
    }
    if (result.state.ethereumTxHashes.burn) {
      console.log(`    Burn:             ${result.state.ethereumTxHashes.burn}`);
    }
    console.log('');

    // Display bridge data
    if (result.state.bridgeData) {
      console.log('🌉 Bridge Data:');
      if (result.state.bridgeData.messageHash) {
        console.log(`    Message Hash:     ${result.state.bridgeData.messageHash}`);
      }
      if (result.state.bridgeData.attestation) {
        console.log(`    Attestation:      ${result.state.bridgeData.attestation.substring(0, 20)}...`);
      }
      console.log('');
    }

    console.log('✨ Demo completed successfully!');
    console.log('');

    // Export state for debugging
    const stateJson = orchestrator.getStateManager().exportState(result.transactionId);
    logger.debug('Transaction state:', JSON.parse(stateJson));

  } catch (error: any) {
    console.error('');
    console.error('❌ Demo failed:');
    console.error(error.message);
    console.error('');

    if (error.stack) {
      logger.error('Stack trace:', error.stack);
    }

    process.exit(1);
  }
}

// Run demo
main()
  .then(() => {
    console.log('Demo execution complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
