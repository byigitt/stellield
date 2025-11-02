import Dashboard from "./dashboard";
import { fetchChainTvlHistory } from "@/lib/data-sources";
import { formatCompactUsd, formatPercentDelta } from "@/lib/format";

export default async function DashboardPage() {
	const tvlHistory = await fetchChainTvlHistory("Stellar");
	const latestTvl = tvlHistory.length > 0 ? tvlHistory[tvlHistory.length - 1]?.tvl ?? null : null;
	const previousIndex = Math.max(tvlHistory.length - 8, 0);
	const previousTvl = tvlHistory.length > 0 ? tvlHistory[previousIndex]?.tvl ?? null : null;

	const tvlChange =
		latestTvl !== null && previousTvl
			? ((latestTvl - previousTvl) / previousTvl) * 100
			: null;

	const changeLabel = formatPercentDelta(tvlChange);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#151932] to-[#1a1f3a]">
			{/* Main Content */}
			<div className="container mx-auto px-4 py-6">
				<h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
				<p className="text-gray-400">
					Stellar DeFi TVL is currently {formatCompactUsd(latestTvl)}
					{changeLabel ? ` (${changeLabel} over the past 7 days)` : ""}. Explore the live opportunities and risk metrics below.
				</p>
			</div>
			<Dashboard />
		</div>
	);
}