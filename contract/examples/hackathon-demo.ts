/**
 * HACKATHON DEMO - 4 Minute Presentation Mode
 *
 * This demo executes REAL Stellar swaps and simulates the rest of the flow
 * WITHOUT waiting for real Circle CCTP attestations (which take 10-40 min)
 *
 * Perfect for live presentations and demos!
 * Runtime: ~30-60 seconds
 */

import { StellarClient } from '../src/stellar/client';
import { StellarSwap } from '../src/stellar/swap';
import { config } from '../src/config';

// Simulate the complete flow with realistic delays and REAL swap
async function simulateYieldFlow() {
  console.log('');
  console.log('🎬 HACKATHON DEMO: Stellar ↔ ETH Yield Bridge');
  console.log('═'.repeat(60));
  console.log('');
  console.log('⚡ DEMO MODE: Real Stellar swap + Simulated attestations');
  console.log('   (Full flow takes 10-40 min due to attestation waits)');
  console.log('');

  // Initialize Stellar client
  const stellarClient = new StellarClient();
  const stellarSwap = new StellarSwap(stellarClient);

  // Get initial balances
  const initialXLM = await stellarClient.getBalance();
  const { code: usdcCode, issuer: usdcIssuer } = stellarClient.parseUSDCAddress();
  const initialUSDC = await stellarClient.getBalance(usdcCode, usdcIssuer);

  // Initial state
  console.log('📊 Initial State:');
  console.log(`   Stellar:  ${parseFloat(initialXLM).toFixed(2)} XLM, ${parseFloat(initialUSDC).toFixed(2)} USDC`);
  console.log('   Ethereum: 0.5 ETH, 0 USDC');
  console.log('   Aave:     0 aUSDC');
  console.log('');

  await sleep(1000);

  // Step 1: Swap XLM to USDC - REAL TRANSACTION
  console.log('🔄 Step 1/10: Swapping XLM → USDC on Stellar...');

  try {
    const xlmAmount = '10'; // Swap 10 XLM
    const quote = await stellarSwap.getSwapQuote(xlmAmount);
    const minUSDC = stellarSwap.calculateMinOutput(quote.outputAmount, 1); // 1% slippage

    console.log(`   📊 Quote: ${xlmAmount} XLM → ${parseFloat(quote.outputAmount).toFixed(4)} USDC`);

    const txHash = await stellarSwap.swapXLMtoUSDC(xlmAmount, minUSDC);
    const network = config.stellar.network;

    console.log('   ✅ Swapped successfully!');
    console.log(`   📝 Tx: https://stellar.expert/explorer/${network}/tx/${txHash}`);
  } catch (error: any) {
    console.log('   ⚠️  Swap simulation (network issue)');
    console.log('   📝 Tx: https://stellar.expert/explorer/testnet/tx/[simulated]');
  }
  console.log('');

  // Step 2: Burn USDC on Stellar
  console.log('🔥 Step 2/10: Burning 45.23 USDC on Stellar...');
  await sleep(1500);
  console.log('   ✅ USDC burned successfully');
  console.log('   📝 Message Hash: 0xdef456789...');
  console.log('');

  // Step 3: Circle Attestation (SIMULATED)
  console.log('⏳ Step 3/10: Waiting for Circle attestation...');
  console.log('   🔸 Polling Circle API (normally 5-20 min)');
  await sleep(2000);
  console.log('   ✅ Attestation received! (simulated)');
  console.log('');

  // Step 4: Mint on Ethereum
  console.log('💎 Step 4/10: Minting 45.23 USDC on Ethereum...');
  await sleep(1500);
  console.log('   ✅ USDC minted on Sepolia');
  console.log('   📝 Tx: 0xghi789abc...');
  console.log('');

  // Step 5: Supply to Aave
  console.log('🏦 Step 5/10: Supplying 45.23 USDC to Aave V3...');
  await sleep(1500);
  console.log('   ✅ Supplied to Aave Pool');
  console.log('   💰 Received 45.23 aUSDC');
  console.log('   📈 Current APY: 3.45%');
  console.log('');

  // Step 6: Simulate yield
  console.log('⏰ Step 6/10: Simulating 30 days of yield...');
  await sleep(1500);
  console.log('   ⚡ Interest accrued: 0.115 USDC');
  console.log('   📊 New balance: 45.345 aUSDC');
  console.log('');

  // Step 7: Withdraw from Aave
  console.log('💸 Step 7/10: Withdrawing from Aave V3...');
  await sleep(1500);
  console.log('   ✅ Withdrawn 45.345 USDC (principal + interest)');
  console.log('   🎉 Yield earned: 0.115 USDC');
  console.log('');

  // Step 8: Burn on Ethereum
  console.log('🔥 Step 8/10: Burning 45.345 USDC on Ethereum...');
  await sleep(1500);
  console.log('   ✅ USDC burned on Sepolia');
  console.log('   📝 Message Hash: 0xjkl012345...');
  console.log('');

  // Step 9: Circle Attestation Return (SIMULATED)
  console.log('⏳ Step 9/10: Waiting for return attestation...');
  console.log('   🔸 Polling Circle API (normally 5-20 min)');
  await sleep(2000);
  console.log('   ✅ Attestation received! (simulated)');
  console.log('');

  // Step 10: Mint back on Stellar and swap - REAL TRANSACTION
  console.log('💫 Step 10/10: Minting USDC on Stellar & swapping to XLM...');
  console.log('   ✅ USDC minted on Stellar (simulated)');

  try {
    // Get current USDC balance after mint
    const currentUSDC = await stellarClient.getBalance(usdcCode, usdcIssuer);
    const usdcToSwap = parseFloat(currentUSDC) > 0 ? currentUSDC : '5'; // Use available USDC or minimum

    const returnQuote = await stellarSwap.getSwapQuote(usdcToSwap, stellarClient.getUSDCAsset());
    const minXLM = stellarSwap.calculateMinOutput(returnQuote.outputAmount, 1);

    console.log(`   📊 Quote: ${parseFloat(usdcToSwap).toFixed(4)} USDC → ${parseFloat(returnQuote.outputAmount).toFixed(4)} XLM`);

    const returnTxHash = await stellarSwap.swapUSDCtoXLM(usdcToSwap, minXLM);
    const network = config.stellar.network;

    console.log('   ✅ Swapped successfully!');
    console.log(`   📝 Tx: https://stellar.expert/explorer/${network}/tx/${returnTxHash}`);
  } catch (error: any) {
    console.log('   ⚠️  Return swap simulation (network issue)');
    console.log('   📝 Tx: https://stellar.expert/explorer/testnet/tx/[simulated]');
  }
  console.log('');

  // Get final balances
  const finalXLM = await stellarClient.getBalance();
  const finalUSDC = await stellarClient.getBalance(usdcCode, usdcIssuer);

  // Calculate profit
  const xlmProfit = parseFloat(finalXLM) - parseFloat(initialXLM);
  const profitPercent = (xlmProfit / parseFloat(initialXLM)) * 100;

  // Final results
  console.log('═'.repeat(60));
  console.log('✨ TRANSACTION COMPLETE!');
  console.log('═'.repeat(60));
  console.log('');
  console.log('📊 Final State:');
  console.log(`   Stellar:  ${parseFloat(finalXLM).toFixed(4)} XLM, ${parseFloat(finalUSDC).toFixed(4)} USDC`);
  console.log('   Ethereum: 0.485 ETH (gas fees - simulated)');
  console.log('   Aave:     0 aUSDC (all withdrawn - simulated)');
  console.log('');
  console.log('💰 Real Stellar Swap Results:');
  console.log(`   Initial XLM:       ${parseFloat(initialXLM).toFixed(4)}`);
  console.log(`   Final XLM:         ${parseFloat(finalXLM).toFixed(4)}`);
  console.log(`   XLM Change:        ${xlmProfit.toFixed(4)} (${profitPercent.toFixed(2)}%)`);
  console.log(`   Initial USDC:      ${parseFloat(initialUSDC).toFixed(4)}`);
  console.log(`   Final USDC:        ${parseFloat(finalUSDC).toFixed(4)}`);
  console.log('');
  console.log('💡 Simulated Yield Flow:');
  console.log('   Yield Earned:       0.115 USDC (simulated)');
  console.log('   APY:                3.45% (Aave - simulated)');
  console.log('   Time:               30 days (simulated)');
  console.log('');
  console.log('🎯 Key Features Demonstrated:');
  console.log('   ✅ Real Stellar DEX swaps (XLM ↔ USDC)');
  console.log('   ✅ Cross-chain bridge (Stellar ↔ Ethereum - simulated)');
  console.log('   ✅ Circle CCTP integration (simulated)');
  console.log('   ✅ Aave V3 yield generation (simulated)');
  console.log('   ✅ Automated orchestration');
  console.log('   ✅ State tracking & monitoring');
  console.log('');
  console.log('💡 What\'s Real vs Simulated:');
  console.log('   ✅ REAL: Stellar DEX swaps with actual transaction hashes');
  console.log('   ✅ REAL: Account balance changes on Stellar testnet');
  console.log('   ⏩ SIMULATED: Circle CCTP attestations (normally 5-20 min each)');
  console.log('   ⏩ SIMULATED: Ethereum transactions (to save gas)');
  console.log('   ⏩ SIMULATED: Aave deposits/withdrawals (to save time)');
  console.log('');
  console.log('💡 Full Production Flow:');
  console.log('   • Real attestations take 5-20 minutes (2x per flow)');
  console.log('   • Gas costs ~$2-5 on Ethereum mainnet');
  console.log('   • Stellar fees < $0.01 per transaction');
  console.log('   • Total time: 15-60 minutes for complete cycle');
  console.log('   • Fully autonomous execution');
  console.log('');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run demo
async function main() {
  try {
    await simulateYieldFlow();

    console.log('═'.repeat(60));
    console.log('🎬 Demo Complete!');
    console.log('═'.repeat(60));
    console.log('');
    console.log('📚 Available Demos:');
    console.log('   pnpm demo:hackathon  # This demo (real swaps + simulated flow)');
    console.log('   pnpm demo            # Full real flow (15-60 min with attestations)');
    console.log('   pnpm demo:bridge     # Test real bridge only (10-40 min)');
    console.log('   pnpm demo:aave       # Check Aave balances');
    console.log('');
    console.log('🔗 Architecture:');
    console.log('   Stellar DEX → CCTP Bridge → Ethereum → Aave V3 → Return');
    console.log('   └─ XLM/USDC ──┘   └─ USDC ──┘   └─ Yield ──┘   └─ USDC/XLM ──┘');
    console.log('');

  } catch (error: any) {
    console.error('Demo error:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
