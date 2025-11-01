"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Clock,
  DollarSign,
  Activity,
  Link2,
  AlertCircle,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BridgeRoute {
  name: string;
  from: string;
  to: string;
  estimatedFee: string;
  estimatedTime: string;
  liquidity: string;
  supported: boolean;
}

const bridgeRoutes: BridgeRoute[] = [
  {
    name: "Circle CCTP",
    from: "Stellar",
    to: "Solana",
    estimatedFee: "$0.00",
    estimatedTime: "~5 min",
    liquidity: "Infinite (Burn & Mint)",
    supported: true,
  },
  {
    name: "Circle CCTP",
    from: "Stellar",
    to: "Arbitrum",
    estimatedFee: "$0.00",
    estimatedTime: "~5 min",
    liquidity: "Infinite (Burn & Mint)",
    supported: true,
  },
  {
    name: "Soroban Bridge",
    from: "Stellar",
    to: "Ethereum",
    estimatedFee: "$2.50",
    estimatedTime: "~5 min",
    liquidity: "$45M",
    supported: true,
  },
  {
    name: "Wormhole",
    from: "Stellar",
    to: "Solana",
    estimatedFee: "$1.80",
    estimatedTime: "~3 min",
    liquidity: "$120M",
    supported: false,
  },
];

export default function BridgeInsights() {
  const [selectedBridge, setSelectedBridge] = useState("cctp");
  const [bridgeAmount, setBridgeAmount] = useState("");

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Market Overview</h2>
          <ArrowUpRight className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-400 mb-1">Stellar TVL</div>
            <div className="text-2xl font-bold text-white">$247.5M</div>
            <div className="text-xs text-green-400 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% (7d)
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">24h Volume</div>
              <div className="text-sm font-medium text-white">$45.8M</div>
              <div className="text-xs text-green-400">+8.3%</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Active Protocols</div>
              <div className="text-sm font-medium text-white">23</div>
              <div className="text-xs text-gray-400">+2 new</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Avg APY</div>
              <div className="text-sm font-medium text-white">9.31%</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Risk Score</div>
              <div className="text-sm font-medium text-yellow-400">B+</div>
            </div>
          </div>
        </div>
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
          <Select value={selectedBridge} onValueChange={setSelectedBridge}>
            <SelectTrigger className="w-full bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cctp">Circle CCTP (Recommended)</SelectItem>
              <SelectItem value="soroban">Soroban Bridge</SelectItem>
              <SelectItem value="wormhole">Wormhole (Deprecated)</SelectItem>
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
            <Button size="sm" className="bg-white/5 border border-white/10 hover:bg-white/10">
              Max
            </Button>
          </div>
        </div>

        {/* Bridge Routes */}
        <div className="space-y-3 mb-4">
          {bridgeRoutes.map((route, index) => (
            <div
              key={index}
              className="glass-panel rounded-lg p-3 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-white">{route.name}</div>
                  {route.name === "Circle CCTP" && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                      $0 Fees
                    </span>
                  )}
                  {route.name === "Soroban Bridge" && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                      Official
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
                  <span className="text-gray-300">{route.estimatedFee}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-300">{route.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-300">{route.liquidity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estimation Summary */}
        <div className="glass-panel rounded-lg p-3 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Bridge Fee (CCTP)</span>
              <span className="text-green-400 font-medium">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gas Cost</span>
              <span className="text-white">~$0.10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Circle Attestation</span>
              <span className="text-white">Free</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between">
              <span className="text-gray-400">Total Cost</span>
              <span className="text-green-400 font-medium">~$0.10</span>
            </div>
          </div>
        </div>

        {/* CCTP Info Banner */}
        <div className="flex items-start space-x-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20 mb-4">
          <Info className="w-4 h-4 text-green-500 mt-0.5" />
          <div className="text-xs text-green-400">
            <strong>Circle CCTP:</strong> Native USDC transfers with burn & mint mechanism. No bridge fees, only gas costs.
          </div>
        </div>

        <Button className="w-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200">
          View Bridge Details
        </Button>
      </div>
    </div>
  );
}
