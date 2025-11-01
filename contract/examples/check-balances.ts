/**
 * Example: Check balances across chains
 * Useful for verifying account setup before running deposit/withdraw
 */

import { StellarClient } from '../src/stellar/client';
import { SolanaClient } from '../src/solana/client';
import { MarinadeStaking } from '../src/solana/marinade';
import { logger, LogLevel } from '../src/utils/logger';

logger.setLogLevel(LogLevel.INFO);

async function checkBalances() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          Cross-Chain Balance Checker                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log();

  try {
    // Stellar balances
    console.log('🌟 STELLAR BALANCES');
    console.log('─────────────────────────────────────────────────────');
    
    const stellarClient = new StellarClient();
    const stellarPubKey = stellarClient.getPublicKey();
    
    console.log('Account:', stellarPubKey);
    console.log();

    try {
      const xlmBalance = await stellarClient.getBalance();
      console.log('  XLM:', xlmBalance);

      const { code, issuer } = stellarClient.parseUSDCAddress();
      const hasTrustline = await stellarClient.hasTrustline(code, issuer);
      
      if (hasTrustline) {
        const usdcBalance = await stellarClient.getBalance(code, issuer);
        console.log('  USDC:', usdcBalance);
      } else {
        console.log('  USDC: No trustline (will be created on first swap)');
      }
    } catch (error: any) {
      console.log('  ❌ Error:', error.message);
      console.log('  💡 Tip: Fund your account at https://laboratory.stellar.org/#account-creator');
    }

    console.log();
    console.log();

    // Solana balances
    console.log('🔷 SOLANA BALANCES');
    console.log('─────────────────────────────────────────────────────');
    
    const solanaClient = new SolanaClient();
    const solanaPubKey = solanaClient.getPublicKeyString();
    
    console.log('Account:', solanaPubKey);
    console.log();

    try {
      const solBalance = await solanaClient.getBalanceInSOL();
      console.log('  SOL:', solBalance);

      const usdcBalance = await solanaClient.getUSDCBalance();
      console.log('  USDC:', usdcBalance / 1e6); // Convert from micro-units

      const marinade = new MarinadeStaking(solanaClient);
      const mSolBalance = await marinade.getMSolBalance();
      console.log('  mSOL:', mSolBalance);
    } catch (error: any) {
      console.log('  ❌ Error:', error.message);
      console.log('  💡 Tip: Get devnet SOL at https://faucet.solana.com');
    }

    console.log();
    console.log();

    // Marinade info
    console.log('🌊 MARINADE INFO');
    console.log('─────────────────────────────────────────────────────');
    
    try {
      const marinade = new MarinadeStaking(solanaClient);
      await marinade.initialize();
      
      const exchangeRate = await marinade.getExchangeRate();
      const apy = await marinade.getEstimatedAPY();
      
      console.log('  Exchange Rate: 1 mSOL =', exchangeRate.toFixed(4), 'SOL');
      console.log('  Estimated APY:', apy.toFixed(2) + '%');
    } catch (error: any) {
      console.log('  ❌ Error:', error.message);
    }

    console.log();
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Balance check completed');
    console.log();

  } catch (error: any) {
    console.log();
    console.log('❌ Balance check failed:', error.message);
    console.log();
    process.exit(1);
  }
}

// Run the check
checkBalances().catch((error) => {
  logger.error('Unhandled error in balance check', error);
  process.exit(1);
});

