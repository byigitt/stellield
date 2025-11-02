import type { DefiLlamaPool } from "./data-sources";

export type RiskTier = "A" | "B" | "C" | "D";

export interface RiskDistributionSlice {
	tier: RiskTier;
	percentage: number;
	count: number;
}

export interface RiskDistributionSummary {
	distribution: RiskDistributionSlice[];
	grade: string;
	total: number;
}

function calculateRiskScore(pool: DefiLlamaPool) {
	let score = 0;

	const prediction = (pool.predictions?.predictedClass ?? "").toLowerCase();
	const probability = pool.predictions?.predictedProbability ?? null;
	const ilRisk = (pool.ilRisk ?? "").toLowerCase() === "yes";
	const exposure = (pool.exposure ?? "").toLowerCase();
	const stablecoin = pool.stablecoin ?? false;

	if (prediction === "stable/up") {
		score += 2;
	} else if (prediction === "down") {
		score -= 2;
	} else if (prediction) {
		score += 0.5;
	}

	if (probability !== null) {
		if (probability >= 85) score += 2;
		else if (probability >= 70) score += 1;
		else if (probability <= 35) score -= 1;
		else if (probability <= 20) score -= 2;
	}

	if (ilRisk) score -= 2;
	else score += 0.5;

	if (exposure === "multi") score -= 0.5;

	const apy = pool.apy ?? 0;
	if (apy >= 20) score -= 1.5;
	else if (apy >= 12) score -= 1;
	else if (apy >= 8) score -= 0.5;

	const volatilityCandidates = [
		Math.abs(pool.apyPct30D ?? 0),
		Math.abs(pool.apyPct7D ?? 0),
		Math.abs(pool.apyPct1D ?? 0),
	].filter((v) => v !== null && !Number.isNaN(v)) as number[];

	if (volatilityCandidates.length > 0) {
		const volatility = Math.max(...volatilityCandidates);
		if (volatility >= 5) score -= 2;
		else if (volatility >= 2) score -= 1;
		else if (volatility >= 1) score -= 0.5;
	}

	if (stablecoin && !ilRisk) score += 1;

	return score;
}

export function classifyRiskTier(pool: DefiLlamaPool): RiskTier {
	const score = calculateRiskScore(pool);

	if (score >= 3) return "A";
	if (score >= 1) return "B";
	if (score >= -1.5) return "C";
	return "D";
}

export function computeRiskDistribution(
	pools?: DefiLlamaPool[],
): RiskDistributionSummary {
	if (!pools || pools.length === 0) {
		const emptyDistribution: RiskDistributionSlice[] = [
			{ tier: "A", percentage: 0, count: 0 },
			{ tier: "B", percentage: 0, count: 0 },
			{ tier: "C", percentage: 0, count: 0 },
			{ tier: "D", percentage: 0, count: 0 },
		];

		return {
			distribution: emptyDistribution,
			grade: "N/A",
			total: 0,
		};
	}

	const counts: Record<RiskTier, number> = { A: 0, B: 0, C: 0, D: 0 };
	pools.forEach((pool) => {
		const tier = classifyRiskTier(pool);
		counts[tier] += 1;
	});

	const total = pools.length;
	const distribution = (Object.keys(counts) as RiskTier[]).map((tier) => ({
		tier,
		count: counts[tier],
		percentage: Math.round((counts[tier] / total) * 100),
	}));

	const stabilityScore =
		(counts.A * 4 + counts.B * 2 - counts.C - counts.D * 2) / total;

	let grade = "B";
	if (stabilityScore >= 3.2) grade = "A";
	else if (stabilityScore >= 1.5) grade = "B+";
	else if (stabilityScore >= 1) grade = "B";
	else if (stabilityScore >= 0.2) grade = "B-";
	else if (stabilityScore >= -0.5) grade = "C";
	else grade = "C-";

	return { distribution, grade, total };
}

export const RISK_COLOR_SCHEME: Record<
	RiskTier,
	{ track: string; marker: string; label: string }
> = {
	A: { track: "bg-green-500", marker: "bg-green-400", label: "Low Risk" },
	B: { track: "bg-yellow-500", marker: "bg-yellow-400", label: "Medium" },
	C: { track: "bg-orange-500", marker: "bg-orange-400", label: "Higher" },
	D: { track: "bg-red-500", marker: "bg-red-400", label: "High" },
};
