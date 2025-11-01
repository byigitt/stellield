"use client";
import { useState, useMemo } from "react";
import { ChevronDown, Plus, Shield, TrendingUp, DollarSign, Loader2 } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";

interface Protocol {
  rank: number;
  name: string;
  type: string;
  apy: number;
  netAPY: number;
  expectedAPY: number;
  tvl: string;
  assets: string[];
  riskTier: 'A' | 'B' | 'C' | 'D';
  gradient?: string;
  textColor?: string;
  anchor?: string;
  audited: boolean;
}

const protocols: Protocol[] = [
  {
    rank: 1,
    name: "Soroban AMM Pool",
    type: "AMM",
    apy: 20.82,
    netAPY: 19.5,
    expectedAPY: 22.1,
    tvl: "$15.2M",
    assets: ["USDC", "XLM", "EURC", "yUSDC"],
    riskTier: 'A',
    gradient: "from-blue-500/10 to-blue-600/10",
    anchor: "soroban.stellar.org",
    audited: true,
  },
  {
    rank: 2,
    name: "Stellar DEX LP",
    type: "DEX",
    apy: 13.32,
    netAPY: 12.8,
    expectedAPY: 14.5,
    tvl: "$8.5M",
    assets: ["XLM", "USDC"],
    riskTier: 'B',
    gradient: "from-purple-500/10 to-purple-600/10",
    anchor: "stellarx.com",
    audited: true,
  },
  {
    rank: 3,
    name: "Aquarius Rewards",
    type: "Rewards",
    apy: 20.05,
    netAPY: 18.2,
    expectedAPY: 21.8,
    tvl: "$12.1M",
    assets: ["AQUA", "yUSDC"],
    riskTier: 'A',
    gradient: "from-green-500/10 to-green-600/10",
    anchor: "aqua.network",
    audited: true,
  },
  {
    rank: 4,
    name: "Ultra Stellar Vault",
    type: "Vault",
    apy: 4.17,
    netAPY: 4.0,
    expectedAPY: 4.5,
    tvl: "$5.3M",
    assets: ["USDC", "EURC"],
    riskTier: 'A',
    gradient: "from-gray-500/10 to-gray-600/10",
    textColor: "text-gray-300",
    anchor: "ultrastellar.com",
    audited: true,
  },
  {
    rank: 5,
    name: "StellarX Savings",
    type: "Savings",
    apy: 9.74,
    netAPY: 9.2,
    expectedAPY: 10.5,
    tvl: "$3.8M",
    assets: ["USDC", "XLM"],
    riskTier: 'B',
    gradient: "from-yellow-500/10 to-yellow-600/10",
    anchor: "stellarx.com",
    audited: true,
  },
  {
    rank: 6,
    name: "Pendulum Bridge Yield",
    type: "Bridge",
    apy: 1.26,
    netAPY: 1.2,
    expectedAPY: 1.5,
    tvl: "$2.1M",
    assets: ["PEN", "USDC"],
    riskTier: 'C',
    gradient: "from-amber-500/10 to-amber-600/10",
    textColor: "text-gray-400",
    anchor: "pendulumchain.org",
    audited: false,
  },
];

type Network = 'Stellar' | 'Solana';

interface MarinadeApiResponse {
  apy?: number;
  apr?: number;
  msolPrice?: number;
  solPrice?: number;
  tvl?: number;
  totalSolStaked?: number;
  epochInfo?: {
    slotIndex?: number;
    slotsInEpoch?: number;
  };
  liqPool?: {
    solLeg?: string;
    msolLeg?: string;
    msolSupply?: string;
  };
}

const getRiskBadgeColor = (tier: string) => {
  switch(tier) {
    case 'A': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'B': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'C': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'D': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

async function fetchMarinadeData(): Promise<MarinadeApiResponse> {
  try {
    const baseUrl = 'https://api.marinade.finance';
    
    const [apyResponse, priceResponse, tlvResponse] = await Promise.allSettled([
      fetch(`${baseUrl}/msol/apy/7d`, {
        headers: { 'accept': 'application/json' }
      }),
      fetch(`${baseUrl}/msol/price_sol`, {
        headers: { 'accept': 'text/plain' }
      }),
      fetch(`${baseUrl}/tlv`, {
        headers: { 'accept': 'application/json' }
      })
    ]);

    let apy = 6.5;
    let apr = 6.5;
    let msolPrice: number | undefined = undefined;
    let tvl = 3_500_000_000;

    if (apyResponse.status === 'fulfilled' && apyResponse.value.ok) {
      try {
        const apyData = await apyResponse.value.json();
        if (Array.isArray(apyData) && apyData.length > 0) {
          const latestEntry = apyData[apyData.length - 1];
          const apyValue = latestEntry.apy;
          apy = typeof apyValue === 'number' 
            ? apyValue * 100 
            : parseFloat(String(apyValue || '0')) * 100;
          apr = apy;
        }
      } catch (e) {
        console.warn('Failed to parse APY response:', e);
      }
    }

    if (priceResponse.status === 'fulfilled' && priceResponse.value.ok) {
      try {
        const priceText = await priceResponse.value.text();
        const parsedPrice = parseFloat(priceText);
        if (!isNaN(parsedPrice) && parsedPrice > 0) {
          msolPrice = parsedPrice;
        }
      } catch (e) {
        console.warn('Failed to parse price response:', e);
      }
    }

    if (tlvResponse.status === 'fulfilled' && tlvResponse.value.ok) {
      try {
        const tlvData = await tlvResponse.value.json();
        if (tlvData.total_usd) {
          tvl = typeof tlvData.total_usd === 'number' 
            ? tlvData.total_usd 
            : parseFloat(String(tlvData.total_usd));
        }
      } catch (e) {
        console.warn('Failed to parse TVL response:', e);
      }
    }

    return {
      apy: apy,
      apr: apr,
      msolPrice: msolPrice,
      solPrice: 1,
      tvl: tvl,
      totalSolStaked: tvl,
    };
  } catch (error) {
    console.error('Error fetching Marinade data:', error);
    return {
      apy: 6.5,
      apr: 6.5,
      msolPrice: undefined,
      solPrice: 1,
      tvl: 3_500_000_000,
      totalSolStaked: 3_500_000_000,
    };
  }
}

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

export default function StellarProtocols() {
  const [networkFilter, setNetworkFilter] = useState<Network>("Stellar");
  const [assetFilter, setAssetFilter] = useState("All Assets");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const { data: marinadeData, isLoading: isLoadingMarinade, error: marinadeError } = useQuery({
    queryKey: ['marinade-data'],
    queryFn: fetchMarinadeData,
    enabled: networkFilter === 'Solana',
    refetchInterval: 60000,
    retry: 2,
  });

  const solanaProtocols: Protocol[] = useMemo(() => {
    if (!marinadeData) return [];

    const apy = marinadeData.apy;
    const tvl = marinadeData.tvl;

    return [
      {
        rank: 1,
        name: "Marinade Finance mSOL",
        type: "Liquid Staking",
        apy: Number(apy?.toFixed(2) || 0),
        netAPY: Number((apy ? apy * 0.98 : 0).toFixed(2)),
        expectedAPY: Number((apy ? apy * 1.02 : 0).toFixed(2)),
        tvl: formatTVL(tvl || 0),
        assets: ["mSOL", "SOL"],
        riskTier: 'A',
        gradient: "from-purple-500/10 to-indigo-600/10",
        anchor: "marinade.finance",
        audited: true,
      }
    ];
  }, [marinadeData]);

  const displayedProtocols = networkFilter === 'Stellar' ? protocols : solanaProtocols;

  const filteredProtocols = displayedProtocols.filter((protocol) => {
    const assetMatch = assetFilter === "All Assets" || protocol.assets.includes(assetFilter);
    const typeMatch = typeFilter === "All Types" || protocol.type === typeFilter;
    return assetMatch && typeMatch;
  });

  const stats = useMemo(() => {
    const totalProtocols = filteredProtocols.length;
    const avgNetAPY = filteredProtocols.length > 0
      ? filteredProtocols.reduce((sum, p) => sum + p.netAPY, 0) / filteredProtocols.length
      : 0;
    
    const totalTVL = filteredProtocols.reduce((sum, p) => {
      const value = parseFloat(p.tvl.replace(/[^0-9.]/g, ''));
      const multiplier = p.tvl.includes('B') ? 1_000_000_000 : p.tvl.includes('M') ? 1_000_000 : p.tvl.includes('K') ? 1_000 : 1;
      return sum + (value * multiplier);
    }, 0);

    return {
      totalProtocols,
      avgNetAPY,
      totalTVL: formatTVL(totalTVL)
    };
  }, [filteredProtocols]);

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
            {networkFilter === 'Stellar' ? (
              <>
                <DropdownMenuItem onClick={() => setAssetFilter("USDC")}>
                  USDC
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssetFilter("XLM")}>
                  XLM
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssetFilter("EURC")}>
                  EURC
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => setAssetFilter("SOL")}>
                  SOL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssetFilter("mSOL")}>
                  mSOL
                </DropdownMenuItem>
              </>
            )}
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
            {networkFilter === 'Stellar' ? (
              <>
                <DropdownMenuItem onClick={() => setTypeFilter("AMM")}>
                  AMM
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("DEX")}>
                  DEX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("Vault")}>
                  Vault
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("Rewards")}>
                  Rewards
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => setTypeFilter("Liquid Staking")}>
                  Liquid Staking
                </DropdownMenuItem>
              </>
            )}
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
        {networkFilter === 'Solana' && isLoadingMarinade && (
          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
        )}
      </div>

      {/* Protocol List */}
      <div className="space-y-3">
        {networkFilter === 'Solana' && isLoadingMarinade && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-400">Loading Solana protocols...</span>
          </div>
        )}
        {networkFilter === 'Solana' && marinadeError && (
          <div className="glass-panel rounded-xl p-4 border border-red-500/30">
            <p className="text-sm text-red-400">
              Failed to load Solana protocols. Please try again later.
            </p>
          </div>
        )}
        {filteredProtocols.length === 0 && !isLoadingMarinade && (
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
                <div className="text-right">
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
                  <div className="flex items-center justify-end space-x-1">
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
      >
        <Plus className="w-4 h-4 mr-2" />
        Load More Protocols
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