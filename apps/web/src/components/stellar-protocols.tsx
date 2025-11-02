"use client";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	ChevronDown,
	DollarSign,
	Loader2,
	Plus,
	Shield,
	TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	type DefiLlamaPool,
	fetchDefiLlamaPools,
} from "@/lib/data-sources";
import { classifyRiskTier } from "@/lib/metrics";

interface Protocol {
	rank: number;
	name: string;
	type: string;
	apy: number;
	netAPY: number;
	expectedAPY: number;
	tvl: string;
	assets: string[];
	riskTier: "A" | "B" | "C" | "D";
	gradient?: string;
	textColor?: string;
	anchor?: string;
	audited: boolean;
}

type Network = "Stellar" | "Solana" | "Ethereum";

const getRiskBadgeColor = (tier: string) => {
	switch (tier) {
		case "A":
			return "bg-green-500/20 text-green-400 border-green-500/30";
		case "B":
			return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
		case "C":
			return "bg-orange-500/20 text-orange-400 border-orange-500/30";
		case "D":
			return "bg-red-500/20 text-red-400 border-red-500/30";
		default:
			return "bg-gray-500/20 text-gray-400 border-gray-500/30";
	}
};

function formatTVL(value: number): string {
	if (value >= 1_000_000_000) {
		return `$${(value / 1_000_000_000).toFixed(1)}B`;
	}
	if (value >= 1_000_000) {
		return `$${(value / 1_000_000).toFixed(1)}M`;
	}
	if (value >= 1_000) {
		return `$${(value / 1_000).toFixed(1)}K`;
	}
	return `$${value.toFixed(0)}`;
}

const GRADIENTS = [
	"from-blue-500/10 to-blue-600/10",
	"from-purple-500/10 to-purple-600/10",
	"from-green-500/10 to-green-600/10",
	"from-yellow-500/10 to-yellow-600/10",
	"from-pink-500/10 to-pink-600/10",
	"from-indigo-500/10 to-indigo-600/10",
	"from-orange-500/10 to-orange-600/10",
	"from-teal-500/10 to-teal-600/10",
];

const SPECIAL_TEXT_STYLES = [
	undefined,
	undefined,
	undefined,
	"text-gray-300",
	undefined,
	undefined,
	"text-gray-400",
	undefined,
];

function normaliseAssets(symbol?: string) {
	if (!symbol) return [];
	return symbol
		.replace(/\s+/g, "")
		.split(/[-/]/)
		.map((asset) => asset.trim().toUpperCase())
		.filter(Boolean);
}

function deriveType(pool: DefiLlamaPool) {
	const project = pool.project?.toLowerCase() ?? "";
	const meta = pool.poolMeta?.toLowerCase() ?? "";

	if (project.includes("stake") || project.includes("staking")) {
		return "Liquid Staking";
	}

	if (project.includes("lend") || project.includes("borrow") || meta.includes("yieldblox")) {
		return "Lending";
	}

	if (project.includes("amm") || meta.includes("pool")) {
		return "AMM";
	}

	if (project.includes("dex")) {
		return "DEX";
	}

	if (project.includes("reward") || project.includes("farm")) {
		return "Rewards";
	}

	if (project.includes("vault")) {
		return "Vault";
	}

	if (project.includes("bridge")) {
		return "Bridge";
	}

	return "Yield";
}

function mapPoolToProtocol(pool: DefiLlamaPool, index: number): Protocol {
	const netApy = pool.apy ?? 0;
	const expectedApy =
		pool.apyMean30d !== null && pool.apyMean30d !== undefined
			? pool.apyMean30d
			: netApy;
	const gradient = GRADIENTS[index % GRADIENTS.length];
	const textColor = SPECIAL_TEXT_STYLES[index % SPECIAL_TEXT_STYLES.length];

	return {
		rank: index + 1,
		name: pool.project ?? pool.symbol ?? "Unknown Protocol",
		type: deriveType(pool),
		apy: Number(netApy.toFixed(2)),
		netAPY: Number(netApy.toFixed(2)),
		expectedAPY: Number(expectedApy.toFixed(2)),
		tvl: formatTVL(pool.tvlUsd ?? 0),
		assets: normaliseAssets(pool.symbol),
		riskTier: classifyRiskTier(pool),
		gradient,
		textColor,
		anchor: pool.project,
		audited: (pool.predictions?.predictedProbability ?? 0) >= 70,
	};
}

export default function StellarProtocols() {
	const [networkFilter, setNetworkFilter] = useState<Network>("Ethereum");
	const [assetFilter, setAssetFilter] = useState("All Assets");
	const [typeFilter, setTypeFilter] = useState("All Types");

	const {
		data: stellarPools,
		isLoading: isLoadingStellar,
		error: stellarError,
	} = useQuery({
		queryKey: ["defillama-pools", "Stellar"],
		queryFn: () => fetchDefiLlamaPools("Stellar"),
		staleTime: 60_000,
		refetchInterval: 60_000,
	});

	const {
		data: solanaPools,
		isLoading: isLoadingSolana,
		error: solanaError,
	} = useQuery({
		queryKey: ["defillama-pools", "Solana"],
		queryFn: () => fetchDefiLlamaPools("Solana"),
		staleTime: 60_000,
		refetchInterval: 60_000,
	});

	const {
		data: ethereumPools,
		isLoading: isLoadingEthereum,
		error: ethereumError,
	} = useQuery({
		queryKey: ["defillama-pools", "Ethereum"],
		queryFn: () => fetchDefiLlamaPools("Ethereum"),
		staleTime: 60_000,
		refetchInterval: 60_000,
	});

	useEffect(() => {
		setAssetFilter("All Assets");
		setTypeFilter("All Types");
	}, [networkFilter]);

	const mappedStellarProtocols = useMemo(() => {
		return (stellarPools ?? [])
			.sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))
			.slice(0, 12)
			.map(mapPoolToProtocol);
	}, [stellarPools]);

	const mappedSolanaProtocols = useMemo(() => {
		return (solanaPools ?? [])
			.sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))
			.slice(0, 12)
			.map(mapPoolToProtocol);
	}, [solanaPools]);
	const mappedEthereumProtocols = useMemo(() => {
		return (ethereumPools ?? [])
			.sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))
			.slice(0, 12)
			.map(mapPoolToProtocol);
	}, [ethereumPools]);


	const displayedProtocols =
		networkFilter === "Stellar"
			? mappedStellarProtocols
			: networkFilter === "Solana"
				? mappedSolanaProtocols
				: mappedEthereumProtocols;

	const assetOptions = useMemo(() => {
		const baseAssets = new Set<string>();
		displayedProtocols.forEach((protocol) =>
			protocol.assets.forEach((asset) => baseAssets.add(asset)),
		);
		return Array.from(baseAssets).sort();
	}, [displayedProtocols]);

	const typeOptions = useMemo(() => {
		const set = new Set<string>();
		displayedProtocols.forEach((protocol) => set.add(protocol.type));
		return Array.from(set).sort();
	}, [displayedProtocols]);

	const filteredProtocols = displayedProtocols.filter((protocol) => {
		const assetMatch =
			assetFilter === "All Assets" ||
			protocol.assets.includes(assetFilter);
		const typeMatch =
			typeFilter === "All Types" || protocol.type === typeFilter;
		return assetMatch && typeMatch;
	});

	const stats = useMemo(() => {
		const totalProtocols = filteredProtocols.length;
		const avgNetAPY =
			filteredProtocols.length > 0
				? filteredProtocols.reduce((sum, p) => sum + p.netAPY, 0) /
					filteredProtocols.length
				: 0;

		const totalTVL = filteredProtocols.reduce((sum, p) => {
			const value = parseFloat(p.tvl.replace(/[^0-9.]/g, ""));
			const multiplier = p.tvl.includes("B")
				? 1_000_000_000
				: p.tvl.includes("M")
					? 1_000_000
					: p.tvl.includes("K")
						? 1_000
						: 1;
			return sum + value * multiplier;
		}, 0);

		return {
			totalProtocols,
			avgNetAPY,
			totalTVL: formatTVL(totalTVL),
		};
	}, [filteredProtocols]);

	const isLoadingCurrent =
		networkFilter === "Stellar"
			? isLoadingStellar
			: networkFilter === "Solana"
				? isLoadingSolana
				: isLoadingEthereum;
	const currentError =
		networkFilter === "Stellar"
			? stellarError
			: networkFilter === "Solana"
				? solanaError
				: ethereumError;

	return (
		<div className="glass-card rounded-2xl p-6 border border-white/10">
			{/* Filters */}
			<div className="flex items-center space-x-3 mb-6 flex-wrap gap-3">
				{/* Network Filter */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="glass-panel border border-white/10 text-white hover:bg-white/10"
						>
							<div className="flex items-center space-x-2">
								<span className="text-sm">{networkFilter}</span>
								<ChevronDown className="w-3 h-3" />
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="glass-card border-white/10">
						<DropdownMenuItem onClick={() => setNetworkFilter("Stellar")}>
							Stellar
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setNetworkFilter("Solana")}>
							Solana
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setNetworkFilter("Ethereum")}>
							Ethereum
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="glass-panel border border-white/10 text-white hover:bg-white/10"
						>
							<div className="flex items-center space-x-2">
								<span className="text-sm">{assetFilter}</span>
								<ChevronDown className="w-3 h-3" />
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="glass-card border-white/10">
						<DropdownMenuItem onClick={() => setAssetFilter("All Assets")}>
							All Assets
						</DropdownMenuItem>
						{assetOptions.map((asset) => (
							<DropdownMenuItem key={asset} onClick={() => setAssetFilter(asset)}>
								{asset}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="glass-panel border border-white/10 text-white hover:bg-white/10"
						>
							<div className="flex items-center space-x-2">
								<span className="text-sm">{typeFilter}</span>
								<ChevronDown className="w-3 h-3" />
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="glass-card border-white/10">
						<DropdownMenuItem onClick={() => setTypeFilter("All Types")}>
							All Types
						</DropdownMenuItem>
						{typeOptions.map((option) => (
							<DropdownMenuItem key={option} onClick={() => setTypeFilter(option)}>
								{option}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Header */}
			<div className="flex items-center space-x-2 mb-4">
				<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
				<h2 className="text-lg font-semibold text-white">
					{networkFilter} Protocols
				</h2>
				<span className="text-xs text-gray-400">Live</span>
				{isLoadingCurrent && (
					<Loader2 className="w-3 h-3 animate-spin text-gray-400" />
				)}
			</div>

			{/* Protocol List */}
			<div className="space-y-3">
				{currentError && (
					<div className="glass-panel rounded-xl p-4 border border-red-500/30">
						<p className="text-sm text-red-400">
							Failed to load {networkFilter} protocols. Please try again shortly.
						</p>
					</div>
				)}
				{filteredProtocols.length === 0 && !isLoadingCurrent && !currentError && (
					<div className="glass-panel rounded-xl p-4 border border-white/5">
						<p className="text-sm text-gray-400 text-center">
							No protocols found matching your filters.
						</p>
					</div>
				)}
				{filteredProtocols.map((protocol, index) => (
          <div
            key={`${networkFilter}-${protocol.rank}-${index}`}
            className={`glass-panel rounded-xl p-4 hover:scale-[1.01] transition-all duration-200 bg-gradient-to-r ${protocol.gradient} border border-white/5 hover:border-white/10`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Left Section - Rank and Protocol Info */}
              <div className="flex items-start lg:items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-400">
                    {protocol.rank}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {protocol.name}
                    </span>
                    {protocol.audited && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="flex-shrink-0">
                              <Shield className="w-3 h-3 text-green-400" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Audited Protocol</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <div className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getRiskBadgeColor(protocol.riskTier)}`}>
                      {protocol.riskTier}
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span className="text-xs text-gray-500">{protocol.type}</span>
                    <div className="flex flex-wrap gap-1">
                      {protocol.assets.slice(0, 3).map((asset, index) => (
                        <span key={index} className="text-xs bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                          {asset}
                        </span>
                      ))}
                      {protocol.assets.length > 3 && (
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                          +{protocol.assets.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  {protocol.anchor && (
                    <span className="text-xs text-gray-500 mt-1">{protocol.anchor}</span>
                  )}
                </div>
              </div>

              {/* Right Section - APY and TVL */}
              <div className="flex items-center space-x-4 lg:space-x-6 ml-11 lg:ml-0">
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">TVL</div>
                  <div className="text-sm font-medium text-white">{protocol.tvl}</div>
                </div>
                <div className={`text-right ${protocol.textColor ?? ""}`}>
                  <div className="flex items-center justify-end space-x-1 mb-1">
                    <span className="text-xs text-gray-500">Net</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm font-medium text-white cursor-help">
                            {protocol.netAPY.toFixed(2)}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Net APY: {protocol.netAPY.toFixed(6)}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className={`flex items-center justify-end space-x-1 ${protocol.textColor ?? ""}`}>
                    <span className="text-xs text-gray-500">Exp</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm font-medium text-green-400 cursor-help">
                            {protocol.expectedAPY.toFixed(2)}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Expected APY: {protocol.expectedAPY.toFixed(6)}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  </div>
                  {protocol.expectedAPY > protocol.netAPY && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-xs text-green-400 mt-1 cursor-help">
                            +{(protocol.expectedAPY - protocol.netAPY).toFixed(2)}% potential
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Potential: +{(protocol.expectedAPY - protocol.netAPY).toFixed(6)}%
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <Button
        className="w-full mt-4 glass-panel border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
        variant="ghost"
        onClick={() => {
          setAssetFilter("All Assets");
          setTypeFilter("All Types");
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Reset Filters
      </Button>

      {/* Stats Summary */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-500">Total Protocols</div>
          <div className="text-sm font-medium text-white">{stats.totalProtocols}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Avg Net APY</div>
          <div className="text-sm font-medium text-white">
            {stats.avgNetAPY > 0 ? `${stats.avgNetAPY.toFixed(1)}%` : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Total TVL</div>
          <div className="text-sm font-medium text-white">{stats.totalTVL}</div>
        </div>
      </div>
    </div>
  );
}
