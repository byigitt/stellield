/**
 * Stellar tRPC Router
 * Handles Stellar swap quotes and yield flow operations
 */

import { z } from 'zod';
import { publicProcedure, router } from '../index';
import { stellarYieldService } from '../services/stellar-yield-service';

export const stellarRouter = router({
  /**
   * Get swap quote for XLM to USDC
   */
  getSwapQuote: publicProcedure
    .input(
      z.object({
        xlmAmount: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const quote = await stellarYieldService.getSwapQuote(input.xlmAmount);
      return quote;
    }),

  /**
   * Start the yield flow
   */
  startYieldFlow: publicProcedure
    .input(
      z.object({
        xlmAmount: z.string().min(1),
        walletAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const flowId = await stellarYieldService.startYieldFlow(
        input.xlmAmount,
        input.walletAddress
      );

      return {
        flowId,
        message: 'Yield flow started successfully',
      };
    }),

  /**
   * Get flow status by ID
   */
  getFlowStatus: publicProcedure
    .input(
      z.object({
        flowId: z.string().uuid(),
      })
    )
    .query(({ input }) => {
      const status = stellarYieldService.getFlowStatus(input.flowId);

      if (!status) {
        throw new Error(`Flow ${input.flowId} not found`);
      }

      return status;
    }),

  /**
   * Get all flows
   */
  getAllFlows: publicProcedure
    .query(() => {
      return stellarYieldService.getAllFlows();
    }),

  /**
   * Get recent flows with pagination
   */
  getRecentFlows: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(({ input }) => {
      return stellarYieldService.getRecentFlows(input.limit, input.offset);
    }),

  /**
   * Get flow statistics
   */
  getFlowStatistics: publicProcedure
    .query(() => {
      return stellarYieldService.getFlowStatistics();
    }),
});
