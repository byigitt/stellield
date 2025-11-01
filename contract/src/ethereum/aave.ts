/**
 * Aave V3 Integration for Ethereum
 * Supply USDC to earn yield on Aave V3 Protocol
 */

import { ethers } from 'ethers';
import { EthereumClient } from './client';
import { logger } from '../utils/logger';

// Aave V3 Pool ABI (minimal interface)
const AAVE_POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)',
  'function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
];

// Aave V3 Pool Data Provider ABI
const AAVE_DATA_PROVIDER_ABI = [
  'function getUserReserveData(address asset, address user) view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)',
  'function getReserveData(address asset) view returns (uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)',
];

// ERC20 ABI for aUSDC
const ATOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export interface SupplyResult {
  transactionHash: string;
  usdcSupplied: string;
  aUSDCReceived: string;
  timestamp: number;
}

export interface WithdrawResult {
  transactionHash: string;
  aUSDCBurned: string;
  usdcReceived: string;
  interestEarned: string;
  timestamp: number;
}

export class AaveV3Service {
  private ethClient: EthereumClient;
  private pool: ethers.Contract;
  private dataProvider: ethers.Contract;
  private aToken: ethers.Contract;
  private usdcAddress: string;

  constructor(
    ethClient: EthereumClient,
    poolAddress: string,
    dataProviderAddress: string,
    usdcAddress: string,
    aTokenAddress: string
  ) {
    this.ethClient = ethClient;
    this.usdcAddress = usdcAddress;

    // Get provider and signer from EthereumClient
    const provider = (ethClient as any).provider;
    const signer = (ethClient as any).signer;

    this.pool = new ethers.Contract(poolAddress, AAVE_POOL_ABI, signer);
    this.dataProvider = new ethers.Contract(dataProviderAddress, AAVE_DATA_PROVIDER_ABI, provider);
    this.aToken = new ethers.Contract(aTokenAddress, ATOKEN_ABI, provider);

    logger.info('Aave V3 service initialized', {
      poolAddress,
      dataProviderAddress,
      usdcAddress,
      aTokenAddress,
    });
  }

  /**
   * Supply USDC to Aave V3 to earn yield
   */
  async supplyUSDC(amount: string): Promise<SupplyResult> {
    try {
      logger.info('Supplying USDC to Aave V3', { amount });

      // Check USDC balance
      const balance = await this.ethClient.getUSDCBalance();
      if (parseFloat(balance) < parseFloat(amount)) {
        throw new Error(
          `Insufficient USDC balance. Have ${balance}, need ${amount}`
        );
      }

      // Convert amount to 6 decimals
      const amountBN = ethers.parseUnits(amount, 6);

      // Get user address
      const userAddress = await this.ethClient.getAddress();

      // Approve USDC to Aave Pool
      const usdc = new ethers.Contract(
        this.usdcAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        (this.ethClient as any).signer
      );

      logger.debug('Approving USDC for Aave Pool');
      const approveTx = await usdc.approve(
        await this.pool.getAddress(),
        amountBN
      );
      await approveTx.wait();
      logger.debug('USDC approved');

      // Supply USDC to Aave
      logger.debug('Supplying USDC to Aave Pool');
      const supplyTx = await this.pool.supply(
        this.usdcAddress,
        amountBN,
        userAddress,
        0 // referral code
      );

      const receipt = await supplyTx.wait();
      logger.info('USDC supplied to Aave V3', {
        txHash: receipt.hash,
        amount,
      });

      return {
        transactionHash: receipt.hash,
        usdcSupplied: amount,
        aUSDCReceived: amount, // 1:1 initially
        timestamp: Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      logger.error('Failed to supply USDC to Aave', error);
      throw error;
    }
  }

  /**
   * Withdraw USDC from Aave V3 (including earned interest)
   */
  async withdrawUSDC(amount?: string): Promise<WithdrawResult> {
    try {
      const amountToWithdraw = amount || 'max';
      logger.info('Withdrawing USDC from Aave V3', { amount: amountToWithdraw });

      // Get user address
      const userAddress = await this.ethClient.getAddress();

      // Get current aUSDC balance (includes interest)
      const aUSDCBalance = await this.getSuppliedBalance();
      logger.debug('Current aUSDC balance', { balance: aUSDCBalance });

      // Determine withdrawal amount
      let withdrawAmountBN: bigint;
      if (!amount || amount === 'max') {
        // Withdraw all (type(uint256).max)
        withdrawAmountBN = ethers.MaxUint256;
      } else {
        withdrawAmountBN = ethers.parseUnits(amount, 6);
      }

      // Withdraw from Aave
      logger.debug('Withdrawing from Aave Pool');
      const withdrawTx = await this.pool.withdraw(
        this.usdcAddress,
        withdrawAmountBN,
        userAddress
      );

      const receipt = await withdrawTx.wait();

      // Get new balance to calculate actual withdrawn amount
      const newBalance = await this.ethClient.getUSDCBalance();

      // Calculate interest earned (current balance - original supply)
      // Note: This is simplified - in production, track original supply amount
      const interestEarned = parseFloat(aUSDCBalance) - parseFloat(amount || '0');

      logger.info('USDC withdrawn from Aave V3', {
        txHash: receipt.hash,
        withdrawn: aUSDCBalance,
        interestEarned: Math.max(0, interestEarned).toFixed(6),
      });

      return {
        transactionHash: receipt.hash,
        aUSDCBurned: aUSDCBalance,
        usdcReceived: newBalance,
        interestEarned: Math.max(0, interestEarned).toFixed(6),
        timestamp: Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      logger.error('Failed to withdraw USDC from Aave', error);
      throw error;
    }
  }

  /**
   * Get user's aUSDC balance (supplied USDC + earned interest)
   */
  async getSuppliedBalance(): Promise<string> {
    try {
      const userAddress = await this.ethClient.getAddress();
      const balance = await this.aToken.balanceOf(userAddress);
      const formatted = ethers.formatUnits(balance, 6);

      logger.debug('aUSDC balance', { balance: formatted });
      return formatted;
    } catch (error) {
      logger.error('Failed to get aUSDC balance', error);
      return '0';
    }
  }

  /**
   * Get user's account data from Aave
   */
  async getUserAccountData(): Promise<{
    totalCollateral: string;
    totalDebt: string;
    availableBorrows: string;
    healthFactor: string;
  }> {
    try {
      const userAddress = await this.ethClient.getAddress();
      const data = await this.pool.getUserAccountData(userAddress);

      return {
        totalCollateral: ethers.formatUnits(data[0], 8), // Base unit is 8 decimals
        totalDebt: ethers.formatUnits(data[1], 8),
        availableBorrows: ethers.formatUnits(data[2], 8),
        healthFactor: ethers.formatUnits(data[5], 18),
      };
    } catch (error) {
      logger.error('Failed to get user account data', error);
      throw error;
    }
  }

  /**
   * Get current USDC supply APY from Aave
   */
  async getEstimatedAPY(): Promise<number> {
    try {
      logger.debug('Fetching Aave USDC supply APY');

      // Get reserve data for USDC
      const reserveData = await this.dataProvider.getReserveData(this.usdcAddress);

      // liquidityRate is in Ray units (27 decimals)
      // APY = (1 + rate/seconds_per_year)^seconds_per_year - 1
      const liquidityRate = reserveData[3]; // liquidityRate
      const rateDecimal = Number(ethers.formatUnits(liquidityRate, 27));

      // Convert to APY percentage
      // Simplified: APY ≈ rate * seconds_per_year / RAY
      const secondsPerYear = 365.25 * 24 * 60 * 60;
      const apy = (rateDecimal * secondsPerYear) * 100;

      logger.debug('Aave USDC APY', { apy: apy.toFixed(2) });
      return apy;
    } catch (error) {
      logger.error('Failed to get APY from Aave', error);
      // Fallback: typical USDC APY on Aave is 2-5%
      return 3.5;
    }
  }

  /**
   * Get accrued interest for user
   */
  async getAccruedInterest(originalSupply: string): Promise<string> {
    try {
      const currentBalance = await this.getSuppliedBalance();
      const interest = parseFloat(currentBalance) - parseFloat(originalSupply);

      logger.debug('Accrued interest', {
        originalSupply,
        currentBalance,
        interest: Math.max(0, interest).toFixed(6),
      });

      return Math.max(0, interest).toFixed(6);
    } catch (error) {
      logger.error('Failed to calculate accrued interest', error);
      return '0';
    }
  }

  /**
   * Calculate expected yield for given amount and duration
   */
  async calculateExpectedYield(
    amount: string,
    durationDays: number
  ): Promise<{
    principal: string;
    estimatedInterest: string;
    totalReturn: string;
    apy: number;
  }> {
    try {
      const apy = await this.getEstimatedAPY();
      const principal = parseFloat(amount);

      // Calculate interest: principal * (APY/100) * (days/365)
      const estimatedInterest = principal * (apy / 100) * (durationDays / 365);
      const totalReturn = principal + estimatedInterest;

      return {
        principal: principal.toFixed(6),
        estimatedInterest: estimatedInterest.toFixed(6),
        totalReturn: totalReturn.toFixed(6),
        apy,
      };
    } catch (error) {
      logger.error('Failed to calculate expected yield', error);
      throw error;
    }
  }

  /**
   * Get reserve data for USDC
   */
  async getReserveData(): Promise<{
    availableLiquidity: string;
    liquidityRate: string;
    totalStableDebt: string;
    totalVariableDebt: string;
  }> {
    try {
      const data = await this.dataProvider.getReserveData(this.usdcAddress);

      return {
        availableLiquidity: ethers.formatUnits(data[0], 6),
        totalStableDebt: ethers.formatUnits(data[1], 6),
        totalVariableDebt: ethers.formatUnits(data[2], 6),
        liquidityRate: ethers.formatUnits(data[3], 27), // Ray format
      };
    } catch (error) {
      logger.error('Failed to get reserve data', error);
      throw error;
    }
  }
}
