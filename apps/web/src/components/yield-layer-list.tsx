"use client";
import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface YieldLayerItem {
  rank: number;
  name: string;
  apy: number;
  tokens: string[];
  gradient?: string;
  textColor?: string;
}

const yieldLayers: YieldLayerItem[] = [
  {
    rank: 1,
    name: "USDC Yield Layer",
    apy: 20.82,
    tokens: ["💵", "🔷", "🟢", "🟠", "🟡"],
    gradient: "from-blue-500/10 to-blue-600/10",
  },
  {
    rank: 2,
    name: "mF-ONE Yield Layer",
    apy: 13.32,
    tokens: ["🔴", "🔵"],
    gradient: "from-purple-500/10 to-purple-600/10",
  },
  {
    rank: 3,
    name: "svrupUSDT Yield Layer",
    apy: 20.05,
    tokens: ["🟢", "🟠"],
    gradient: "from-green-500/10 to-green-600/10",
  },
  {
    rank: 4,
    name: "Bybit Earn Yield Layer",
    apy: 4.17,
    tokens: ["💎", "🔵"],
    gradient: "from-gray-500/10 to-gray-600/10",
    textColor: "text-gray-300",
  },
  {
    rank: 5,
    name: "USD1 Yield Layer",
    apy: 9.74,
    tokens: ["🟡", "🟢"],
    gradient: "from-yellow-500/10 to-yellow-600/10",
  },
  {
    rank: 6,
    name: "slissBNB Yield Layer",
    apy: 1.26,
    tokens: ["🟡", "🟠"],
    gradient: "from-amber-500/10 to-amber-600/10",
    textColor: "text-gray-400",
  },
];

export default function YieldLayerList() {
  const [protocolFilter1, setProtocolFilter1] = useState("BBTC/BNB/BTCB");
  const [protocolFilter2, setProtocolFilter2] = useState("Ethereum/BSC/Sei");

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      {/* Protocol Filters */}
      <div className="flex items-center space-x-3 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="glass-panel border border-white/10 text-white hover:bg-white/10"
            >
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  <span className="text-sm">🔶</span>
                  <span className="text-sm">🟡</span>
                  <span className="text-sm">🟠</span>
                </div>
                <span className="text-sm font-medium">+29</span>
                <span className="text-sm">{protocolFilter1}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card border-white/10">
            <DropdownMenuItem onClick={() => setProtocolFilter1("BBTC/BNB/BTCB")}>
              BBTC/BNB/BTCB
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setProtocolFilter1("ETH/WETH")}>
              ETH/WETH
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setProtocolFilter1("USDC/USDT")}>
              USDC/USDT
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
                <div className="flex -space-x-1">
                  <span className="text-sm">🔷</span>
                  <span className="text-sm">🟣</span>
                  <span className="text-sm">🔴</span>
                </div>
                <span className="text-sm font-medium">+3</span>
                <span className="text-sm">{protocolFilter2}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card border-white/10">
            <DropdownMenuItem onClick={() => setProtocolFilter2("Ethereum/BSC/Sei")}>
              Ethereum/BSC/Sei
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setProtocolFilter2("Polygon/Avalanche")}>
              Polygon/Avalanche
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setProtocolFilter2("Arbitrum/Optimism")}>
              Arbitrum/Optimism
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Yield Layer Header */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-400"></div>
        <h2 className="text-lg font-semibold text-white">Yield Layer</h2>
      </div>

      {/* Yield Layer Cards */}
      <div className="space-y-3">
        {yieldLayers.map((layer) => (
          <div
            key={layer.rank}
            className={`glass-panel rounded-xl p-4 hover:scale-[1.01] transition-all duration-200 bg-gradient-to-r ${layer.gradient} border border-white/5 hover:border-white/10`}
          >
            <div className="flex items-center justify-between">
              {/* Left Section - Rank and Name */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8">
                  <span className="text-sm font-medium text-gray-400">
                    {layer.rank}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-white mb-1">
                    {layer.name}
                  </div>
                  <div className="flex -space-x-1">
                    {layer.tokens.map((token, index) => (
                      <span key={index} className="text-lg">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Section - APY */}
              <div className="text-right">
                <div className={`text-2xl font-bold ${layer.textColor || "text-white"}`}>
                  {layer.apy}%
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  APY
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add More Button */}
      <Button
        className="w-full mt-4 glass-panel border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
        variant="ghost"
      >
        <Plus className="w-4 h-4 mr-2" />
        Load More Yield Layers
      </Button>
    </div>
  );
}