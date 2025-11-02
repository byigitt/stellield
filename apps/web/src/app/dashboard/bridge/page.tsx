"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	AreaChart,
	Area,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import {
	ArrowUpRight,
	Loader2,
	TrendingUp,
	Clock,
	DollarSign,
	Activity,
	Shield,
	CheckCircle,
	XCircle,
	Info,
} from "lucide-react";
import {
	type BridgeStats,
	fetchBridgeStats,
} from "@/lib/data-sources";
import { formatCompactUsd } from "@/lib/format";

const CIRCLE_BRIDGE_ID = 51;
const WORMHOLE_BRIDGE_ID = 77;

type BridgeId = "cctp" | "soroban" | "wormhole";

interface BridgeCostModel {
	id: BridgeId;
	name: string;
	targetAsset: string;
	supportedChains: string[];
	description: string;
	baseFeeUsd: number;
	variableFeeBps: number;
	gasBaseUsd: number;
	gasVariableBps: number;
	slippageBps: number;
	minAmountUsd: number;
	security: "High" | "Medium";
	auditStatus: "Audited" | "Foundation-backed" | "Community";
	recommended?: boolean;
}

const BRIDGE_COST_MODELS: Record<BridgeId, BridgeCostModel> = {
	cctp: {
		id: "cctp",
		name: "Circle CCTP",
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
		security: "High",
		auditStatus: "Audited",
		recommended: true,
	},
	soroban: {
		id: "soroban",
		name: "Soroban Bridge",
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
		security: "High",
		auditStatus: "Foundation-backed",
	},
	wormhole: {
		id: "wormhole",
		name: "Wormhole",
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
		security: "High",
		auditStatus: "Audited",
	},
};

const BRIDGE_COLORS: Record<BridgeId, string> = {
	cctp: "#10b981", // green
	soroban: "#3b82f6", // blue
	wormhole: "#a855f7", // purple
};

const CHART_COLORS = {
	grid: "#ffffff15",
	text: "#9ca3af",
	tooltip: "#1f2937",
};

export default function BridgePage() {
	const {
		data: circleStats,
		isLoading: isLoadingCircle,
	} = useQuery({
		queryKey: ["bridge-stats", CIRCLE_BRIDGE_ID],
		queryFn: () => fetchBridgeStats(CIRCLE_BRIDGE_ID),
		staleTime: 5 * 60_000,
		refetchInterval: 5 * 60_000,
	});

	const {
		data: wormholeStats,
		isLoading: isLoadingWormhole,
	} = useQuery({
		queryKey: ["bridge-stats", WORMHOLE_BRIDGE_ID],
		queryFn: () => fetchBridgeStats(WORMHOLE_BRIDGE_ID),
		staleTime: 5 * 60_000,
		refetchInterval: 5 * 60_000,
	});

	const isLoading = isLoadingCircle || isLoadingWormhole;

	// Volume comparison data
	const volumeData = useMemo(() => {
		return [
			{
				period: "24h",
				CCTP: circleStats?.lastDailyVolume || 0,
				Soroban: 1200000, // Static data
				Wormhole: wormholeStats?.lastDailyVolume || 0,
			},
			{
				period: "7d",
				CCTP: circleStats?.weeklyVolume || 0,
				Soroban: 8500000, // Static data
				Wormhole: wormholeStats?.weeklyVolume || 0,
			},
			{
				period: "30d",
				CCTP: circleStats?.monthlyVolume || 0,
				Soroban: 35000000, // Static data
				Wormhole: wormholeStats?.monthlyVolume || 0,
			},
		];
	}, [circleStats, wormholeStats]);

	// Transaction count data
	const txCountData = useMemo(() => {
		const cctpTxs = circleStats?.prevDayTxs
			? circleStats.prevDayTxs.deposits + circleStats.prevDayTxs.withdrawals
			: 0;
		const wormholeTxs = wormholeStats?.prevDayTxs
			? wormholeStats.prevDayTxs.deposits + wormholeStats.prevDayTxs.withdrawals
			: 0;

		return [
			{
				name: "CCTP",
				deposits: circleStats?.prevDayTxs?.deposits || 0,
				withdrawals: circleStats?.prevDayTxs?.withdrawals || 0,
				total: cctpTxs,
			},
			{
				name: "Soroban",
				deposits: 450, // Static data
				withdrawals: 380, // Static data
				total: 830,
			},
			{
				name: "Wormhole",
				deposits: wormholeStats?.prevDayTxs?.deposits || 0,
				withdrawals: wormholeStats?.prevDayTxs?.withdrawals || 0,
				total: wormholeTxs,
			},
		];
	}, [circleStats, wormholeStats]);

	// Fee comparison data
	const feeData = useMemo(() => {
		return [
			{
				bridge: "CCTP",
				baseFee: BRIDGE_COST_MODELS.cctp.baseFeeUsd,
				gasEstimate: BRIDGE_COST_MODELS.cctp.gasBaseUsd,
			},
			{
				bridge: "Soroban",
				baseFee: BRIDGE_COST_MODELS.soroban.baseFeeUsd,
				gasEstimate: BRIDGE_COST_MODELS.soroban.gasBaseUsd,
			},
			{
				bridge: "Wormhole",
				baseFee: BRIDGE_COST_MODELS.wormhole.baseFeeUsd,
				gasEstimate: BRIDGE_COST_MODELS.wormhole.gasBaseUsd,
			},
		];
	}, []);

	// Chain distribution for CCTP
	const chainDistributionData = useMemo(() => {
		if (!circleStats?.chainBreakdown) return [];

		return Object.entries(circleStats.chainBreakdown)
			.map(([chain, data]) => ({
				name: chain,
				value: data.lastDailyVolume || 0,
			}))
			.sort((a, b) => b.value - a.value)
			.slice(0, 5);
	}, [circleStats]);

	const PIE_COLORS = ["#10b981", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444"];

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#151932] to-[#1a1f3a]">
			<div className="container mx-auto px-4 py-6">
				{/* Page Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">Bridge Comparison</h1>
					<p className="text-gray-400">
						Compare cross-chain bridge solutions, fees, and performance metrics
					</p>
				</div>

				{isLoading && (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="w-8 h-8 animate-spin text-blue-400" />
					</div>
				)}

				{!isLoading && (
					<>
						{/* Bridge Comparison Cards */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
							{Object.values(BRIDGE_COST_MODELS).map((bridge) => (
								<div
									key={bridge.id}
									className="glass-card rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
								>
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-xl font-semibold text-white">
											{bridge.name}
										</h3>
										{bridge.recommended && (
											<span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
												Recommended
											</span>
										)}
									</div>

									<div className="space-y-4">
										<div>
											<div className="text-xs text-gray-400 mb-1">Target Asset</div>
											<div className="text-sm font-medium text-white">
												{bridge.targetAsset}
											</div>
										</div>

										<div>
											<div className="text-xs text-gray-400 mb-1">Base Fee</div>
											<div className="text-lg font-bold text-white">
												${bridge.baseFeeUsd.toFixed(2)}
											</div>
										</div>

										<div>
											<div className="text-xs text-gray-400 mb-1">Gas Estimate</div>
											<div className="text-sm font-medium text-white">
												${bridge.gasBaseUsd.toFixed(2)}
											</div>
										</div>

										<div>
											<div className="text-xs text-gray-400 mb-1">Security</div>
											<div className="flex items-center space-x-2">
												<Shield className="w-4 h-4 text-green-400" />
												<span className="text-sm font-medium text-white">
													{bridge.security}
												</span>
											</div>
										</div>

										<div>
											<div className="text-xs text-gray-400 mb-1">Audit Status</div>
											<div className="flex items-center space-x-2">
												<CheckCircle className="w-4 h-4 text-blue-400" />
												<span className="text-sm text-white">
													{bridge.auditStatus}
												</span>
											</div>
										</div>

										<div>
											<div className="text-xs text-gray-400 mb-1">
												Supported Chains
											</div>
											<div className="flex flex-wrap gap-1 mt-1">
												{bridge.supportedChains.map((chain) => (
													<span
														key={chain}
														className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300"
													>
														{chain}
													</span>
												))}
											</div>
										</div>

										<div className="pt-4 border-t border-white/10">
											<p className="text-xs text-gray-400">{bridge.description}</p>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Volume Comparison Chart */}
						<div className="glass-card rounded-xl p-6 border border-white/10 mb-8">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-white">
									Volume Comparison
								</h2>
								<TrendingUp className="w-5 h-5 text-blue-400" />
							</div>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={volumeData}>
									<CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
									<XAxis dataKey="period" stroke={CHART_COLORS.text} />
									<YAxis
										stroke={CHART_COLORS.text}
										tickFormatter={(value) =>
											`$${(value / 1000000).toFixed(0)}M`
										}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: CHART_COLORS.tooltip,
											border: "1px solid rgba(255,255,255,0.1)",
											borderRadius: "8px",
										}}
										formatter={(value: number) => [
											formatCompactUsd(value),
											"Volume",
										]}
									/>
									<Legend />
									<Bar dataKey="CCTP" fill={BRIDGE_COLORS.cctp} />
									<Bar dataKey="Soroban" fill={BRIDGE_COLORS.soroban} />
									<Bar dataKey="Wormhole" fill={BRIDGE_COLORS.wormhole} />
								</BarChart>
							</ResponsiveContainer>
						</div>

						{/* Transaction Activity & Fee Comparison */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
							{/* Transaction Activity */}
							<div className="glass-card rounded-xl p-6 border border-white/10">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-xl font-semibold text-white">
										Transaction Activity (24h)
									</h2>
									<Activity className="w-5 h-5 text-purple-400" />
								</div>
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={txCountData}>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke={CHART_COLORS.grid}
										/>
										<XAxis dataKey="name" stroke={CHART_COLORS.text} />
										<YAxis stroke={CHART_COLORS.text} />
										<Tooltip
											contentStyle={{
												backgroundColor: CHART_COLORS.tooltip,
												border: "1px solid rgba(255,255,255,0.1)",
												borderRadius: "8px",
											}}
										/>
										<Legend />
										<Bar dataKey="deposits" stackId="a" fill="#10b981" />
										<Bar dataKey="withdrawals" stackId="a" fill="#3b82f6" />
									</BarChart>
								</ResponsiveContainer>
							</div>

							{/* Fee Comparison */}
							<div className="glass-card rounded-xl p-6 border border-white/10">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-xl font-semibold text-white">
										Fee Structure
									</h2>
									<DollarSign className="w-5 h-5 text-green-400" />
								</div>
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={feeData}>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke={CHART_COLORS.grid}
										/>
										<XAxis dataKey="bridge" stroke={CHART_COLORS.text} />
										<YAxis stroke={CHART_COLORS.text} />
										<Tooltip
											contentStyle={{
												backgroundColor: CHART_COLORS.tooltip,
												border: "1px solid rgba(255,255,255,0.1)",
												borderRadius: "8px",
											}}
											formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
										/>
										<Legend />
										<Bar dataKey="baseFee" fill="#f59e0b" name="Base Fee" />
										<Bar dataKey="gasEstimate" fill="#ef4444" name="Gas Estimate" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Chain Distribution & Performance Metrics */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
							{/* Chain Distribution */}
							<div className="glass-card rounded-xl p-6 border border-white/10">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-xl font-semibold text-white">
										CCTP Chain Distribution (24h)
									</h2>
									<ArrowUpRight className="w-5 h-5 text-blue-400" />
								</div>
								{chainDistributionData.length > 0 ? (
									<ResponsiveContainer width="100%" height={300}>
										<PieChart>
											<Pie
												data={chainDistributionData}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({ name, percent }) =>
													`${name}: ${(percent * 100).toFixed(0)}%`
												}
												outerRadius={100}
												fill="#8884d8"
												dataKey="value"
											>
												{chainDistributionData.map((entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={PIE_COLORS[index % PIE_COLORS.length]}
													/>
												))}
											</Pie>
											<Tooltip
												contentStyle={{
													backgroundColor: CHART_COLORS.tooltip,
													border: "1px solid rgba(255,255,255,0.1)",
													borderRadius: "8px",
												}}
												formatter={(value: number) => [
													formatCompactUsd(value),
													"Volume",
												]}
											/>
										</PieChart>
									</ResponsiveContainer>
								) : (
									<div className="flex items-center justify-center h-[300px] text-gray-400">
										No chain distribution data available
									</div>
								)}
							</div>

							{/* Performance Metrics */}
							<div className="glass-card rounded-xl p-6 border border-white/10">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-xl font-semibold text-white">
										Performance Metrics
									</h2>
									<Clock className="w-5 h-5 text-yellow-400" />
								</div>
								<div className="space-y-4">
									{Object.values(BRIDGE_COST_MODELS).map((bridge) => (
										<div
											key={bridge.id}
											className="p-4 rounded-lg bg-white/5 border border-white/10"
										>
											<div className="flex items-center justify-between mb-3">
												<span className="font-medium text-white">
													{bridge.name}
												</span>
												<span
													className="w-3 h-3 rounded-full"
													style={{ backgroundColor: BRIDGE_COLORS[bridge.id] }}
												/>
											</div>
											<div className="grid grid-cols-2 gap-3 text-sm">
												<div>
													<div className="text-xs text-gray-400">Avg Time</div>
													<div className="text-white font-medium">
														{bridge.id === "cctp"
															? "~5 min"
															: bridge.id === "soroban"
															? "~5 min"
															: "~3 min"}
													</div>
												</div>
												<div>
													<div className="text-xs text-gray-400">Success Rate</div>
													<div className="text-green-400 font-medium">
														{bridge.id === "cctp" ? "99.8%" : "99.5%"}
													</div>
												</div>
												<div>
													<div className="text-xs text-gray-400">Min Transfer</div>
													<div className="text-white font-medium">
														${bridge.minAmountUsd}
													</div>
												</div>
												<div>
													<div className="text-xs text-gray-400">Slippage</div>
													<div className="text-white font-medium">
														{(bridge.slippageBps / 100).toFixed(2)}%
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Real-time Stats Summary */}
						<div className="glass-card rounded-xl p-6 border border-white/10">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-white">
									Real-time Statistics
								</h2>
								<Info className="w-5 h-5 text-blue-400" />
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{/* CCTP Stats */}
								<div className="p-4 rounded-lg bg-white/5 border border-white/10">
									<h3 className="text-lg font-semibold text-white mb-3">
										Circle CCTP
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-gray-400">24h Volume:</span>
											<span className="text-white font-medium">
												{formatCompactUsd(circleStats?.lastDailyVolume)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Weekly Volume:</span>
											<span className="text-white font-medium">
												{formatCompactUsd(circleStats?.weeklyVolume)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Monthly Volume:</span>
											<span className="text-white font-medium">
												{formatCompactUsd(circleStats?.monthlyVolume)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">24h Transactions:</span>
											<span className="text-white font-medium">
												{circleStats?.prevDayTxs
													? circleStats.prevDayTxs.deposits +
													  circleStats.prevDayTxs.withdrawals
													: "-"}
											</span>
										</div>
									</div>
								</div>

								{/* Soroban Stats (Static) */}
								<div className="p-4 rounded-lg bg-white/5 border border-white/10">
									<h3 className="text-lg font-semibold text-white mb-3">
										Soroban Bridge
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-gray-400">24h Volume:</span>
											<span className="text-white font-medium">$1.2M</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Weekly Volume:</span>
											<span className="text-white font-medium">$8.5M</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Monthly Volume:</span>
											<span className="text-white font-medium">$35M</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">24h Transactions:</span>
											<span className="text-white font-medium">830</span>
										</div>
									</div>
								</div>

								{/* Wormhole Stats */}
								<div className="p-4 rounded-lg bg-white/5 border border-white/10">
									<h3 className="text-lg font-semibold text-white mb-3">
										Wormhole
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-gray-400">24h Volume:</span>
											<span className="text-white font-medium">
												{formatCompactUsd(wormholeStats?.lastDailyVolume)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Weekly Volume:</span>
											<span className="text-white font-medium">
												{formatCompactUsd(wormholeStats?.weeklyVolume)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Monthly Volume:</span>
											<span className="text-white font-medium">
												{formatCompactUsd(wormholeStats?.monthlyVolume)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">24h Transactions:</span>
											<span className="text-white font-medium">
												{wormholeStats?.prevDayTxs
													? wormholeStats.prevDayTxs.deposits +
													  wormholeStats.prevDayTxs.withdrawals
													: "-"}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
