/**
 * Stellar client wrapper for account management and transactions
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';

export class StellarClient {
  private server: StellarSdk.Horizon.Server;
  private keypair: StellarSdk.Keypair;
  private networkPassphrase: string;

  constructor() {
    // Initialize Horizon server
    this.server = new StellarSdk.Horizon.Server(config.stellar.horizonUrl);
    
    // Load keypair from private key
    this.keypair = StellarSdk.Keypair.fromSecret(config.stellar.privateKey);
    
    // Set network passphrase
    this.networkPassphrase = config.stellar.network === 'testnet' 
      ? StellarSdk.Networks.TESTNET 
      : StellarSdk.Networks.PUBLIC;
    
    logger.info('Stellar client initialized', {
      network: config.stellar.network,
      publicKey: this.keypair.publicKey(),
    });
  }

  /**
   * Get the public key of the current account
   */
  getPublicKey(): string {
    return this.keypair.publicKey();
  }

  /**
   * Get the keypair
   */
  getKeypair(): StellarSdk.Keypair {
    return this.keypair;
  }

  /**
   * Load account details from the network
   */
  async loadAccount(): Promise<StellarSdk.Horizon.AccountResponse> {
    try {
      const account = await this.server.loadAccount(this.keypair.publicKey());
      logger.debug('Loaded Stellar account', {
        accountId: account.accountId(),
        sequence: account.sequence,
      });
      return account;
    } catch (error) {
      logger.error('Failed to load Stellar account', error);
      throw new Error(`Failed to load account: ${error}`);
    }
  }

  /**
   * Get account balance for a specific asset
   */
  async getBalance(assetCode?: string, assetIssuer?: string): Promise<string> {
    try {
      const account = await this.loadAccount();
      
      if (!assetCode) {
        // Get native XLM balance
        const xlmBalance = account.balances.find(
          (balance) => balance.asset_type === 'native'
        );
        return xlmBalance ? (xlmBalance as StellarSdk.Horizon.HorizonApi.BalanceLineNative).balance : '0';
      }
      
      // Get specific asset balance
      const assetBalance = account.balances.find(
        (balance) =>
          balance.asset_type !== 'native' &&
          (balance as StellarSdk.Horizon.HorizonApi.BalanceLineAsset).asset_code === assetCode &&
          (balance as StellarSdk.Horizon.HorizonApi.BalanceLineAsset).asset_issuer === assetIssuer
      );
      
      return assetBalance ? (assetBalance as StellarSdk.Horizon.HorizonApi.BalanceLineAsset).balance : '0';
    } catch (error) {
      logger.error('Failed to get balance', error);
      throw error;
    }
  }

  /**
   * Get current base fee from the network
   */
  async getBaseFee(): Promise<string> {
    try {
      const fee = await this.server.fetchBaseFee();
      return fee.toString();
    } catch (error) {
      logger.error('Failed to fetch base fee', error);
      // Return default fee if fetch fails
      return StellarSdk.BASE_FEE;
    }
  }

  /**
   * Build and submit a transaction
   */
  async submitTransaction(
    operations: StellarSdk.xdr.Operation[],
    memo?: StellarSdk.Memo
  ): Promise<StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse> {
    try {
      const account = await this.loadAccount();
      const fee = await this.getBaseFee();
      
      // Build transaction
      const txBuilder = new StellarSdk.TransactionBuilder(account, {
        fee,
        networkPassphrase: this.networkPassphrase,
      });
      
      // Add all operations
      operations.forEach((op) => txBuilder.addOperation(op));
      
      // Add memo if provided
      if (memo) {
        txBuilder.addMemo(memo);
      }
      
      // Set timeout and build
      const transaction = txBuilder.setTimeout(180).build();
      
      // Sign transaction
      transaction.sign(this.keypair);
      
      // Submit to network
      logger.debug('Submitting transaction', {
        hash: transaction.hash().toString('hex'),
        operations: operations.length,
      });
      
      const result = await this.server.submitTransaction(transaction);
      
      logger.info('Transaction submitted successfully', {
        hash: result.hash,
        ledger: result.ledger,
      });
      
      return result;
    } catch (error: any) {
      logger.error('Failed to submit transaction', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Create a payment operation
   */
  createPaymentOperation(
    destination: string,
    amount: string,
    asset: StellarSdk.Asset = StellarSdk.Asset.native()
  ): StellarSdk.xdr.Operation {
    return StellarSdk.Operation.payment({
      destination,
      asset,
      amount,
    });
  }

  /**
   * Create trust line for an asset
   */
  async createTrustline(
    assetCode: string,
    assetIssuer: string,
    limit?: string
  ): Promise<string> {
    try {
      const asset = new StellarSdk.Asset(assetCode, assetIssuer);
      
      const changeTrustOp = StellarSdk.Operation.changeTrust({
        asset,
        limit,
      });
      
      const result = await this.submitTransaction([changeTrustOp]);
      
      logger.info('Trustline created', {
        asset: `${assetCode}:${assetIssuer}`,
        hash: result.hash,
      });
      
      return result.hash;
    } catch (error) {
      logger.error('Failed to create trustline', error);
      throw error;
    }
  }

  /**
   * Check if account has trustline for an asset
   */
  async hasTrustline(assetCode: string, assetIssuer: string): Promise<boolean> {
    try {
      const account = await this.loadAccount();
      
      return account.balances.some(
        (balance) =>
          balance.asset_type !== 'native' &&
          (balance as StellarSdk.Horizon.HorizonApi.BalanceLineAsset).asset_code === assetCode &&
          (balance as StellarSdk.Horizon.HorizonApi.BalanceLineAsset).asset_issuer === assetIssuer
      );
    } catch (error) {
      logger.error('Failed to check trustline', error);
      return false;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(hash: string): Promise<StellarSdk.Horizon.ServerApi.TransactionRecord> {
    try {
      const transaction = await this.server.transactions().transaction(hash).call();
      return transaction;
    } catch (error) {
      logger.error('Failed to get transaction', { hash, error });
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    hash: string,
    maxAttempts: number = 30,
    delayMs: number = 2000
  ): Promise<StellarSdk.Horizon.ServerApi.TransactionRecord> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const tx = await this.getTransaction(hash);
        if (tx) {
          logger.info('Transaction confirmed', { hash, attempt: i + 1 });
          return tx;
        }
      } catch (error) {
        // Transaction not found yet, continue waiting
      }
      
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    
    throw new Error(`Transaction ${hash} not confirmed after ${maxAttempts} attempts`);
  }

  /**
   * Get USDC asset for Stellar
   */
  getUSDCAsset(): StellarSdk.Asset {
    // Handle both formats: "USDC:ISSUER" and just "ISSUER"
    const parts = config.stellar.usdcAddress.split(':');
    if (parts.length === 2) {
      return new StellarSdk.Asset(parts[0], parts[1]);
    }
    // Default to USDC code with the provided issuer
    return new StellarSdk.Asset('USDC', config.stellar.usdcAddress);
  }

  /**
   * Parse USDC address into code and issuer
   */
  parseUSDCAddress(): { code: string; issuer: string } {
    // Handle both formats: "USDC:ISSUER" and just "ISSUER"
    const parts = config.stellar.usdcAddress.split(':');
    if (parts.length === 2) {
      return { code: parts[0], issuer: parts[1] };
    }
    // Default to USDC code with the provided issuer
    return { code: 'USDC', issuer: config.stellar.usdcAddress };
  }
}

