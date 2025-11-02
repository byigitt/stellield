"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  DollarSign,
  Percent,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StellarYieldOpportunities from "@/components/stellar-yield-opportunities";
import PortfolioSimulator from "@/components/portfolio-simulator";
import BridgeInsights from "@/components/bridge-insights";
import StellarProtocols from "@/components/stellar-protocols";
import {
  fetchChainTvlHistory,
  fetchDexOverview,
  fetchDefiLlamaPools,
} from "@/lib/data-sources";
import {
  computeRiskDistribution,
  RISK_COLOR_SCHEME,
} from "@/lib/metrics";
import { formatCompactUsd, formatPercentDelta } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Dashboard() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const { data: tvlHistory } = useQuery({
		queryKey: ["stellar-chain-tvl"],
		queryFn: () => fetchChainTvlHistory("Stellar"),
		staleTime: 5 * 60_000,
	});

	const { data: dexOverview } = useQuery({
		queryKey: ["stellar-dex-overview"],
		queryFn: () => fetchDexOverview("Stellar"),
		staleTime: 5 * 60_000,
	});

	const { data: stellarPools } = useQuery({
		queryKey: ["defillama-pools", "Stellar"],
		queryFn: () => fetchDefiLlamaPools("Stellar"),
		staleTime: 60_000,
		refetchInterval: 60_000,
	});

	const tvlSummary = useMemo(() => {
		if (!tvlHistory || tvlHistory.length === 0) {
			return { latest: null as number | null, changePct: null as number | null };
		}

		const latest = tvlHistory[tvlHistory.length - 1]?.tvl ?? null;
		const prevIndex = Math.max(tvlHistory.length - 8, 0);
		const previous = tvlHistory[prevIndex]?.tvl ?? null;

		const changePct =
			latest !== null && previous
				? ((latest - previous) / previous) * 100
				: null;

		return { latest, changePct };
	}, [tvlHistory]);

	const apySummary = useMemo(() => {
		if (!stellarPools || stellarPools.length === 0) {
			return { average: null as number | null, baseline: null as number | null };
		}

		const totals = stellarPools.reduce(
			(acc, pool) => {
				const apy = pool.apy ?? 0;
				const apy30d =
					pool.apyMean30d !== null && pool.apyMean30d !== undefined
						? pool.apyMean30d
						: apy;
				return {
					sum: acc.sum + apy,
					sum30d: acc.sum30d + apy30d,
				};
			},
			{ sum: 0, sum30d: 0 },
		);

		const average = totals.sum / stellarPools.length;
		const baseline = totals.sum30d / stellarPools.length;

		return {
			average,
			baseline,
		};
	}, [stellarPools]);

	const riskSummary = useMemo(
		() => computeRiskDistribution(stellarPools),
		[stellarPools],
	);

	const tierAShare =
		riskSummary.distribution.find((slice) => slice.tier === "A")
			?.percentage ?? 0;

	const stats = useMemo(() => {
		const tvlChangeLabel = formatPercentDelta(tvlSummary.changePct);
		const volumeChangeLabel = formatPercentDelta(
			dexOverview?.change_1d ?? null,
		);
		const apyDelta =
			apySummary.average !== null && apySummary.baseline !== null
				? apySummary.average - apySummary.baseline
				: null;
		const apyChangeLabel = formatPercentDelta(apyDelta);

		return [
			{
				id: "tvl",
				title: "Total Stellar TVL",
				value: formatCompactUsd(tvlSummary.latest),
				change: tvlChangeLabel,
				subLabel: "vs 7d ago",
				isPositive: (tvlSummary.changePct ?? 0) >= 0,
				showTrend: tvlChangeLabel !== null,
				icon: DollarSign,
			},
			{
				id: "volume",
				title: "24h DEX Volume",
				value: formatCompactUsd(dexOverview?.total24h ?? null),
				change: volumeChangeLabel ?? undefined,
				subLabel: "vs previous 24h",
				isPositive: (dexOverview?.change_1d ?? 0) >= 0,
				showTrend: volumeChangeLabel !== null,
				icon: Activity,
			},
			{
				id: "apy",
				title: "Average APY",
				value:
					apySummary.average !== null
						? `${apySummary.average.toFixed(2)}%`
						: "-",
				change: apyChangeLabel ?? undefined,
				subLabel: "vs 30d average",
				isPositive: (apyDelta ?? 0) >= 0,
				showTrend: apyChangeLabel !== null,
				icon: Percent,
			},
			{
				id: "protocols",
				title: "Tracked Protocols",
				value: riskSummary.total.toString(),
				change: `${tierAShare}% Tier A coverage`,
				subLabel: "Risk-weighted share",
				isPositive: tierAShare >= 40,
				showTrend: false,
				icon: Shield,
			},
		];
	}, [
		apySummary,
		dexOverview,
		riskSummary.total,
		tierAShare,
		tvlSummary,
	]);

	if (!mounted) {
		return <div className="min-h-screen" />;
	}

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-4 py-6">
				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{stats.map((card) => {
						const Icon = card.icon;
						const shouldShowTrend = (card.showTrend ?? true) && card.change !== null && card.change !== undefined;
						const isPositive = card.isPositive ?? true;
						const trendIcon =
							shouldShowTrend && isPositive ? (
								<TrendingUp className="w-3 h-3 mr-1" />
							) : (
								<TrendingDown className="w-3 h-3 mr-1" />
							);
						return (
							<Card key={card.id} className="glass-card border-white/10 p-6">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-gray-400">{card.title}</span>
									<Icon className="w-4 h-4 text-blue-300" />
								</div>
								<div className="text-2xl font-bold text-white mb-1">{card.value}</div>
								<div className="flex items-center text-sm">
									{card.change ? (
										<span
											className={cn(
												"flex items-center",
												card.showTrend === false
													? "text-gray-300"
													: isPositive
														? "text-green-400"
														: "text-red-400",
											)}
										>
											{shouldShowTrend && trendIcon}
											{card.change}
										</span>
									) : (
										<span className="text-gray-400">No change data</span>
									)}
									<span className="text-gray-500 ml-2">{card.subLabel}</span>
								</div>
							</Card>
						);
					})}
				</div>

				{/* Risk Distribution Bar */}
				<Card className="glass-card border-white/10 p-6 mb-8">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold text-white flex items-center">
							<Shield className="w-5 h-5 mr-2 text-yellow-400" />
							Risk Distribution
						</h2>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button className="cursor-help">
										<Info className="w-4 h-4 text-gray-400" />
									</button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Distribution of protocols by risk tier</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<div className="flex h-8 rounded-lg overflow-hidden mb-4">
						{riskSummary.distribution.map((slice) => (
							<div
								key={slice.tier}
								className={`${RISK_COLOR_SCHEME[slice.tier].track} opacity-80 hover:opacity-100 transition-opacity`}
								style={{ width: `${slice.percentage}%` }}
							/>
						))}
					</div>
					<div className="grid grid-cols-4 gap-4">
						{riskSummary.distribution.map((slice) => (
							<div key={slice.tier} className="text-center">
								<div className="text-xs text-gray-400 mb-1">
									Tier {slice.tier} ({RISK_COLOR_SCHEME[slice.tier].label})
								</div>
								<div className="text-sm font-medium text-white">{slice.percentage}%</div>
							</div>
						))}
					</div>
				</Card>

				{/* Main Content Tabs */}
				<Tabs defaultValue="opportunities" className="space-y-6">
					<TabsList className="glass-panel">
						<TabsTrigger value="opportunities">Opportunities</TabsTrigger>
						<TabsTrigger value="portfolio">Portfolio</TabsTrigger>
						<TabsTrigger value="protocols">Protocols</TabsTrigger>
						<TabsTrigger value="bridge">Bridge</TabsTrigger>
					</TabsList>

					<TabsContent value="opportunities" className="space-y-6">
						<StellarYieldOpportunities />
					</TabsContent>

					<TabsContent value="portfolio" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<PortfolioSimulator />
							<BridgeInsights />
						</div>
					</TabsContent>

					<TabsContent value="protocols" className="space-y-6">
						<StellarProtocols />
					</TabsContent>

					<TabsContent value="bridge" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2">
								<StellarProtocols />
							</div>
							<div className="lg:col-span-1">
								<BridgeInsights />
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
