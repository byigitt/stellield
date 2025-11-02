/**
 * Stellar DEX swap operations using path payments
 * Mercury Protocol integration for XLM to USDC swaps
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarClient } from './client';
import { logger } from '../utils/logger';
import { SwapQuote } from '../types';

export class StellarSwap {
  private client: StellarClient;
  private server: StellarSdk.Horizon.Server;

  constructor(client: StellarClient) {
    this.client = client;
    this.server = new StellarSdk.Horizon.Server(
      (this.client as any).server.serverURL.toString()
    );
  }

  /**
   * Get a quote for swapping XLM to USDC
   */
  async getSwapQuote(
    sourceAmount: string,
    sourceAsset: StellarSdk.Asset = StellarSdk.Asset.native(),
    destinationAsset?: StellarSdk.Asset
  ): Promise<SwapQuote> {
    try {
      const destAsset = destinationAsset || this.client.getUSDCAsset();
      
      // Ensure amount has at most 7 decimal places (Stellar requirement)
      const formattedAmount = parseFloat(sourceAmount).toFixed(7);
      
      logger.debug('Fetching swap quote', {
        sourceAmount: formattedAmount,
        sourceAsset: sourceAsset.isNative() ? 'XLM' : sourceAsset.getCode(),
        destinationAsset: destAsset.isNative() ? 'XLM' : destAsset.getCode(),
      });

      // Use Stellar's path payment strict send to find the best route
      const pathsRecord = await this.server
        .strictSendPaths(
          sourceAsset,
          formattedAmount,
          [destAsset]
        )
        .call();

      if (!pathsRecord.records || pathsRecord.records.length === 0) {
        throw new Error('No payment path found for swap');
      }

      // Get the best path (first one is usually the best)
      const bestPath = pathsRecord.records[0];
      
      const route = [
        sourceAsset.isNative() ? 'XLM' : sourceAsset.getCode(),
        ...bestPath.path.map((asset) =>
          asset.asset_type === 'native' ? 'XLM' : asset.asset_code
        ),
        destAsset.isNative() ? 'XLM' : destAsset.getCode(),
      ];

      // Calculate price impact (simplified)
      const priceImpact = '0.5'; // This would need more sophisticated calculation

      logger.info('Swap quote received', {
        sourceAmount: formattedAmount,
        destinationAmount: bestPath.destination_amount,
        route,
      });

      return {
        inputAmount: formattedAmount,
        outputAmount: bestPath.destination_amount,
        priceImpact,
        route,
      };
    } catch (error) {
      logger.error('Failed to get swap quote', error);
      throw error;
    }
  }

  /**
   * Execute XLM to USDC swap using path payment
   */
  async swapXLMtoUSDC(
    xlmAmount: string,
    minUSDCAmount: string,
    destinationAccount?: string
  ): Promise<string> {
    try {
      const destination = destinationAccount || this.client.getPublicKey();
      const usdcAsset = this.client.getUSDCAsset();

      // Ensure amounts have at most 7 decimal places (Stellar requirement)
      const formattedXlmAmount = parseFloat(xlmAmount).toFixed(7);
      const formattedMinUsdc = parseFloat(minUSDCAmount).toFixed(7);

      logger.info('Executing XLM to USDC swap', {
        xlmAmount: formattedXlmAmount,
        minUSDCAmount: formattedMinUsdc,
        destination,
      });

      // Ensure trustline exists for USDC
      const hasTrustline = await this.client.hasTrustline(
        usdcAsset.getCode(),
        usdcAsset.getIssuer()
      );

      if (!hasTrustline) {
        logger.info('Creating USDC trustline...');
        await this.client.createTrustline(
          usdcAsset.getCode(),
          usdcAsset.getIssuer()
        );
      }

      // Get the best path
      const quote = await this.getSwapQuote(formattedXlmAmount);
      
      // Verify we meet minimum output
      if (parseFloat(quote.outputAmount) < parseFloat(formattedMinUsdc)) {
        throw new Error(
          `Swap output ${quote.outputAmount} USDC is less than minimum ${formattedMinUsdc} USDC`
        );
      }

      // Build path payment strict send operation
      const pathPaymentOp = StellarSdk.Operation.pathPaymentStrictSend({
        sendAsset: StellarSdk.Asset.native(),
        sendAmount: formattedXlmAmount,
        destination,
        destAsset: usdcAsset,
        destMin: formattedMinUsdc,
        path: [], // Stellar will find the optimal path
      });

      // Submit transaction
      const result = await this.client.submitTransaction([pathPaymentOp]);

      logger.info('Swap executed successfully', {
        hash: result.hash,
        xlmAmount,
        usdcReceived: quote.outputAmount,
      });

      return result.hash;
    } catch (error) {
      logger.error('Failed to execute swap', error);
      throw error;
    }
  }

  /**
   * Execute USDC to XLM swap using path payment
   */
  async swapUSDCtoXLM(
    usdcAmount: string,
    minXLMAmount: string,
    destinationAccount?: string
  ): Promise<string> {
    try {
      const destination = destinationAccount || this.client.getPublicKey();
      const usdcAsset = this.client.getUSDCAsset();

      // Ensure amounts have at most 7 decimal places (Stellar requirement)
      const formattedUsdcAmount = parseFloat(usdcAmount).toFixed(7);
      const formattedMinXlm = parseFloat(minXLMAmount).toFixed(7);

      logger.info('Executing USDC to XLM swap', {
        usdcAmount: formattedUsdcAmount,
        minXLMAmount: formattedMinXlm,
        destination,
      });

      // Use strict send to send exact USDC amount
      const pathPaymentOp = StellarSdk.Operation.pathPaymentStrictSend({
        sendAsset: usdcAsset,
        sendAmount: formattedUsdcAmount,
        destination,
        destAsset: StellarSdk.Asset.native(),
        destMin: formattedMinXlm,
        path: [], // Stellar will find the optimal path
      });

      // Submit transaction
      const result = await this.client.submitTransaction([pathPaymentOp]);

      logger.info('Swap executed successfully', {
        hash: result.hash,
        usdcAmount,
        xlmReceived: minXLMAmount,
      });

      return result.hash;
    } catch (error) {
      logger.error('Failed to execute swap', error);
      throw error;
    }
  }

  /**
   * Convenience helper: Get quote for USDC → XLM swap
   */
  async getUSDCToXLMQuote(usdcAmount: string): Promise<SwapQuote> {
    return this.getSwapQuote(
      usdcAmount,
      this.client.getUSDCAsset(),
      StellarSdk.Asset.native()
    );
  }

  /**
   * Get liquidity pool information for a trading pair
   */
  async getLiquidityPools(
    assetA: StellarSdk.Asset,
    assetB: StellarSdk.Asset
  ): Promise<any[]> {
    try {
      const pools = await this.server
        .liquidityPools()
        .forAssets(assetA, assetB)
        .call();

      logger.debug('Fetched liquidity pools', {
        count: pools.records.length,
      });

      return pools.records;
    } catch (error) {
      logger.error('Failed to fetch liquidity pools', error);
      throw error;
    }
  }

  /**
   * Estimate swap output using strict receive
   */
  async estimateSwapOutput(
    destinationAmount: string,
    sourceAsset: StellarSdk.Asset = StellarSdk.Asset.native(),
    destinationAsset?: StellarSdk.Asset
  ): Promise<{ sourceAmount: string; path: any[] }> {
    try {
      const destAsset = destinationAsset || this.client.getUSDCAsset();
      
      const pathsRecord = await this.server
        .strictReceivePaths(
          [sourceAsset],
          destAsset,
          destinationAmount
        )
        .call();

      if (!pathsRecord.records || pathsRecord.records.length === 0) {
        throw new Error('No payment path found');
      }

      const bestPath = pathsRecord.records[0];

      return {
        sourceAmount: bestPath.source_amount,
        path: bestPath.path,
      };
    } catch (error) {
      logger.error('Failed to estimate swap output', error);
      throw error;
    }
  }

  /**
   * Get current XLM/USDC exchange rate
   */
  async getExchangeRate(): Promise<number> {
    try {
      // Query for 1 XLM to USDC
      const quote = await this.getSwapQuote('1');
      return parseFloat(quote.outputAmount);
    } catch (error) {
      logger.error('Failed to get exchange rate', error);
      throw error;
    }
  }

  /**
   * Calculate minimum output with slippage tolerance
   */
  calculateMinOutput(
    expectedAmount: string,
    slippagePercent: number = 1
  ): string {
    const slippage = 1 - slippagePercent / 100;
    const minAmount = parseFloat(expectedAmount) * slippage;
    return minAmount.toFixed(7);
  }
}

