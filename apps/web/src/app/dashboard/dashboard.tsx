"use client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  DollarSign,
  Percent,
  Users,
  Info
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

export default function Dashboard() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const stats = {
		totalTVL: "$247.5M",
		tvlChange: "+12.5%",
		avgAPY: "10.8%",
		apyChange: "+0.3%",
		activeProtocols: 23,
		protocolChange: "+2",
		totalUsers: "14.2K",
		userChange: "+8.1%",
	};

	const riskDistribution = [
		{ tier: "A", percentage: 42, color: "bg-green-500" },
		{ tier: "B", percentage: 35, color: "bg-yellow-500" },
		{ tier: "C", percentage: 18, color: "bg-orange-500" },
		{ tier: "D", percentage: 5, color: "bg-red-500" },
	];

	if (!mounted) {
		return <div className="min-h-screen" />;
	}

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-4 py-6">
				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<Card className="glass-card border-white/10 p-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-400">Total TVL</span>
							<DollarSign className="w-4 h-4 text-blue-400" />
						</div>
						<div className="text-2xl font-bold text-white mb-1">{stats.totalTVL}</div>
						<div className="flex items-center text-sm">
							<span className={`flex items-center ${stats.tvlChange.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
								{stats.tvlChange.startsWith('+') ? (
									<TrendingUp className="w-3 h-3 mr-1" />
								) : (
									<TrendingDown className="w-3 h-3 mr-1" />
								)}
								{stats.tvlChange}
							</span>
							<span className="text-gray-500 ml-2">vs last 24h</span>
						</div>
					</Card>

					<Card className="glass-card border-white/10 p-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-400">Average APY</span>
							<Percent className="w-4 h-4 text-green-400" />
						</div>
						<div className="text-2xl font-bold text-white mb-1">{stats.avgAPY}</div>
						<div className="flex items-center text-sm">
							<span className={`flex items-center ${stats.apyChange.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
								{stats.apyChange.startsWith('+') ? (
									<TrendingUp className="w-3 h-3 mr-1" />
								) : (
									<TrendingDown className="w-3 h-3 mr-1" />
								)}
								{stats.apyChange}
							</span>
							<span className="text-gray-500 ml-2">vs last 24h</span>
						</div>
					</Card>

					<Card className="glass-card border-white/10 p-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-400">Active Protocols</span>
							<Activity className="w-4 h-4 text-purple-400" />
						</div>
						<div className="text-2xl font-bold text-white mb-1">{stats.activeProtocols}</div>
						<div className="flex items-center text-sm">
							<span className="text-green-400">
								{stats.protocolChange} new
							</span>
							<span className="text-gray-500 ml-2">this week</span>
						</div>
					</Card>

					<Card className="glass-card border-white/10 p-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-400">Total Users</span>
							<Users className="w-4 h-4 text-cyan-400" />
						</div>
						<div className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</div>
						<div className="flex items-center text-sm">
							<span className={`flex items-center ${stats.userChange.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
								{stats.userChange.startsWith('+') ? (
									<TrendingUp className="w-3 h-3 mr-1" />
								) : (
									<TrendingDown className="w-3 h-3 mr-1" />
								)}
								{stats.userChange}
							</span>
							<span className="text-gray-500 ml-2">growth</span>
						</div>
					</Card>
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
						{riskDistribution.map((risk, index) => (
							<div
								key={risk.tier}
								className={`${risk.color} opacity-80 hover:opacity-100 transition-opacity`}
								style={{ width: `${risk.percentage}%` }}
							/>
						))}
					</div>
					<div className="grid grid-cols-4 gap-4">
						{riskDistribution.map((risk) => (
							<div key={risk.tier} className="text-center">
								<div className="text-xs text-gray-400 mb-1">Tier {risk.tier}</div>
								<div className="text-sm font-medium text-white">{risk.percentage}%</div>
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
