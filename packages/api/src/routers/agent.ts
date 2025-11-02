/**
 * Agent Router
 * tRPC router for AI-powered yield recommendations
 */

import { z } from "zod";
import { publicProcedure, router } from "../index";
import {
	agentApiService,
	recommendationRequestSchema,
} from "../services/agent-api-service";

export const agentRouter = router({
	getRecommendations: publicProcedure
		.input(recommendationRequestSchema)
		.query(async ({ input }) => {
			return await agentApiService.getRecommendations(input);
		}),

	healthCheck: publicProcedure.query(async () => {
		return await agentApiService.healthCheck();
	}),

	detailedHealth: publicProcedure.query(async () => {
		return await agentApiService.detailedHealth();
	}),
});
