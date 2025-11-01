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
import { ChevronDown, Info, TrendingUp, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TradingPanel() {
  const [ratio, setRatio] = useState([30.11]);
  const [activeTab, setActiveTab] = useState("deposit");

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 glass-panel px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500" />
              <span className="text-white font-medium">ETH</span>
              <span className="text-gray-400">/</span>
              <span className="text-white font-medium">ISDC</span>
            </div>
            <span className="text-gray-400 text-sm">#0</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <Info className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            ⚙️
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Net APY</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Annual Percentage Yield</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-lg font-semibold text-white">2.5%</div>
        </div>

        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Collateral Factor</span>
            <Info className="w-3 h-3 text-gray-500" />
          </div>
          <div className="text-lg font-semibold text-white">87%</div>
        </div>

        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Liquidation Threshold</span>
            <Info className="w-3 h-3 text-gray-500" />
          </div>
          <div className="text-lg font-semibold text-white">92%</div>
        </div>

        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Liquidation Price</span>
            <Info className="w-3 h-3 text-gray-500" />
          </div>
          <div className="text-lg font-semibold text-white">$2,760 USDC</div>
        </div>
      </div>

      {/* Ratio Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Ratio</span>
          <span className="text-sm font-medium text-white">{ratio[0]}%</span>
        </div>
        <div className="relative">
          <Slider
            value={ratio}
            onValueChange={setRatio}
            max={100}
            step={0.01}
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
        {ratio[0] > 85 && (
          <div className="flex items-center space-x-2 mt-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-yellow-500">High risk position</span>
          </div>
        )}
      </div>

      {/* Collateral Section */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-300">Collateral</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* ETH Collateral */}
          <div className="glass-panel rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500" />
                <div>
                  <div className="text-lg font-semibold text-white">1.2 ETH</div>
                  <div className="text-xs text-gray-400">$3,654.65</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-400">2.14%</div>
                <div className="text-xs text-gray-500">0.03 ETH</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Total</span>
              <span className="text-gray-300">$0.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Net APR</span>
              <span className="text-gray-300">2.14%</span>
            </div>
          </div>

          {/* USDC Debt */}
          <div className="glass-panel rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
                <div>
                  <div className="text-lg font-semibold text-white">
                    $1,000 USDC
                  </div>
                  <div className="text-xs text-gray-400">$3,000</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-400">5.21%</div>
                <div className="text-xs text-gray-500">52.10 USDC</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Total</span>
              <span className="text-gray-300">$0.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Net APR</span>
              <span className="text-gray-300">5.21%</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex justify-between">
          <span>Debt</span>
          <span className="text-gray-300">Total $0.00 • Net APR 5.21%</span>
        </div>
      </div>

      {/* Action Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-panel">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
          <TabsTrigger value="payback">Payback</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="mt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="0.0"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                />
                <Select defaultValue="eth">
                  <SelectTrigger className="w-32 bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eth">ETH</SelectItem>
                    <SelectItem value="usdc">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-gray-500">Balance: 2.5 ETH</span>
                <div className="space-x-2">
                  <button className="text-blue-400 hover:text-blue-300">25%</button>
                  <button className="text-blue-400 hover:text-blue-300">50%</button>
                  <button className="text-blue-400 hover:text-blue-300">MAX</button>
                </div>
              </div>
            </div>

            <Button className="w-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200">
              Deposit ETH
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="mt-4">
          <div className="text-center text-gray-400 py-8">
            Withdraw functionality
          </div>
        </TabsContent>

        <TabsContent value="borrow" className="mt-4">
          <div className="text-center text-gray-400 py-8">
            Borrow functionality
          </div>
        </TabsContent>

        <TabsContent value="payback" className="mt-4">
          <div className="text-center text-gray-400 py-8">
            Payback functionality
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}