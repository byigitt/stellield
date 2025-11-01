/**
 * Solana client wrapper for account management and transactions
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { config } from '../config';
import { logger } from '../utils/logger';

export class SolanaClient {
  private connection: Connection;
  private keypair: Keypair;
  private publicKey: PublicKey;

  constructor() {
    // Initialize connection to Solana RPC
    this.connection = new Connection(
      config.solana.rpcUrl,
      'confirmed'
    );

    // Load keypair from private key
    this.keypair = this.loadKeypairFromPrivateKey(config.solana.privateKey);
    this.publicKey = this.keypair.publicKey;

    logger.info('Solana client initialized', {
      network: config.solana.network,
      publicKey: this.publicKey.toBase58(),
      rpcUrl: config.solana.rpcUrl,
    });
  }

  /**
   * Load Keypair from base58 private key
   */
  private loadKeypairFromPrivateKey(privateKey: string): Keypair {
    try {
      // Try to decode as base58
      const decoded = bs58.decode(privateKey);
      return Keypair.fromSecretKey(decoded);
    } catch (error) {
      logger.error('Failed to load Solana keypair', error);
      throw new Error('Invalid Solana private key format');
    }
  }

  /**
   * Get the public key of the current account
   */
  getPublicKey(): PublicKey {
    return this.publicKey;
  }

  /**
   * Get the public key as base58 string
   */
  getPublicKeyString(): string {
    return this.publicKey.toBase58();
  }

  /**
   * Get the keypair
   */
  getKeypair(): Keypair {
    return this.keypair;
  }

  /**
   * Get the connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get SOL balance in lamports
   */
  async getBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.publicKey);
      logger.debug('Fetched SOL balance', {
        lamports: balance,
        sol: balance / LAMPORTS_PER_SOL,
      });
      return balance;
    } catch (error) {
      logger.error('Failed to get SOL balance', error);
      throw error;
    }
  }

  /**
   * Get SOL balance in SOL (not lamports)
   */
  async getBalanceInSOL(): Promise<number> {
    const lamports = await this.getBalance();
    return lamports / LAMPORTS_PER_SOL;
  }

  /**
   * Get token balance for a specific mint
   */
  async getTokenBalance(mintAddress: string): Promise<number> {
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      
      // Get token accounts by owner
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        this.publicKey,
        { mint: mintPublicKey }
      );

      if (tokenAccounts.value.length === 0) {
        logger.debug('No token account found', { mint: mintAddress });
        return 0;
      }

      // Get balance from first token account
      const tokenAccount = tokenAccounts.value[0];
      const accountInfo = await this.connection.getTokenAccountBalance(
        tokenAccount.pubkey
      );

      const balance = Number(accountInfo.value.amount);
      
      logger.debug('Fetched token balance', {
        mint: mintAddress,
        balance,
        uiAmount: accountInfo.value.uiAmount,
      });

      return balance;
    } catch (error) {
      logger.error('Failed to get token balance', { mintAddress, error });
      throw error;
    }
  }

  /**
   * Get USDC balance
   */
  async getUSDCBalance(): Promise<number> {
    return this.getTokenBalance(config.solana.usdcMint);
  }

  /**
   * Build and send a transaction
   */
  async sendTransaction(
    instructions: TransactionInstruction[],
    signers: Keypair[] = []
  ): Promise<string> {
    try {
      const transaction = new Transaction();
      
      // Add all instructions
      instructions.forEach((instruction) => {
        transaction.add(instruction);
      });

      // Get recent blockhash
      const { blockhash } = 
        await this.connection.getLatestBlockhash('confirmed');
      
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.publicKey;

      // Sign transaction
      const allSigners = [this.keypair, ...signers];
      
      logger.debug('Sending transaction', {
        instructions: instructions.length,
        signers: allSigners.length,
      });

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        allSigners,
        {
          commitment: 'confirmed',
          maxRetries: 3,
        }
      );

      logger.info('Transaction sent successfully', {
        signature,
        blockhash,
      });

      return signature;
    } catch (error: any) {
      logger.error('Failed to send transaction', {
        error: error.message,
        logs: error.logs,
      });
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string): Promise<any> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        throw new Error(`Transaction ${signature} not found`);
      }

      return tx;
    } catch (error) {
      logger.error('Failed to get transaction', { signature, error });
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async confirmTransaction(
    signature: string,
    commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
  ): Promise<void> {
    try {
      logger.debug('Waiting for transaction confirmation', {
        signature,
        commitment,
      });

      const latestBlockhash = await this.connection.getLatestBlockhash();
      
      await this.connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        commitment
      );

      logger.info('Transaction confirmed', { signature });
    } catch (error) {
      logger.error('Failed to confirm transaction', { signature, error });
      throw error;
    }
  }

  /**
   * Request airdrop (devnet/testnet only)
   */
  async requestAirdrop(lamports: number = LAMPORTS_PER_SOL): Promise<string> {
    try {
      logger.info('Requesting airdrop', {
        lamports,
        sol: lamports / LAMPORTS_PER_SOL,
      });

      const signature = await this.connection.requestAirdrop(
        this.publicKey,
        lamports
      );

      await this.confirmTransaction(signature);

      logger.info('Airdrop successful', { signature });
      return signature;
    } catch (error) {
      logger.error('Failed to request airdrop', error);
      throw error;
    }
  }

  /**
   * Get minimum balance for rent exemption
   */
  async getMinimumBalanceForRentExemption(
    dataLength: number
  ): Promise<number> {
    try {
      const rent = await this.connection.getMinimumBalanceForRentExemption(
        dataLength
      );
      return rent;
    } catch (error) {
      logger.error('Failed to get minimum rent balance', error);
      throw error;
    }
  }

  /**
   * Get account info
   */
  async getAccountInfo(address: string): Promise<any> {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      
      if (!accountInfo) {
        throw new Error(`Account ${address} not found`);
      }

      return accountInfo;
    } catch (error) {
      logger.error('Failed to get account info', { address, error });
      throw error;
    }
  }

  /**
   * Check if account exists
   */
  async accountExists(address: string): Promise<boolean> {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      return accountInfo !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current slot
   */
  async getCurrentSlot(): Promise<number> {
    try {
      return await this.connection.getSlot();
    } catch (error) {
      logger.error('Failed to get current slot', error);
      throw error;
    }
  }

  /**
   * Get recent performance samples
   */
  async getRecentPerformanceSamples(limit: number = 1): Promise<any[]> {
    try {
      return await this.connection.getRecentPerformanceSamples(limit);
    } catch (error) {
      logger.error('Failed to get performance samples', error);
      throw error;
    }
  }

  /**
   * Create transfer instruction
   */
  createTransferInstruction(
    destination: PublicKey,
    lamports: number
  ): TransactionInstruction {
    return SystemProgram.transfer({
      fromPubkey: this.publicKey,
      toPubkey: destination,
      lamports,
    });
  }
}

