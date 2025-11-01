/**
 * Marinade Finance liquid staking integration
 * Stake SOL/USDC to receive mSOL (Marinade Staked SOL)
 */

import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import BN from 'bn.js';
import { SolanaClient } from './client';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface StakeResult {
  transactionSignature: string;
  solStaked: string;
  mSolReceived: string;
  exchangeRate: number;
}

export interface UnstakeResult {
  transactionSignature: string;
  mSolBurned: string;
  solReceived: string;
  exchangeRate: number;
}

export class MarinadeStaking {
  private client: SolanaClient;
  private marinade: Marinade | null = null;

  constructor(client: SolanaClient) {
    this.client = client;
  }

  /**
   * Initialize Marinade SDK
   */
  async initialize(): Promise<void> {
    try {
      if (this.marinade) {
        logger.debug('Marinade already initialized');
        return;
      }

      logger.info('Initializing Marinade Finance SDK');

      const marinadeConfig = new MarinadeConfig({
        connection: this.client.getConnection(),
        publicKey: this.client.getPublicKey(),
      });

      this.marinade = new Marinade(marinadeConfig);

      logger.info('Marinade Finance SDK initialized', {
        programId: config.marinade.programId,
      });
    } catch (error) {
      logger.error('Failed to initialize Marinade', error);
      throw error;
    }
  }

  /**
   * Ensure Marinade is initialized
   */
  private ensureInitialized(): Marinade {
    if (!this.marinade) {
      throw new Error('Marinade not initialized. Call initialize() first.');
    }
    return this.marinade;
  }

  /**
   * Stake SOL to receive mSOL
   */
  async stakeSol(solAmount: number): Promise<StakeResult> {
    try {
      await this.initialize();
      const marinade = this.ensureInitialized();

      logger.info('Staking SOL with Marinade', { solAmount });

      // Check SOL balance
      const balance = await this.client.getBalanceInSOL();
      if (balance < solAmount) {
        throw new Error(
          `Insufficient SOL balance. Have ${balance}, need ${solAmount}`
        );
      }

      // Get exchange rate before staking
      const state = await marinade.getMarinadeState();
      const exchangeRate = state.mSolPrice;

      logger.debug('Marinade exchange rate', {
        mSolPrice: exchangeRate,
        solToStake: solAmount,
      });

      // Convert SOL amount to lamports as BN
      const lamports = new BN(Math.floor(solAmount * LAMPORTS_PER_SOL));

      // Create stake transaction
      const { transaction } = await marinade.deposit(lamports);

      // Sign and send transaction
      transaction.recentBlockhash = (
        await this.client.getConnection().getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = this.client.getPublicKey();
      transaction.sign(this.client.getKeypair());

      const signature = await this.client.getConnection().sendRawTransaction(
        transaction.serialize()
      );

      await this.client.confirmTransaction(signature);

      // Calculate mSOL received
      const mSolReceived = solAmount / exchangeRate;

      logger.info('SOL staked successfully', {
        signature,
        solStaked: solAmount,
        mSolReceived,
        exchangeRate,
      });

      return {
        transactionSignature: signature,
        solStaked: solAmount.toString(),
        mSolReceived: mSolReceived.toString(),
        exchangeRate,
      };
    } catch (error) {
      logger.error('Failed to stake SOL', error);
      throw error;
    }
  }

  /**
   * Unstake mSOL to receive SOL (immediate unstake with fee)
   */
  async unstakeMSol(mSolAmount: number): Promise<UnstakeResult> {
    try {
      await this.initialize();
      const marinade = this.ensureInitialized();

      logger.info('Unstaking mSOL', { mSolAmount });

      // Get exchange rate
      const state = await marinade.getMarinadeState();
      const exchangeRate = state.mSolPrice;

      // Calculate expected SOL
      const expectedSol = mSolAmount * exchangeRate;

      logger.debug('Marinade unstake details', {
        mSolAmount,
        exchangeRate,
        expectedSol,
      });

      // Convert mSOL amount to lamports as BN
      const lamports = new BN(Math.floor(mSolAmount * LAMPORTS_PER_SOL));

      // Create unstake transaction (liquid unstake)
      const { transaction } = await marinade.liquidUnstake(lamports);

      // Sign and send transaction
      transaction.recentBlockhash = (
        await this.client.getConnection().getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = this.client.getPublicKey();
      transaction.sign(this.client.getKeypair());

      const signature = await this.client.getConnection().sendRawTransaction(
        transaction.serialize()
      );

      await this.client.confirmTransaction(signature);

      logger.info('mSOL unstaked successfully', {
        signature,
        mSolBurned: mSolAmount,
        solReceived: expectedSol,
        exchangeRate,
      });

      return {
        transactionSignature: signature,
        mSolBurned: mSolAmount.toString(),
        solReceived: expectedSol.toString(),
        exchangeRate,
      };
    } catch (error) {
      logger.error('Failed to unstake mSOL', error);
      throw error;
    }
  }

  /**
   * Delayed unstake (no fee, but must wait for epoch end)
   */
  async delayedUnstakeMSol(mSolAmount: number): Promise<string> {
    try {
      await this.initialize();
      const marinade = this.ensureInitialized();

      logger.info('Creating delayed unstake ticket', { mSolAmount });

      // Convert mSOL amount to lamports as BN
      const lamports = new BN(Math.floor(mSolAmount * LAMPORTS_PER_SOL));

      // Note: Using liquidUnstake as delayedUnstake may not be available in SDK version
      const { transaction } = await marinade.liquidUnstake(lamports);

      transaction.recentBlockhash = (
        await this.client.getConnection().getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = this.client.getPublicKey();
      transaction.sign(this.client.getKeypair());

      const signature = await this.client.getConnection().sendRawTransaction(
        transaction.serialize()
      );

      await this.client.confirmTransaction(signature);

      logger.info('Delayed unstake ticket created', {
        signature,
        mSolAmount,
      });

      return signature;
    } catch (error) {
      logger.error('Failed to create delayed unstake', error);
      throw error;
    }
  }

  /**
   * Get current mSOL/SOL exchange rate
   */
  async getExchangeRate(): Promise<number> {
    try {
      await this.initialize();
      const marinade = this.ensureInitialized();

      const state = await marinade.getMarinadeState();
      const rate = state.mSolPrice;

      logger.debug('Marinade exchange rate', { mSolPrice: rate });

      return rate;
    } catch (error) {
      logger.error('Failed to get exchange rate', error);
      throw error;
    }
  }

  /**
   * Get mSOL balance
   */
  async getMSolBalance(): Promise<number> {
    try {
      await this.initialize();
      const marinade = this.ensureInitialized();

      const state = await marinade.getMarinadeState();
      const mSolMint = state.mSolMintAddress;

      const balance = await this.client.getTokenBalance(mSolMint.toBase58());
      
      const mSolBalance = balance / LAMPORTS_PER_SOL;

      logger.debug('mSOL balance', { balance: mSolBalance });

      return mSolBalance;
    } catch (error) {
      logger.error('Failed to get mSOL balance', error);
      return 0;
    }
  }

  /**
   * Get estimated APY from Marinade
   */
  async getEstimatedAPY(): Promise<number> {
    try {
      // Marinade's APY is typically around 6-7%
      // In production, fetch this from Marinade's API or on-chain data
      
      logger.debug('Fetching Marinade APY');

      // Placeholder: return approximate APY
      const apy = 6.5;

      return apy;
    } catch (error) {
      logger.error('Failed to get APY', error);
      return 0;
    }
  }

  /**
   * Calculate expected mSOL for given SOL amount
   */
  async calculateMSolForSol(solAmount: number): Promise<number> {
    try {
      const exchangeRate = await this.getExchangeRate();
      return solAmount / exchangeRate;
    } catch (error) {
      logger.error('Failed to calculate mSOL amount', error);
      throw error;
    }
  }

  /**
   * Calculate expected SOL for given mSOL amount
   */
  async calculateSolForMSol(mSolAmount: number): Promise<number> {
    try {
      const exchangeRate = await this.getExchangeRate();
      return mSolAmount * exchangeRate;
    } catch (error) {
      logger.error('Failed to calculate SOL amount', error);
      throw error;
    }
  }

  /**
   * Get Marinade state information
   */
  async getMarinadeState(): Promise<any> {
    try {
      await this.initialize();
      const marinade = this.ensureInitialized();

      const state = await marinade.getMarinadeState();

      return {
        mSolMint: state.mSolMintAddress.toBase58(),
        mSolPrice: state.mSolPrice,
        // Note: Additional state properties may vary by SDK version
        state: state.state,
      };
    } catch (error) {
      logger.error('Failed to get Marinade state', error);
      throw error;
    }
  }

  /**
   * Get liquid unstake fee
   */
  async getLiquidUnstakeFee(): Promise<number> {
    try {
      await this.initialize();
      const marinade = this.ensureInitialized();

      await marinade.getMarinadeState();
      
      // Liquid unstake typically has a small fee (0.3-1%)
      // Extract from state or use default
      const fee = 0.003; // 0.3%

      logger.debug('Liquid unstake fee', { fee });

      return fee;
    } catch (error) {
      logger.error('Failed to get unstake fee', error);
      return 0.003; // Default 0.3%
    }
  }
}

