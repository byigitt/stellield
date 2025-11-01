"use client";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Shield, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface YieldOpportunity {
  protocol: string;
  asset: string;
  netAPY: number;
  expectedAPY: number;
  tvl: string;
  riskTier: 'A' | 'B' | 'C' | 'D';
  change24h: number;
  liquidityDepth: string;
  gradient: string;
}

const opportunities: YieldOpportunity[] = [
  {
    protocol: "Soroban AMM",
    asset: "USDC",
    netAPY: 9.48,
    expectedAPY: 10.2,
    tvl: "$9,481,000",
    riskTier: 'A',
    change24h: 7.76,
    liquidityDepth: "$10M+",
    gradient: "from-blue-500/20 to-blue-600/20",
  },
  {
    protocol: "Stellar DEX LP",
    asset: "XLM-USDC",
    netAPY: 14.77,
    expectedAPY: 15.8,
    tvl: "$1,477,000",
    riskTier: 'B',
    change24h: -5.88,
    liquidityDepth: "$5M",
    gradient: "from-green-500/20 to-green-600/20",
  },
  {
    protocol: "Aquarius Rewards",
    asset: "yUSDC",
    netAPY: 10.0,
    expectedAPY: 12.82,
    tvl: "$10,000,000",
    riskTier: 'A',
    change24h: 2.82,
    liquidityDepth: "$20M+",
    gradient: "from-purple-500/20 to-purple-600/20",
  },
  {
    protocol: "StellarX Savings",
    asset: "EURC",
    netAPY: 3.0,
    expectedAPY: 4.5,
    tvl: "$3,000,000",
    riskTier: 'B',
    change24h: -1.5,
    liquidityDepth: "$8M",
    gradient: "from-cyan-500/20 to-cyan-600/20",
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

export default function StellarYieldOpportunities() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Stellar Yield Aggregator
          </h1>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Total Value Locked:</span>
              <span className="text-xl font-bold text-green-400">
                $24,358,000
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Opportunities Tracked:</span>
              <span className="text-white font-semibold">47</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Average APY:</span>
              <span className="text-white font-semibold">9.31%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {opportunities.map((opp, index) => (
          <div
            key={index}
            className={`glass-card rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300 bg-gradient-to-br ${opp.gradient} border border-white/10`}
          >
            {/* Header with Protocol and Risk Tier */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {opp.protocol}
                </h3>
                <div className="text-sm text-gray-400">{opp.asset}</div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`px-2 py-1 rounded-lg border text-xs font-medium ${getRiskBadgeColor(opp.riskTier)}`}>
                      Risk {opp.riskTier}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Risk Tier {opp.riskTier}</p>
                    <p className="text-xs text-gray-400">
                      {opp.riskTier === 'A' && 'Low risk, audited protocol'}
                      {opp.riskTier === 'B' && 'Medium risk, established protocol'}
                      {opp.riskTier === 'C' && 'Higher risk, newer protocol'}
                      {opp.riskTier === 'D' && 'High risk, experimental'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* APY Stats */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Net APY</span>
                  <span className="text-lg font-bold text-white">
                    {opp.netAPY}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Expected APY</span>
                  <span className="text-sm font-medium text-green-400">
                    {opp.expectedAPY}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">TVL</span>
                <span className="text-sm text-white font-medium">
                  {opp.tvl}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">24h Change</span>
                <div className="flex items-center space-x-1">
                  <span className={`text-sm font-medium ${opp.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {opp.change24h > 0 ? '+' : ''}{opp.change24h}%
                  </span>
                  {opp.change24h > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Liquidity</span>
                <span className="text-sm text-white">
                  {opp.liquidityDepth}
                </span>
              </div>
            </div>

            {/* APY Delta Indicator */}
            {opp.expectedAPY > opp.netAPY && (
              <div className="mb-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-400">AI Projection</span>
                  <span className="text-xs font-medium text-green-400">
                    +{(opp.expectedAPY - opp.netAPY).toFixed(2)}% uplift
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              className="w-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200"
              size="sm"
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}