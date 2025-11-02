/**
 * Agent API Service
 * Communicates with the Python FastAPI backend for AI recommendations
 */

import { z } from "zod";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

export const recommendationRequestSchema = z.object({
	amount_usd: z.number().positive(),
	risk_tolerance: z.enum(["low", "medium", "high"]).default("medium"),
	preferred_chains: z.array(z.string()).optional(),
	min_liquidity_usd: z.number().optional(),
	min_apy: z.number().optional(),
});

export type RecommendationRequest = z.infer<
	typeof recommendationRequestSchema
>;

// Response types matching Python Pydantic models
export interface PortfolioAllocation {
	opportunity: {
		pool: string;
		project: string;
		symbol: string;
		chain: string;
		tvl_usd: number;
		apy: number;
		apy_base: number | null;
		apy_reward: number | null;
		il_risk: string | null;
		exposure: string;
		predicted_class: string | null;
		pool_meta: string | null;
		mu_mean: number | null;
		sigma_mean: number | null;
		count: number | null;
	};
	allocation_percentage: number;
	allocation_usd: number;
	expected_apy: number;
	risk_tier: "A" | "B" | "C" | "D";
	reasoning: string;
}

export interface Recommendation {
	requested_amount_usd: number;
	risk_tolerance: string;
	preferred_chains: string[] | null;
	min_liquidity_usd: number | null;
	allocations: PortfolioAllocation[];
	total_allocated_usd: number;
	weighted_expected_apy: number;
	overall_risk_grade: string;
	diversification_score: number;
	summary: string;
	key_risks: string[];
	opportunities: string[];
	rationale: string;
	projected_returns: Record<string, number>;
	estimated_fees: Record<string, number>;
	confidence_score: number;
	timestamp: string;
	data_freshness_seconds: number;
}

export interface RecommendationResponse {
	success: boolean;
	recommendation: Recommendation | null;
	error: string | null;
	execution_time_ms: number;
}

export class AgentApiService {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl || AGENT_API_URL;
	}

	async getRecommendations(
		request: RecommendationRequest,
	): Promise<RecommendationResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/api/recommendations`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(request),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.detail || `Agent API error: ${response.statusText}`,
				);
			}

			return await response.json();
		} catch (error) {
			console.error("Agent API request failed:", error);
			throw error;
		}
	}

	async healthCheck(): Promise<{ status: string; service: string }> {
		try {
			const response = await fetch(`${this.baseUrl}/health`);

			if (!response.ok) {
				throw new Error(`Health check failed: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Agent API health check failed:", error);
			throw error;
		}
	}

	async detailedHealth(): Promise<any> {
		try {
			const response = await fetch(`${this.baseUrl}/api/health/detailed`);

			if (!response.ok) {
				throw new Error(`Detailed health check failed: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Agent API detailed health check failed:", error);
			throw error;
		}
	}
}

// Singleton instance
export const agentApiService = new AgentApiService();
