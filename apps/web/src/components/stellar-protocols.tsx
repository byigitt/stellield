"use client";
import { useState } from "react";
import { ChevronDown, Plus, Shield, TrendingUp, DollarSign } from "lucide-react";
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

const getRiskBadgeColor = (tier: string) => {
  switch(tier) {
    case 'A': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'B': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'C': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'D': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function StellarProtocols() {
  const [assetFilter, setAssetFilter] = useState("All Assets");
  const [typeFilter, setTypeFilter] = useState("All Types");

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      {/* Filters */}
      <div className="flex items-center space-x-3 mb-6">
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
            <DropdownMenuItem onClick={() => setAssetFilter("USDC")}>
              USDC
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAssetFilter("XLM")}>
              XLM
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAssetFilter("EURC")}>
              EURC
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
                <span className="text-sm">{typeFilter}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card border-white/10">
            <DropdownMenuItem onClick={() => setTypeFilter("All Types")}>
              All Types
            </DropdownMenuItem>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <h2 className="text-lg font-semibold text-white">Stellar Protocols</h2>
        <span className="text-xs text-gray-400">Live</span>
      </div>

      {/* Protocol List */}
      <div className="space-y-3">
        {protocols.map((protocol) => (
          <div
            key={protocol.rank}
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
                    <span className="text-sm font-medium text-white">
                      {protocol.netAPY}%
                    </span>
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    <span className="text-xs text-gray-500">Exp</span>
                    <span className="text-sm font-medium text-green-400">
                      {protocol.expectedAPY}%
                    </span>
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  </div>
                  {protocol.expectedAPY > protocol.netAPY && (
                    <div className="text-xs text-green-400 mt-1">
                      +{(protocol.expectedAPY - protocol.netAPY).toFixed(1)}% potential
                    </div>
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
          <div className="text-sm font-medium text-white">23</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Avg Net APY</div>
          <div className="text-sm font-medium text-white">10.8%</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Total TVL</div>
          <div className="text-sm font-medium text-white">$52.2M</div>
        </div>
      </div>
    </div>
  );
}