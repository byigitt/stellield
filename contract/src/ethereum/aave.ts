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
  private poolAddress: string;
  private dataProviderAddress: string;
  private aTokenAddress: string;
  private mockMode: boolean | null = null;
  private readonly mockState = {
    apy: parseFloat(process.env.AAVE_MOCK_APY || '3.5'),
    aTokenBalance: 0,
    totalSupplied: 0,
    lastAccrualMs: Date.now(),
  };
  private mockDetectionPromise?: Promise<boolean>;

  constructor(
    ethClient: EthereumClient,
    poolAddress: string,
    dataProviderAddress: string,
    usdcAddress: string,
    aTokenAddress: string
  ) {
    this.ethClient = ethClient;
    this.usdcAddress = usdcAddress;
    this.poolAddress = poolAddress;
    this.dataProviderAddress = dataProviderAddress;
    this.aTokenAddress = aTokenAddress;

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

  private async shouldUseMock(): Promise<boolean> {
    if (this.mockMode !== null) {
      return this.mockMode;
    }

    if (this.mockDetectionPromise) {
      return this.mockDetectionPromise;
    }

    this.mockDetectionPromise = this.detectMockMode();
    this.mockMode = await this.mockDetectionPromise;

    return this.mockMode;
  }

  private async detectMockMode(): Promise<boolean> {
    if (process.env.AAVE_FORCE_MOCK === 'true') {
      logger.warn('Aave mock mode enabled via AAVE_FORCE_MOCK');
      return true;
    }

    const provider = (this.ethClient as any).provider as ethers.Provider;

    if (!provider) {
      logger.warn('Ethereum provider unavailable. Falling back to mock Aave mode.');
      return true;
    }

    try {
      const [poolCode, dataProviderCode, aTokenCode] = await Promise.all([
        provider.getCode(this.poolAddress),
        provider.getCode(this.dataProviderAddress),
        provider.getCode(this.aTokenAddress),
      ]);

      const missingContracts = [
        poolCode === '0x' ? { label: 'pool', address: this.poolAddress } : null,
        dataProviderCode === '0x' ? { label: 'dataProvider', address: this.dataProviderAddress } : null,
        aTokenCode === '0x' ? { label: 'aToken', address: this.aTokenAddress } : null,
      ].filter((entry): entry is { label: string; address: string } => Boolean(entry));

      if (missingContracts.length > 0) {
        logger.warn('Detected missing Aave contracts on current network. Enabling mock mode.', {
          missingContracts,
        });
        return true;
      }

      return false;
    } catch (error) {
      logger.warn('Failed to verify Aave contracts. Enabling mock mode as fallback.', { error });
      return true;
    }
  }

  private accrueMockInterest(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.mockState.lastAccrualMs) / 1000;

    if (elapsedSeconds <= 0 || this.mockState.aTokenBalance <= 0) {
      this.mockState.lastAccrualMs = now;
      return;
    }

    const ratePerSecond = (this.mockState.apy / 100) / (365.25 * 24 * 60 * 60);
    const accrued = this.mockState.aTokenBalance * ratePerSecond * elapsedSeconds;

    this.mockState.aTokenBalance += accrued;
    this.mockState.lastAccrualMs = now;
  }

  private mockSupply(amount: string): SupplyResult {
    this.accrueMockInterest();

    const supplyAmount = parseFloat(amount);
    if (isNaN(supplyAmount) || supplyAmount <= 0) {
      throw new Error(`Invalid supply amount for mock Aave: ${amount}`);
    }

    this.mockState.aTokenBalance += supplyAmount;
    this.mockState.totalSupplied += supplyAmount;
    this.mockState.lastAccrualMs = Date.now();

    const txHash = this.createMockTxHash('supply');
    logger.info('Mock: USDC supplied to Aave V3', { txHash, amount: supplyAmount.toFixed(6) });

    return {
      transactionHash: txHash,
      usdcSupplied: supplyAmount.toFixed(6),
      aUSDCReceived: supplyAmount.toFixed(6),
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  private mockWithdraw(amount?: string): WithdrawResult {
    this.accrueMockInterest();

    const currentBalance = this.mockState.aTokenBalance;
    if (currentBalance <= 0) {
      throw new Error('Mock Aave: no balance available to withdraw');
    }

    let withdrawAmount = currentBalance;
    let explicitAmount = false;

    if (amount && amount !== 'max') {
      const parsed = parseFloat(amount);
      if (!isNaN(parsed) && parsed > 0) {
        withdrawAmount = Math.min(parsed, currentBalance);
        explicitAmount = true;
      }
    }

    const totalInterest = Math.max(0, currentBalance - this.mockState.totalSupplied);
    const interestShare = explicitAmount ? (withdrawAmount / currentBalance) : 1;
    const interestEarned = totalInterest * interestShare;
    const principalPortion = withdrawAmount - interestEarned;

    this.mockState.aTokenBalance = explicitAmount ? currentBalance - withdrawAmount : 0;
    this.mockState.totalSupplied = explicitAmount
      ? Math.max(0, this.mockState.totalSupplied - principalPortion)
      : 0;
    this.mockState.lastAccrualMs = Date.now();

    const txHash = this.createMockTxHash('withdraw');
    logger.info('Mock: USDC withdrawn from Aave V3', {
      txHash,
      withdrawn: withdrawAmount.toFixed(6),
      interestEarned: interestEarned.toFixed(6),
    });

    return {
      transactionHash: txHash,
      aUSDCBurned: withdrawAmount.toFixed(6),
      usdcReceived: withdrawAmount.toFixed(6),
      interestEarned: interestEarned.toFixed(6),
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  private createMockTxHash(prefix: string): string {
    const random = Math.floor(Math.random() * 1e12)
      .toString(16)
      .padStart(12, '0');
    return `0xmock_${prefix}_${random}`;
  }

  /**
   * Supply USDC to Aave V3 to earn yield
   */
  async supplyUSDC(amount: string): Promise<SupplyResult> {
    try {
      if (await this.shouldUseMock()) {
        return this.mockSupply(amount);
      }

      logger.info('Supplying USDC to Aave V3', { amount });

      // Check USDC balance
      const balance = await this.ethClient.getUSDCBalance();
      if (parseFloat(balance) < parseFloat(amount)) {
        throw new Error(
          `Insufficient USDC balance. Have ${balance}, need ${amount}`
        );
      }

      // Normalize amount to 6 decimals (Ethereum USDC uses 6, Stellar uses 7)
      const normalizedAmount = parseFloat(amount).toFixed(6);
      const amountBN = ethers.parseUnits(normalizedAmount, 6);

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
      if (await this.shouldUseMock()) {
        return this.mockWithdraw(amount);
      }

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
        // Normalize amount to 6 decimals (Ethereum USDC uses 6, Stellar uses 7)
        const normalizedAmount = parseFloat(amount).toFixed(6);
        withdrawAmountBN = ethers.parseUnits(normalizedAmount, 6);
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
      if (await this.shouldUseMock()) {
        this.accrueMockInterest();
        return this.mockState.aTokenBalance.toFixed(6);
      }

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
      if (await this.shouldUseMock()) {
        this.accrueMockInterest();
        const collateral = this.mockState.aTokenBalance.toFixed(6);
        return {
          totalCollateral: collateral,
          totalDebt: '0',
          availableBorrows: collateral,
          healthFactor: '0',
        };
      }

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
      if (await this.shouldUseMock()) {
        return this.mockState.apy;
      }

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
      if (await this.shouldUseMock()) {
        this.accrueMockInterest();
        const simulatedLiquidity = Math.max(0, 1000000 - this.mockState.aTokenBalance).toFixed(2);
        return {
          availableLiquidity: simulatedLiquidity,
          totalStableDebt: '0',
          totalVariableDebt: '0',
          liquidityRate: (this.mockState.apy / 100).toFixed(6),
        };
      }

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
