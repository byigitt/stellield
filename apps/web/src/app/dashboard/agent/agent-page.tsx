"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Brain,
	TrendingUp,
	Shield,
	DollarSign,
	Sparkles,
	AlertTriangle,
	Info,
	Clock,
	Target,
	PieChart,
	Loader2,
	RefreshCw,
} from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RISK_COLOR_SCHEME } from "@/lib/metrics";

const RISK_OPTIONS = [
	{ 
		value: "low", 
		label: "Low Risk", 
		description: "Safer, stable yields",
		icon: Shield,
		color: "from-green-500 to-emerald-600",
		bgGradient: "from-green-950/40 to-green-900/20",
		borderColor: "border-green-700/30",
		hoverBorder: "hover:border-green-500/50",
		selectedBorder: "border-green-500",
		textColor: "text-green-400",
		percentage: "5-10%"
	},
	{ 
		value: "medium", 
		label: "Medium Risk", 
		description: "Balanced approach",
		icon: TrendingUp,
		color: "from-yellow-500 to-orange-600",
		bgGradient: "from-yellow-950/40 to-yellow-900/20",
		borderColor: "border-yellow-700/30",
		hoverBorder: "hover:border-yellow-500/50",
		selectedBorder: "border-yellow-500",
		textColor: "text-yellow-400",
		percentage: "10-20%"
	},
	{ 
		value: "high", 
		label: "High Risk", 
		description: "Maximum returns",
		icon: AlertTriangle,
		color: "from-red-500 to-rose-600",
		bgGradient: "from-red-950/40 to-red-900/20",
		borderColor: "border-red-700/30",
		hoverBorder: "hover:border-red-500/50",
		selectedBorder: "border-red-500",
		textColor: "text-red-400",
		percentage: "20%+"
	},
];

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export default function AgentPage() {
	const [amount, setAmount] = useState("10000");
	const [riskTolerance, setRiskTolerance] = useState<"low" | "medium" | "high">("medium");
	const [enabledQuery, setEnabledQuery] = useState(false);

	// Query with 15-minute cache and auto-refresh (only when enabled)
	const { data, isLoading, error, refetch, dataUpdatedAt } = trpc.agent.getRecommendations.useQuery(
		{
			amount_usd: parseFloat(amount) || 10000,
			risk_tolerance: riskTolerance,
			preferred_chains: ["Stellar", "Ethereum"],
			min_liquidity_usd: 50000,
		},
		{
			enabled: enabledQuery,
			staleTime: CACHE_DURATION,
			refetchInterval: enabledQuery ? CACHE_DURATION : false, // Only auto-refresh if query is enabled
			retry: 2,
		},
	);

	const recommendation = data?.recommendation;
	const lastUpdated = new Date(dataUpdatedAt);
	const timeSinceUpdate = useMemo(() => {
		const now = new Date();
		const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
		if (diff < 60) return `${diff}s ago`;
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
		return `${Math.floor(diff / 3600)}h ago`;
	}, [lastUpdated, dataUpdatedAt]);

	const handleRefresh = () => {
		setEnabledQuery(true); // Enable the query
		refetch();
	};

	return (
		<div className="container mx-auto px-4 pb-12">
			{/* Hero Section with Controls */}
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 border border-blue-800/30 mb-8">
				{/* Animated Background */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.1),transparent_50%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.15),transparent_50%)]" />
				
				<div className="relative p-8">
					{/* Header */}
					<div className="flex items-center space-x-3 mb-6">
						<div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
							<Brain className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-white">AI Yield Optimizer</h1>
							<p className="text-sm text-blue-200">Get personalized DeFi recommendations powered by AI</p>
						</div>
					</div>

					{/* Controls Grid */}
					<div className="space-y-6">
						{/* Amount Input */}
						<div className="space-y-3">
							<Label htmlFor="amount" className="text-blue-100 font-medium flex items-center space-x-2">
								<DollarSign className="w-4 h-4" />
								<span>Investment Amount</span>
							</Label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<span className="text-gray-400">$</span>
								</div>
								<Input
									id="amount"
									type="number"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									className="pl-8 bg-blue-900/30 border-blue-700/50 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-12 rounded-xl"
									placeholder="10,000"
								/>
							</div>
							<p className="text-xs text-blue-300/70">Minimum: $1,000 USD</p>
						</div>

						{/* Risk Tolerance Cards */}
						<div className="space-y-3">
							<Label className="text-blue-100 font-medium flex items-center space-x-2">
								<Shield className="w-4 h-4" />
								<span>Risk Tolerance</span>
							</Label>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{RISK_OPTIONS.map((option) => {
									const Icon = option.icon;
									const isSelected = riskTolerance === option.value;
									return (
										<button
											key={option.value}
											onClick={() => setRiskTolerance(option.value as "low" | "medium" | "high")}
											className={cn(
												"relative overflow-hidden rounded-xl p-5 border-2 transition-all duration-300 text-left",
												"bg-gradient-to-br",
												option.bgGradient,
												isSelected ? option.selectedBorder : option.borderColor,
												!isSelected && option.hoverBorder,
												isSelected ? "ring-2 ring-offset-2 ring-offset-blue-950" : "",
												isSelected && option.value === "low" ? "ring-green-500/50" : "",
												isSelected && option.value === "medium" ? "ring-yellow-500/50" : "",
												isSelected && option.value === "high" ? "ring-red-500/50" : "",
												"hover:scale-[1.02] active:scale-[0.98]"
											)}
										>
											{/* Animated Background Gradient */}
											<div className={cn(
												"absolute inset-0 opacity-0 transition-opacity duration-300",
												isSelected && "opacity-100",
												"bg-gradient-to-br",
												option.color,
												"blur-2xl"
											)} />
											
											<div className="relative">
												{/* Icon and Badge */}
												<div className="flex items-center justify-between mb-3">
													<div className={cn(
														"p-2.5 rounded-lg bg-gradient-to-br",
														option.color,
														"shadow-lg"
													)}>
														<Icon className="w-5 h-5 text-white" />
													</div>
													{isSelected && (
														<div className="flex items-center space-x-1">
															<div className={cn("w-2 h-2 rounded-full", option.textColor.replace("text-", "bg-"), "animate-pulse")} />
															<span className="text-xs text-white font-medium">Selected</span>
														</div>
													)}
												</div>

												{/* Title and Description */}
												<div className="mb-3">
													<h3 className="text-white font-semibold text-lg mb-1">{option.label}</h3>
													<p className="text-sm text-gray-400">{option.description}</p>
												</div>

												{/* Expected APY Range */}
												<div className="flex items-center justify-between pt-3 border-t border-white/10">
													<span className="text-xs text-gray-400">Expected APY</span>
													<span className={cn("text-sm font-bold", option.textColor)}>
														{option.percentage}
													</span>
												</div>
											</div>
										</button>
									);
								})}
							</div>
							<p className="text-xs text-blue-300/70">Select your preferred risk level for yield opportunities</p>
						</div>

						{/* Action Button */}
						<div>
							<Button
								onClick={handleRefresh}
								disabled={isLoading}
								className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all duration-300 rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<>
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
										Analyzing...
									</>
								) : (
									<>
										<Sparkles className="w-5 h-5 mr-2" />
										Generate Recommendations
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/50 via-blue-900/30 to-blue-950/50 border border-blue-800/30 p-16 text-center">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_70%)] animate-pulse" />
					<div className="relative">
						<div className="inline-flex p-6 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 mb-6">
							<Brain className="w-16 h-16 text-blue-400 animate-pulse" />
						</div>
						<h3 className="text-2xl font-bold text-white mb-3">
							AI is Analyzing Your Portfolio
						</h3>
						<p className="text-blue-200/80 max-w-md mx-auto">
							Fetching real-time data from DeFiLlama and generating personalized yield recommendations
						</p>
						<div className="flex items-center justify-center space-x-2 mt-6">
							<div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
							<div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
							<div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
						</div>
					</div>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950/30 via-red-900/20 to-red-950/30 border border-red-800/30 p-8">
					<div className="flex items-start space-x-4">
						<div className="p-3 rounded-xl bg-red-500/20">
							<AlertTriangle className="w-6 h-6 text-red-400" />
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-red-400 mb-2">
								Failed to Generate Recommendations
							</h3>
							<p className="text-gray-300 text-sm mb-2">
								{error.message || "An unexpected error occurred. Please try again."}
							</p>
							<p className="text-blue-300/70 text-xs">
								💡 Make sure the Python Agent API is running on port 8000
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Success State */}
			{recommendation && !isLoading && (
				<div className="space-y-6">
					{/* Header Stats */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-blue-700/30 p-5">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-blue-200">Weighted APY</span>
								<div className="p-2 rounded-lg bg-green-500/20">
									<TrendingUp className="w-4 h-4 text-green-400" />
								</div>
							</div>
							<div className="text-3xl font-bold text-white mb-1">
								{recommendation.weighted_expected_apy.toFixed(2)}%
							</div>
							<p className="text-xs text-blue-300/60">Expected annual return</p>
						</div>
						<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-blue-700/30 p-5">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-blue-200">Risk Grade</span>
								<div className="p-2 rounded-lg bg-yellow-500/20">
									<Shield className="w-4 h-4 text-yellow-400" />
								</div>
							</div>
							<div className="text-3xl font-bold text-white mb-1">
								{recommendation.overall_risk_grade}
							</div>
							<p className="text-xs text-blue-300/60">Portfolio risk level</p>
						</div>
						<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-blue-700/30 p-5">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-blue-200">Diversification</span>
								<div className="p-2 rounded-lg bg-blue-500/20">
									<PieChart className="w-4 h-4 text-blue-400" />
								</div>
							</div>
							<div className="text-3xl font-bold text-white mb-1">
								{recommendation.diversification_score.toFixed(0)}/100
							</div>
							<p className="text-xs text-blue-300/60">Asset distribution</p>
						</div>
						<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-blue-700/30 p-5">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-blue-200">Confidence</span>
								<div className="p-2 rounded-lg bg-purple-500/20">
									<Target className="w-4 h-4 text-purple-400" />
								</div>
							</div>
							<div className="text-3xl font-bold text-white mb-1">
								{recommendation.confidence_score.toFixed(0)}%
							</div>
							<p className="text-xs text-blue-300/60">AI recommendation score</p>
						</div>
					</div>

					{/* AI Summary */}
					<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-700/30 p-6">
						<div className="flex items-start space-x-3 mb-4">
							<Sparkles className="w-5 h-5 text-yellow-400 mt-0.5" />
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-white mb-2">AI Summary</h3>
								<p className="text-gray-300">{recommendation.summary}</p>
							</div>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<div className="flex items-center space-x-1 text-xs text-gray-400">
											<Clock className="w-3 h-3" />
											<span>{timeSinceUpdate}</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Auto-refreshes every 15 minutes</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<div className="bg-white/5 rounded-lg p-4 border border-white/10">
							<p className="text-sm text-gray-300 leading-relaxed">{recommendation.rationale}</p>
						</div>
					</div>

					{/* Portfolio Allocations */}
					<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-700/30 p-6">
						<h3 className="text-xl font-bold text-white mb-6 flex items-center">
							<div className="p-2 rounded-lg bg-blue-500/20 mr-3">
								<PieChart className="w-5 h-5 text-blue-400" />
							</div>
							Recommended Allocations
						</h3>
						<div className="space-y-4">
							{recommendation.allocations.map((allocation, idx) => {
								const riskColorScheme = RISK_COLOR_SCHEME[allocation.risk_tier];
								return (
									<div
										key={idx}
										className="relative overflow-hidden bg-gradient-to-br from-blue-900/20 to-blue-950/20 rounded-xl p-5 border border-blue-700/20 hover:border-blue-600/40 hover:from-blue-900/30 hover:to-blue-950/30 transition-all duration-300"
									>
										<div className="flex items-start justify-between mb-3">
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-1">
													<h4 className="text-white font-semibold">
														{allocation.opportunity.project}
													</h4>
													<span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
														{allocation.opportunity.chain}
													</span>
													<span
														className={cn(
															"text-xs px-2 py-0.5 rounded-full",
															riskColorScheme.marker.replace("bg-", "bg-"),
															"text-white",
														)}
													>
														Tier {allocation.risk_tier}
													</span>
												</div>
												<p className="text-sm text-gray-400">{allocation.opportunity.symbol}</p>
											</div>
											<div className="text-right">
												<div className="text-xl font-bold text-white">
													{allocation.allocation_percentage.toFixed(1)}%
												</div>
												<div className="text-sm text-gray-400">
													${allocation.allocation_usd.toLocaleString()}
												</div>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4 mb-3">
											<div>
												<span className="text-xs text-gray-400">Expected APY</span>
												<div className="text-green-400 font-semibold">
													{allocation.expected_apy.toFixed(2)}%
												</div>
											</div>
											<div>
												<span className="text-xs text-gray-400">TVL</span>
												<div className="text-white font-semibold">
													{allocation.opportunity.tvl_usd != null && !isNaN(allocation.opportunity.tvl_usd)
														? `$${(allocation.opportunity.tvl_usd / 1e6).toFixed(2)}M`
														: 'N/A'}
												</div>
											</div>
										</div>
										<div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/20">
											<p className="text-xs text-blue-100/80 leading-relaxed">
												{allocation.reasoning}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Projected Returns */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-700/30 p-6">
							<h3 className="text-lg font-bold text-white mb-5 flex items-center">
								<div className="p-2 rounded-lg bg-green-500/20 mr-3">
									<TrendingUp className="w-5 h-5 text-green-400" />
								</div>
								Projected Returns
							</h3>
							<div className="space-y-3">
								{Object.entries(recommendation.projected_returns).map(([period, amount]) => (
									<div key={period} className="flex items-center justify-between">
										<span className="text-gray-400">{period}</span>
										<span className="text-white font-semibold">
											${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
										</span>
									</div>
								))}
							</div>
						</div>

						<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-700/30 p-6">
							<h3 className="text-lg font-bold text-white mb-5 flex items-center">
								<div className="p-2 rounded-lg bg-blue-500/20 mr-3">
									<DollarSign className="w-5 h-5 text-blue-400" />
								</div>
								Estimated Fees
							</h3>
							<div className="space-y-3">
								{Object.entries(recommendation.estimated_fees).map(([type, amount]) => (
									<div key={type} className="flex items-center justify-between">
										<span className="text-gray-400 capitalize">{type}</span>
										<span className="text-white font-semibold">
											${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Risks and Opportunities */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/20 to-blue-950/30 border border-red-800/20 p-6">
							<h3 className="text-lg font-bold text-white mb-5 flex items-center">
								<div className="p-2 rounded-lg bg-red-500/20 mr-3">
									<AlertTriangle className="w-5 h-5 text-red-400" />
								</div>
								Key Risks
							</h3>
							<ul className="space-y-2">
								{recommendation.key_risks.map((risk, idx) => (
									<li key={idx} className="flex items-start space-x-2">
										<span className="text-red-400 mt-1">•</span>
										<span className="text-gray-300 text-sm">{risk}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-950/20 to-blue-950/30 border border-yellow-800/20 p-6">
							<h3 className="text-lg font-bold text-white mb-5 flex items-center">
								<div className="p-2 rounded-lg bg-yellow-500/20 mr-3">
									<Sparkles className="w-5 h-5 text-yellow-400" />
								</div>
								Opportunities
							</h3>
							<ul className="space-y-2">
								{recommendation.opportunities.map((opportunity, idx) => (
									<li key={idx} className="flex items-start space-x-2">
										<span className="text-yellow-400 mt-1">•</span>
										<span className="text-gray-300 text-sm">{opportunity}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
