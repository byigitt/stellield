"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Activity,
	ArrowRight,
	ArrowUpRight,
	Clock,
	DollarSign,
	Info,
	Link2,
	Loader2,
	TrendingUp,
} from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	type BridgeStats,
	type DexOverviewResponse,
	fetchAssetPriceUsd,
	fetchBridgeStats,
	fetchChainTvlHistory,
	fetchDexOverview,
	fetchDefiLlamaPools,
} from "@/lib/data-sources";
import { computeRiskDistribution } from "@/lib/metrics";
import { formatCompactUsd, formatPercentDelta } from "@/lib/format";

type BridgeId = "cctp" | "soroban" | "wormhole";

interface BridgeBannerStyle {
	background: string;
	border: string;
	text: string;
	icon: string;
	message: string;
}

interface BridgeCostModel {
	id: BridgeId;
	targetAsset: string;
	supportedChains: string[];
	description: string;
	baseFeeUsd: number;
	variableFeeBps: number;
	gasBaseUsd: number;
	gasVariableBps: number;
	slippageBps: number;
	minAmountUsd: number;
	maxAmountUsd?: number;
	recommended?: boolean;
	badgeLabel?: string;
	banner: BridgeBannerStyle;
}

interface BridgeRoute {
	id: BridgeId;
	name: string;
	from: string;
	to: string;
	model: BridgeCostModel;
	estimatedFee: string;
	estimatedTime: string;
	liquidity: string;
	supported: boolean;
	stats?: BridgeStats;
	volume24h?: string;
	volume7d?: string;
	txs24h?: string;
}

const CIRCLE_BRIDGE_ID = 51;
const WORMHOLE_BRIDGE_ID = 77;
const FALLBACK_XLM_PRICE = 0.11;

const usdFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const xlmFormatter = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

function formatUsd(value?: number | null) {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return "-";
	}
	return usdFormatter.format(value);
}

function formatXlm(value?: number | null) {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return "-";
	}
	return `${xlmFormatter.format(value)} XLM`;
}

const BRIDGE_COST_MODELS: Record<BridgeId, BridgeCostModel> = {
	cctp: {
		id: "cctp",
		targetAsset: "USDC",
		supportedChains: ["Ethereum", "Base", "Avalanche", "Solana"],
		description:
			"Native USDC burn & mint across supported networks. Protocol fee is $0; only gas is required.",
		baseFeeUsd: 0,
		variableFeeBps: 0,
		gasBaseUsd: 0.12,
		gasVariableBps: 5,
		slippageBps: 5,
		minAmountUsd: 10,
		recommended: true,
		badgeLabel: "$0 Fees",
		banner: {
			background: "bg-green-500/10",
			border: "border-green-500/20",
			text: "text-green-400",
			icon: "text-green-500",
			message:
				"Native USDC transfers with a burn & mint mechanism. No bridge fee, but destination gas still applies.",
		},
	},
	soroban: {
		id: "soroban",
		targetAsset: "Wrapped XLM (wXLM)",
		supportedChains: ["Ethereum"],
		description:
			"Foundation-operated Soroban bridge that wraps XLM to ERC-20. Includes custody verification before release.",
		baseFeeUsd: 2.5,
		variableFeeBps: 20,
		gasBaseUsd: 1.5,
		gasVariableBps: 7,
		slippageBps: 20,
		minAmountUsd: 25,
		badgeLabel: "Official",
		banner: {
			background: "bg-blue-500/10",
			border: "border-blue-500/20",
			text: "text-blue-300",
			icon: "text-blue-400",
			message:
				"Audited bridge with Stellar Foundation oversight. Expect a short custody window for confirmations.",
		},
	},
	wormhole: {
		id: "wormhole",
		targetAsset: "USDC / Wrapped Assets",
		supportedChains: ["Solana", "Ethereum", "Polygon"],
		description:
			"Wormhole guardians relay messages between chains. Fees cover validator signatures and destination execution.",
		baseFeeUsd: 1.8,
		variableFeeBps: 15,
		gasBaseUsd: 2.8,
		gasVariableBps: 8,
		slippageBps: 25,
		minAmountUsd: 50,
		banner: {
			background: "bg-purple-500/10",
			border: "border-purple-500/20",
			text: "text-purple-200",
			icon: "text-purple-300",
			message:
				"Guardian network posts attestations on both chains. Higher gas reflects Ethereum execution for redemption.",
		},
	},
};

const BRIDGE_BADGE_CLASSES: Record<BridgeId, string> = {
	cctp: "bg-green-500/20 text-green-400",
	soroban: "bg-blue-500/20 text-blue-400",
	wormhole: "bg-purple-500/20 text-purple-300",
};

function calculateTvlChange(tvlHistory?: { date: number; tvl: number }[]) {
	if (!tvlHistory || tvlHistory.length === 0) {
		return { latest: null, change: null };
	}
	const latest = tvlHistory[tvlHistory.length - 1]?.tvl ?? null;
	const previousIndex = Math.max(tvlHistory.length - 8, 0);
	const previous = tvlHistory[previousIndex]?.tvl ?? null;

	if (!latest || !previous) {
		return { latest, change: null };
	}

	const change = ((latest - previous) / previous) * 100;
	return { latest, change };
}

function computeBridgeRows(
	circle?: BridgeStats,
	wormhole?: BridgeStats,
): BridgeRoute[] {
	const rows: BridgeRoute[] = [];

	const cctpTopChain = circle
		? Object.entries(circle.chainBreakdown ?? {})
				.sort(
					(a, b) =>
						(b[1].lastDailyVolume ?? 0) -
						(a[1].lastDailyVolume ?? 0),
				)[0]?.[0]
		: null;

	rows.push({
		id: "cctp",
		name: "Circle CCTP",
		from: cctpTopChain ?? "Ethereum",
		to: "USDC Networks",
		model: BRIDGE_COST_MODELS.cctp,
		estimatedFee: formatUsd(BRIDGE_COST_MODELS.cctp.baseFeeUsd),
		estimatedTime: circle?.prevDayTxs
			? `${circle.prevDayTxs.deposits + circle.prevDayTxs.withdrawals} txs (prev day)`
			: "~5 min",
		liquidity: circle
			? `${formatCompactUsd(circle.weeklyVolume)} weekly volume`
			: "Fetching metrics…",
		supported: true,
		stats: circle,
		volume24h: circle ? formatCompactUsd(circle.lastDailyVolume) : undefined,
		volume7d: circle ? formatCompactUsd(circle.weeklyVolume) : undefined,
		txs24h: circle?.prevDayTxs
			? `${circle.prevDayTxs.deposits + circle.prevDayTxs.withdrawals}`
			: undefined,
	});

	rows.push({
		id: "soroban",
		name: "Soroban Bridge",
		from: "Stellar",
		to: "Ethereum",
		model: BRIDGE_COST_MODELS.soroban,
		estimatedFee: formatUsd(BRIDGE_COST_MODELS.soroban.baseFeeUsd),
		estimatedTime: "~5 min",
		liquidity: "$45M TVL (static)",
		supported: true,
	});

	if (wormhole) {
		const solanaStats = wormhole.chainBreakdown?.Solana;

		rows.push({
			id: "wormhole",
			name: "Wormhole",
			from: "Solana",
			to: "Ethereum",
			model: BRIDGE_COST_MODELS.wormhole,
			estimatedFee: formatUsd(BRIDGE_COST_MODELS.wormhole.baseFeeUsd),
			estimatedTime: wormhole.prevDayTxs
				? `${wormhole.prevDayTxs.deposits + wormhole.prevDayTxs.withdrawals} txs (prev day)`
				: "~3 min",
			liquidity: `${formatCompactUsd(wormhole.monthlyVolume)} monthly volume`,
			supported: true,
			stats: wormhole,
			volume24h: formatCompactUsd(solanaStats?.lastDailyVolume),
			volume7d: formatCompactUsd(solanaStats?.weeklyVolume),
			txs24h: solanaStats?.prevDayTxs
				? `${solanaStats.prevDayTxs.deposits + solanaStats.prevDayTxs.withdrawals}`
				: undefined,
		});
	} else {
		rows.push({
			id: "wormhole",
			name: "Wormhole",
			from: "Solana",
			to: "Ethereum",
			model: BRIDGE_COST_MODELS.wormhole,
			estimatedFee: formatUsd(BRIDGE_COST_MODELS.wormhole.baseFeeUsd),
			estimatedTime: "~3 min",
			liquidity: "Loading...",
			supported: true,
		});
	}

	return rows;
}

export default function BridgeInsights() {
	const [selectedBridge, setSelectedBridge] = useState<BridgeId>("cctp");
	const [bridgeAmount, setBridgeAmount] = useState("");

	const {
		data: stellarPools,
		isLoading: isLoadingPools,
	} = useQuery({
		queryKey: ["defillama-pools", "Stellar"],
		queryFn: () => fetchDefiLlamaPools("Stellar"),
		staleTime: 60_000,
		refetchInterval: 60_000,
	});

	const {
		data: chainTvlHistory,
		isLoading: isLoadingTvl,
	} = useQuery({
		queryKey: ["stellar-chain-tvl"],
		queryFn: () => fetchChainTvlHistory("Stellar"),
		staleTime: 5 * 60_000,
	});

	const {
		data: dexOverview,
		isLoading: isLoadingDex,
		error: dexError,
	} = useQuery({
		queryKey: ["stellar-dex-overview"],
		queryFn: () => fetchDexOverview("Stellar"),
		staleTime: 5 * 60_000,
	});

	const {
		data: circleStats,
		isLoading: isLoadingCircle,
		error: circleError,
	} = useQuery({
		queryKey: ["bridge-stats", CIRCLE_BRIDGE_ID],
		queryFn: () => fetchBridgeStats(CIRCLE_BRIDGE_ID),
		staleTime: 5 * 60_000,
		refetchInterval: 5 * 60_000,
	});

	const {
		data: wormholeStats,
		isLoading: isLoadingWormhole,
		error: wormholeError,
	} = useQuery({
		queryKey: ["bridge-stats", WORMHOLE_BRIDGE_ID],
		queryFn: () => fetchBridgeStats(WORMHOLE_BRIDGE_ID),
		staleTime: 5 * 60_000,
		refetchInterval: 5 * 60_000,
	});

	const {
		data: xlmUsdPrice,
		isLoading: isLoadingPrice,
		error: priceError,
	} = useQuery({
		queryKey: ["asset-price", "stellar"],
		queryFn: () => fetchAssetPriceUsd("stellar"),
		staleTime: 60_000,
		refetchInterval: 5 * 60_000,
	});

	const marketLoading = isLoadingPools || isLoadingTvl || isLoadingDex;

	const { latest: latestTvl, change: tvlChange } = useMemo(
		() => calculateTvlChange(chainTvlHistory),
		[chainTvlHistory],
	);

	const activeProtocols = useMemo(() => {
		if (!stellarPools) return 0;
		const unique = new Set(stellarPools.map((pool) => pool.project));
		return unique.size;
	}, [stellarPools]);

	const avgApy = useMemo(() => {
		if (!stellarPools || stellarPools.length === 0) return null;
		const total = stellarPools.reduce((sum, pool) => sum + (pool.apy ?? 0), 0);
		return total / stellarPools.length;
	}, [stellarPools]);

	const riskSummary = useMemo(
		() => computeRiskDistribution(stellarPools),
		[stellarPools],
	);

	const bridgeRows = useMemo(
		() => computeBridgeRows(circleStats, wormholeStats),
		[circleStats, wormholeStats],
	);

	const selectedBridgeStats = useMemo(
		() => bridgeRows.find((row) => row.id === selectedBridge),
		[bridgeRows, selectedBridge],
	);

	const resolvedXlmPrice = xlmUsdPrice ?? FALLBACK_XLM_PRICE;
	const usingFallbackPrice = !xlmUsdPrice && !isLoadingPrice;

	const parsedBridgeAmount = useMemo(() => {
		if (!bridgeAmount) return null;
		const numeric = Number.parseFloat(bridgeAmount);
		if (!Number.isFinite(numeric) || numeric <= 0) {
			return null;
		}
		return numeric;
	}, [bridgeAmount]);

	const amountUsd = useMemo(() => {
		if (parsedBridgeAmount === null) return null;
		return parsedBridgeAmount * resolvedXlmPrice;
	}, [parsedBridgeAmount, resolvedXlmPrice]);

	const bridgeEstimate = useMemo(() => {
		if (!selectedBridgeStats) {
			return null;
		}

		const model = selectedBridgeStats.model;
		const amountUsdValue = amountUsd ?? 0;
		const feeUsd =
			model.baseFeeUsd + (amountUsdValue * model.variableFeeBps) / 10_000;
		const gasUsd =
			model.gasBaseUsd + (amountUsdValue * model.gasVariableBps) / 10_000;
		const slippageUsd =
			model.slippageBps > 0
				? (amountUsdValue * model.slippageBps) / 10_000
				: 0;
		const totalUsd = feeUsd + gasUsd + slippageUsd;
		const totalXlm = totalUsd / resolvedXlmPrice;
		const netUsd =
			amountUsd !== null ? Math.max(amountUsd - totalUsd, 0) : null;
		const netXlm =
			parsedBridgeAmount !== null
				? Math.max(parsedBridgeAmount - totalXlm, 0)
				: null;
		const effectiveBps =
			amountUsd !== null && amountUsd > 0
				? (totalUsd / amountUsd) * 10_000
				: null;
		const belowMinimum =
			amountUsd !== null && amountUsd < model.minAmountUsd;
		const aboveMaximum =
			model.maxAmountUsd !== undefined &&
			amountUsd !== null &&
			amountUsd > model.maxAmountUsd;

		return {
			feeUsd,
			gasUsd,
			slippageUsd,
			totalUsd,
			totalXlm,
			netUsd,
			netXlm,
			effectiveBps,
			belowMinimum,
			aboveMaximum,
		};
	}, [
		selectedBridgeStats,
		amountUsd,
		parsedBridgeAmount,
		resolvedXlmPrice,
	]);

	const minTransferXlm = useMemo(() => {
		if (!selectedBridgeStats) return null;
		return selectedBridgeStats.model.minAmountUsd / resolvedXlmPrice;
	}, [selectedBridgeStats, resolvedXlmPrice]);

	const maxTransferXlm = useMemo(() => {
		if (
			!selectedBridgeStats ||
			selectedBridgeStats.model.maxAmountUsd === undefined
		) {
			return null;
		}
		return selectedBridgeStats.model.maxAmountUsd / resolvedXlmPrice;
	}, [selectedBridgeStats, resolvedXlmPrice]);

	return (
		<div className="space-y-6">
			{/* Market Overview */}
			<div className="glass-card rounded-xl p-6 border border-white/10">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-white">Market Overview</h2>
					<ArrowUpRight className="w-5 h-5 text-gray-400" />
				</div>
				{marketLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="w-5 h-5 animate-spin text-gray-400" />
					</div>
				) : (
					<div className="space-y-3">
						<div>
							<div className="text-sm text-gray-400 mb-1">Stellar TVL</div>
							<div className="text-2xl font-bold text-white">
								{formatCompactUsd(latestTvl)}
							</div>
							{tvlChange !== null && (
								<div
									className={`text-xs flex items-center mt-1 ${
										tvlChange >= 0 ? "text-green-400" : "text-red-400"
									}`}
								>
									<TrendingUp className="w-3 h-3 mr-1" />
									{tvlChange >= 0 ? "+" : ""}
									{tvlChange.toFixed(2)}% (7d)
								</div>
							)}
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<div className="text-xs text-gray-400 mb-1">24h Volume</div>
								<div className="text-sm font-medium text-white">
									{formatCompactUsd((dexOverview as DexOverviewResponse)?.total24h ?? null)}
								</div>
								<div className="text-xs text-gray-400">
									{formatPercentDelta((dexOverview as DexOverviewResponse)?.change_1d ?? null) ?? "-"}
								</div>
							</div>
							<div>
								<div className="text-xs text-gray-400 mb-1">Active Protocols</div>
								<div className="text-sm font-medium text-white">
									{activeProtocols || "-"}
								</div>
								<div className="text-xs text-gray-400">
									Tracking DefiLlama pools
								</div>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<div className="text-xs text-gray-400 mb-1">Avg APY</div>
								<div className="text-sm font-medium text-white">
									{avgApy !== null ? `${avgApy.toFixed(2)}%` : "-"}
								</div>
							</div>
							<div>
								<div className="text-xs text-gray-400 mb-1">Risk Score</div>
								<div className="text-sm font-medium text-yellow-400">
									{riskSummary.grade}
								</div>
							</div>
						</div>
						{dexError && (
							<div className="text-xs text-red-400">
								Failed to refresh DEX overview. Showing last known data.
							</div>
						)}
					</div>
				)}
			</div>

			{/* Bridge Cost Estimator */}
			<div className="glass-card rounded-xl p-6 border border-white/10">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-white">Bridge Estimator</h2>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Link2 className="w-5 h-5 text-blue-400" />
							</TooltipTrigger>
							<TooltipContent>
								<p>Estimate cross-chain transfer costs</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				{/* Bridge Selection */}
				<div className="mb-4">
					<label className="text-xs text-gray-400 mb-1 block">Select Bridge</label>
					<Select
						value={selectedBridge}
						onValueChange={(value) => setSelectedBridge(value as BridgeId)}
					>
						<SelectTrigger className="w-full bg-white/5 border-white/10">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{bridgeRows.map((route) => (
								<SelectItem key={route.id} value={route.id}>
									{route.name}
									{route.model.recommended ? " (Recommended)" : ""}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Amount Input */}
				<div className="mb-4">
					<label className="text-xs text-gray-400 mb-1 block">Amount (XLM)</label>
					<div className="flex space-x-2">
						<input
							type="number"
							placeholder="1,000"
							value={bridgeAmount}
							onChange={(e) => setBridgeAmount(e.target.value)}
							className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/20"
						/>
						<Button
							size="sm"
							className="bg-white/5 border border-white/10 hover:bg-white/10"
							onClick={() => setBridgeAmount("1000")}
						>
							Max
						</Button>
					</div>
				</div>

				{/* Bridge Routes */}
				<div className="space-y-3 mb-4">
					{(isLoadingCircle || isLoadingWormhole) && (
						<div className="flex items-center text-xs text-gray-400">
							<Loader2 className="w-4 h-4 animate-spin mr-2" />
							Fetching bridge metrics…
						</div>
					)}
					{(circleError || wormholeError) && (
						<div className="text-xs text-red-400">
							Some bridge analytics failed to load. Showing partial data.
						</div>
					)}
					{bridgeRows.map((route) => {
						const isSelected = route.id === selectedBridge;
						return (
							<button
								key={route.id}
								type="button"
								onClick={() => setSelectedBridge(route.id)}
								className={`w-full text-left glass-panel rounded-lg p-3 transition-colors border ${
									isSelected
										? "border-blue-400/60 bg-white/10 shadow-[0_8px_24px_rgba(59,130,246,0.12)]"
										: "border-white/10 hover:bg-white/5"
								}`}
							>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center space-x-2">
										<div className="text-sm font-medium text-white">
											{route.name}
										</div>
										{route.model.badgeLabel && (
											<span
												className={`text-xs px-2 py-0.5 rounded ${BRIDGE_BADGE_CLASSES[route.id]}`}
											>
												{route.model.badgeLabel}
											</span>
										)}
										{route.model.recommended && (
											<span className="text-[11px] text-blue-300">
												Recommended
											</span>
										)}
										{!route.supported && (
											<span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
												Deprecated
											</span>
										)}
									</div>
									<div className="flex items-center space-x-1 text-xs text-gray-400">
										<span>{route.from}</span>
										<ArrowRight className="w-3 h-3" />
										<span>{route.to}</span>
									</div>
								</div>
								<div className="grid grid-cols-3 gap-2 text-xs">
									<div className="flex items-center space-x-1">
										<DollarSign className="w-3 h-3 text-gray-500" />
										<span className="text-gray-300">
											{route.estimatedFee}
										</span>
									</div>
									<div className="flex items-center space-x-1">
										<Clock className="w-3 h-3 text-gray-500" />
										<span className="text-gray-300">
											{route.estimatedTime}
										</span>
									</div>
									<div className="flex items-center space-x-1">
										<Activity className="w-3 h-3 text-gray-500" />
										<span className="text-gray-300">{route.liquidity}</span>
									</div>
								</div>
								<div className="mt-2 text-[11px] text-gray-500">
									Output asset: {route.model.targetAsset} · Supported chains:{" "}
									{route.model.supportedChains.join(", ")}
								</div>
								{(route.volume24h || route.volume7d || route.txs24h) && (
									<div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-400">
										<div>
											<span className="block text-gray-500">24h Volume</span>
											<span className="text-white/80">
												{route.volume24h ?? "-"}
											</span>
										</div>
										<div>
											<span className="block text-gray-500">7d Volume</span>
											<span className="text-white/80">
												{route.volume7d ?? "-"}
											</span>
										</div>
										<div>
											<span className="block text-gray-500">Prev Day TXs</span>
											<span className="text-white/80">
												{route.txs24h ?? "-"}
											</span>
										</div>
									</div>
								)}
							</button>
						);
					})}
				</div>

				{/* Estimation Summary */}
				<div className="glass-panel rounded-lg p-3 mb-4">
					<div className="space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-400">Notional</span>
							<div className="text-right">
								<div className="text-white font-medium">
									{parsedBridgeAmount !== null
										? formatXlm(parsedBridgeAmount)
										: "-"}
								</div>
								<div className="text-[11px] text-gray-500">
									{amountUsd !== null ? formatUsd(amountUsd) : "-"}
								</div>
							</div>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-400">Bridge Fee</span>
							<div className="text-right">
								<div className="text-green-400 font-medium">
									{formatUsd(bridgeEstimate?.feeUsd)}
								</div>
								<div className="text-[11px] text-gray-500">
									{formatXlm(
										bridgeEstimate
											? bridgeEstimate.feeUsd / resolvedXlmPrice
											: null,
									)}
								</div>
							</div>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-400">Gas Cost (est.)</span>
							<div className="text-right">
								<div className="text-white">
									{formatUsd(bridgeEstimate?.gasUsd)}
								</div>
								<div className="text-[11px] text-gray-500">
									{formatXlm(
										bridgeEstimate
											? bridgeEstimate.gasUsd / resolvedXlmPrice
											: null,
									)}
								</div>
							</div>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-400">Slippage Buffer</span>
							<div className="text-right">
								<div className="text-white">
									{formatUsd(bridgeEstimate?.slippageUsd)}
								</div>
								<div className="text-[11px] text-gray-500">
									{formatXlm(
										bridgeEstimate
											? bridgeEstimate.slippageUsd / resolvedXlmPrice
											: null,
									)}
								</div>
							</div>
						</div>
						<div className="pt-2 border-t border-white/10 flex justify-between">
							<span className="text-gray-400">Total Estimated Cost</span>
							<div className="text-right">
								<div className="text-green-400 font-medium">
									{formatUsd(bridgeEstimate?.totalUsd)}
								</div>
								<div className="text-[11px] text-gray-500">
									{formatXlm(bridgeEstimate?.totalXlm)}
								</div>
							</div>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-400">
								Est. Received ({selectedBridgeStats?.model.targetAsset ?? "—"})
							</span>
							<div className="text-right">
								<div className="text-white font-medium">
									{formatUsd(bridgeEstimate?.netUsd)}
								</div>
								<div className="text-[11px] text-gray-500">
									{formatXlm(bridgeEstimate?.netXlm)}
								</div>
							</div>
						</div>
						{bridgeEstimate && bridgeEstimate.effectiveBps !== null && (
							<div className="flex justify-between text-xs text-gray-400">
								<span>Effective Cost</span>
								<span>{bridgeEstimate.effectiveBps.toFixed(2)} bps</span>
							</div>
						)}
						{selectedBridgeStats?.volume24h && (
							<div className="flex justify-between text-xs text-gray-400">
								<span>Network 24h Volume</span>
								<span>{selectedBridgeStats.volume24h}</span>
							</div>
						)}
					</div>
					{parsedBridgeAmount === null && (
						<div className="mt-3 text-xs text-gray-400">
							Enter an amount to generate personalized estimates.
						</div>
					)}
					{bridgeEstimate?.belowMinimum && minTransferXlm !== null && (
						<div className="mt-3 text-xs text-yellow-400">
							Below recommended size. Minimum suggested transfer is{" "}
							{formatUsd(selectedBridgeStats?.model.minAmountUsd)} (~
							{formatXlm(minTransferXlm)}).
						</div>
					)}
					{bridgeEstimate?.aboveMaximum && maxTransferXlm !== null && (
						<div className="mt-1 text-xs text-yellow-400">
							Exceeds automated quote size. Consider splitting transfers above{" "}
							{formatUsd(selectedBridgeStats?.model.maxAmountUsd)} (~
							{formatXlm(maxTransferXlm)}).
						</div>
					)}
					{usingFallbackPrice && (
						<div className="mt-1 text-xs text-gray-500">
							{`Live XLM price unavailable—using fallback $${FALLBACK_XLM_PRICE.toFixed(
								2,
							)}.`}
						</div>
					)}
					{priceError && (
						<div className="mt-1 text-xs text-red-400">
							Failed to refresh XLM pricing. Costs may deviate from execution.
						</div>
					)}
				</div>

				{selectedBridgeStats && (
					<div
						className={`flex items-start space-x-2 p-3 rounded-lg border mb-4 ${selectedBridgeStats.model.banner.background} ${selectedBridgeStats.model.banner.border}`}
					>
						<Info
							className={`w-4 h-4 mt-0.5 ${selectedBridgeStats.model.banner.icon}`}
						/>
						<div className={`text-xs ${selectedBridgeStats.model.banner.text}`}>
							<strong>{selectedBridgeStats.name}:</strong>{" "}
							{selectedBridgeStats.model.banner.message}
						</div>
					</div>
				)}

				{selectedBridgeStats && (
					<div className="text-xs text-gray-400 mb-4">
						{selectedBridgeStats.model.description}
					</div>
				)}

				<Button className="w-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200">
					View {selectedBridgeStats?.name ?? "Bridge"} Details
				</Button>
			</div>
		</div>
	);
}
