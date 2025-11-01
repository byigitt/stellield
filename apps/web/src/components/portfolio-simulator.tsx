"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Info,
  TrendingUp,
  AlertCircle,
  Calculator,
  Shield,
  DollarSign,
  Percent
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PortfolioSimulator() {
  const [allocation, setAllocation] = useState([30]);
  const [riskTolerance, setRiskTolerance] = useState("moderate");
  const [simulationAmount, setSimulationAmount] = useState("");

  const portfolioMetrics = {
    expectedAPY: 12.5,
    netAPY: 10.8,
    riskScore: 'B',
    sharpeRatio: 1.85,
    maxDrawdown: -15,
    liquidityScore: 92,
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">
            Portfolio Simulator
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Simulate portfolio allocations without executing trades</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Portfolio Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Expected APY</span>
            <TrendingUp className="w-3 h-3 text-green-400" />
          </div>
          <div className="text-lg font-semibold text-green-400">
            {portfolioMetrics.expectedAPY}%
          </div>
          <div className="text-xs text-gray-500">
            +{(portfolioMetrics.expectedAPY - portfolioMetrics.netAPY).toFixed(1)}% vs Net
          </div>
        </div>

        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Net APY</span>
            <Percent className="w-3 h-3 text-blue-400" />
          </div>
          <div className="text-lg font-semibold text-white">
            {portfolioMetrics.netAPY}%
          </div>
          <div className="text-xs text-gray-500">Current on-chain</div>
        </div>

        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Risk Score</span>
            <Shield className="w-3 h-3 text-yellow-400" />
          </div>
          <div className="text-lg font-semibold text-yellow-400">
            Tier {portfolioMetrics.riskScore}
          </div>
          <div className="text-xs text-gray-500">Moderate risk</div>
        </div>

        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Sharpe Ratio</span>
            <Info className="w-3 h-3 text-gray-500" />
          </div>
          <div className="text-lg font-semibold text-white">
            {portfolioMetrics.sharpeRatio}
          </div>
        </div>

        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Max Drawdown</span>
            <Info className="w-3 h-3 text-gray-500" />
          </div>
          <div className="text-lg font-semibold text-red-400">
            {portfolioMetrics.maxDrawdown}%
          </div>
        </div>

        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Liquidity Score</span>
            <Info className="w-3 h-3 text-gray-500" />
          </div>
          <div className="text-lg font-semibold text-white">
            {portfolioMetrics.liquidityScore}/100
          </div>
        </div>
      </div>

      {/* Risk Tolerance Selector */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">
          Risk Tolerance
        </label>
        <Select value={riskTolerance} onValueChange={setRiskTolerance}>
          <SelectTrigger className="w-full bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conservative">Conservative (Tier A only)</SelectItem>
            <SelectItem value="moderate">Moderate (Tier A-B)</SelectItem>
            <SelectItem value="aggressive">Aggressive (All Tiers)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Allocation Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Stellar Allocation</span>
          <span className="text-sm font-medium text-white">{allocation[0]}%</span>
        </div>
        <div className="relative">
          <Slider
            value={allocation}
            onValueChange={setAllocation}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-gray-500">Remaining: {100 - allocation[0]}%</span>
          <span className="text-blue-400">Can allocate to other chains</span>
        </div>
      </div>

      {/* Simulation Tabs */}
      <Tabs defaultValue="optimize" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-panel">
          <TabsTrigger value="optimize">AI Optimize</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="optimize" className="mt-4">
          <div className="space-y-4">
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">
                AI Recommended Allocation
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Soroban AMM (USDC)</span>
                  <span className="text-sm font-medium text-white">35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Aquarius Rewards</span>
                  <span className="text-sm font-medium text-white">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Stellar DEX LP</span>
                  <span className="text-sm font-medium text-white">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">StellarX Savings</span>
                  <span className="text-sm font-medium text-white">20%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Confidence Score</span>
                  <span className="text-sm font-medium text-green-400">87%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Simulation Amount (XLM)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="10,000"
                  value={simulationAmount}
                  onChange={(e) => setSimulationAmount(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                />
                <Button className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400">
                  <DollarSign className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-gray-500">≈ $1,200 USD</span>
                <div className="space-x-2">
                  <button className="text-blue-400 hover:text-blue-300">1K</button>
                  <button className="text-blue-400 hover:text-blue-300">10K</button>
                  <button className="text-blue-400 hover:text-blue-300">100K</button>
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              Run Simulation
            </Button>

            {/* Warning for simulation */}
            <div className="flex items-start space-x-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div className="text-xs text-yellow-400">
                This is a simulation only. No funds will be moved. Results are based on current market conditions and AI projections.
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <div className="text-center text-gray-400 py-8">
            Manual allocation configuration
          </div>
        </TabsContent>

        <TabsContent value="compare" className="mt-4">
          <div className="text-center text-gray-400 py-8">
            Compare multiple strategies
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}