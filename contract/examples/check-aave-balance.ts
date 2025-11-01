/**
 * Check Aave V3 Balance Utility
 *
 * Displays:
 * - USDC balance on Ethereum
 * - aUSDC balance (supplied to Aave)
 * - Estimated APY
 * - User account data
 * - Reserve information
 */

import { EthereumClient } from '../src/ethereum/client';
import { AaveV3Service } from '../src/ethereum/aave';
import { config } from '../src/config';
import { logger } from '../src/utils/logger';

async function main() {
  console.log('');
  console.log('🏦 Aave V3 Balance Checker');
  console.log('━'.repeat(50));
  console.log('');

  try {
    // Validate configuration
    if (!config.ethereum) {
      throw new Error('Ethereum configuration not found');
    }
    if (!config.aave) {
      throw new Error('Aave configuration not found');
    }

    // Initialize clients
    console.log('Initializing clients...');
    const ethClient = new EthereumClient(
      config.ethereum.privateKey,
      config.ethereum.rpcUrl,
      config.ethereum.tokenMessenger,
      config.ethereum.usdc
    );

    const aave = new AaveV3Service(
      ethClient,
      config.aave.poolAddress,
      config.aave.poolDataProviderAddress,
      config.ethereum.usdc,
      config.aave.aUSDCAddress
    );

    // Get Ethereum address
    const address = await ethClient.getAddress();
    console.log(`📍 Ethereum Address: ${address}`);
    console.log('');

    // Get USDC balance
    console.log('💵 Token Balances:');
    const usdcBalance = await ethClient.getUSDCBalance();
    console.log(`  USDC:  ${usdcBalance}`);

    // Get aUSDC balance (supplied to Aave)
    const aUSDCBalance = await aave.getSuppliedBalance();
    console.log(`  aUSDC: ${aUSDCBalance}`);
    console.log('');

    // Get APY
    console.log('📈 Yield Information:');
    const apy = await aave.getEstimatedAPY();
    console.log(`  Current USDC Supply APY: ${apy.toFixed(2)}%`);
    console.log('');

    // Get user account data
    console.log('👤 Account Data:');
    try {
      const accountData = await aave.getUserAccountData();
      console.log(`  Total Collateral: ${accountData.totalCollateral}`);
      console.log(`  Total Debt:       ${accountData.totalDebt}`);
      console.log(`  Available Borrows: ${accountData.availableBorrows}`);
      console.log(`  Health Factor:    ${accountData.healthFactor}`);
      console.log('');
    } catch (error: any) {
      console.log(`  Error fetching account data: ${error.message}`);
      console.log('');
    }

    // Get reserve data
    console.log('🏦 USDC Reserve Data:');
    try {
      const reserveData = await aave.getReserveData();
      console.log(`  Available Liquidity: ${reserveData.availableLiquidity} USDC`);
      console.log(`  Total Stable Debt:   ${reserveData.totalStableDebt} USDC`);
      console.log(`  Total Variable Debt: ${reserveData.totalVariableDebt} USDC`);
      console.log('');
    } catch (error: any) {
      console.log(`  Error fetching reserve data: ${error.message}`);
      console.log('');
    }

    // Calculate potential yield for 30 days
    if (parseFloat(aUSDCBalance) > 0) {
      console.log('💰 Yield Projections:');
      const yield30d = await aave.calculateExpectedYield(aUSDCBalance, 30);
      const yield90d = await aave.calculateExpectedYield(aUSDCBalance, 90);
      const yield365d = await aave.calculateExpectedYield(aUSDCBalance, 365);

      console.log(`  Principal:        ${yield30d.principal} USDC`);
      console.log('');
      console.log(`  30 days yield:    ${yield30d.estimatedInterest} USDC`);
      console.log(`  90 days yield:    ${yield90d.estimatedInterest} USDC`);
      console.log(`  365 days yield:   ${yield365d.estimatedInterest} USDC`);
      console.log('');
    }

    // Check if user has funds supplied
    if (parseFloat(aUSDCBalance) === 0) {
      console.log('ℹ️  No funds currently supplied to Aave V3');
      console.log('   Run the yield demo to supply USDC and earn yield');
      console.log('');
    }

    console.log('✅ Balance check complete');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ Balance check failed:');
    console.error(error.message);
    console.error('');

    if (error.stack) {
      logger.error('Stack trace:', error.stack);
    }

    process.exit(1);
  }
}

// Run utility
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
