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
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function MarketSidebar() {
  const [orderType, setOrderType] = useState("price");
  const [tradeType, setTradeType] = useState("buy");

  return (
    <div className="space-y-6">
      {/* Fluid Statistics */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Fluid Statistics</h2>
          <ArrowUpRight className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Market Size</div>
            <div className="text-2xl font-bold text-white">$1,917,537,334.58</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">24h Volume</div>
              <div className="text-sm font-medium text-white">$245.8M</div>
              <div className="text-xs text-green-400 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                12.5%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">TVL</div>
              <div className="text-sm font-medium text-white">$1.92B</div>
              <div className="text-xs text-green-400 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                8.3%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Order */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Create Order</h2>

        {/* Tabs for Order Types */}
        <Tabs value={orderType} onValueChange={setOrderType} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 glass-panel">
            <TabsTrigger value="price">Price Limit</TabsTrigger>
            <TabsTrigger value="market">Market Price</TabsTrigger>
            <TabsTrigger value="stop">Stop Limit</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Trading Pair */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Pair</label>
          <Select defaultValue="eth-fluid">
            <SelectTrigger className="w-full bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eth-fluid">ETH / FLUID</SelectItem>
              <SelectItem value="btc-fluid">BTC / FLUID</SelectItem>
              <SelectItem value="usdc-fluid">USDC / FLUID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Display */}
        <div className="glass-panel rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Sell</span>
            <span className="text-xs text-gray-400">MAX</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-500" />
              <span className="text-sm font-medium text-white">ETH</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-white">0.3</div>
              <div className="text-xs text-gray-400">$1,095.78</div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Buy</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600" />
              <span className="text-sm font-medium text-white">FLUID</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-white">0.001</div>
              <div className="text-xs text-gray-400">1m : 1 FLUID</div>
            </div>
          </div>
        </div>

        {/* Trading Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="glass-panel rounded-lg p-2">
            <span className="text-gray-400">1 ETH = $3,652.59 FLUID</span>
          </div>
          <div className="glass-panel rounded-lg p-2">
            <span className="text-gray-400">Slippage 0.1%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs mb-4">
          <span className="text-gray-400">Price Impact</span>
          <span className="text-yellow-400">0.00%</span>
        </div>

        {/* Connect Button */}
        <Button className="w-full bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200">
          ⚡ Connect
        </Button>

        {/* User Info (when connected) */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white font-medium">AR</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Abu Raihan</div>
              <div className="text-xs text-gray-400">aburaihan.it00@gmail.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="glass-card rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-400">ETH/FLUID</div>
            <div className="text-lg font-semibold text-white">3,652.59</div>
            <div className="text-xs text-green-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.45%
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">24h High</div>
            <div className="text-sm text-white">3,725.00</div>
            <div className="text-xs text-gray-400 mt-1">24h Low</div>
            <div className="text-sm text-white">3,580.00</div>
          </div>
        </div>
        {/* Placeholder for chart */}
        <div className="h-32 glass-panel rounded-lg flex items-center justify-center text-gray-500">
          <span className="text-xs">Chart Placeholder</span>
        </div>
      </div>
    </div>
  );
}