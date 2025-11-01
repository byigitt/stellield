"use client";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

interface YieldCardProps {
  amount: string;
  currency: string;
  earnings: string;
  netAPR: number;
  change: number;
  icon: string;
  gradient: string;
}

const yieldData: YieldCardProps[] = [
  {
    amount: "9481",
    currency: "USDC",
    earnings: "$10",
    netAPR: 7.76,
    change: 1,
    icon: "💵",
    gradient: "from-blue-500/20 to-blue-600/20",
  },
  {
    amount: "1477",
    currency: "USDC",
    earnings: "$147.00",
    netAPR: 5.88,
    change: -1,
    icon: "🌱",
    gradient: "from-green-500/20 to-green-600/20",
  },
  {
    amount: "10,000",
    currency: "USDC",
    earnings: "$10,000.00",
    netAPR: 2.82,
    change: 1,
    icon: "💎",
    gradient: "from-purple-500/20 to-purple-600/20",
  },
  {
    amount: "3,000",
    currency: "USDC",
    earnings: "$3,000.00",
    netAPR: 4.5,
    change: -1,
    icon: "💸",
    gradient: "from-cyan-500/20 to-cyan-600/20",
  },
];

export default function YieldCards() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            The Best DeFi Yields In 1-Click
          </h1>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-400">$</span>
              <span className="text-xl text-gray-300">
                Total Lendings (<span className="text-green-400">$815,921,161</span>)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Liquidity Total Supply</span>
              <span className="text-white font-semibold">($1,895,697,073)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {yieldData.map((card, index) => (
          <div
            key={index}
            className={`glass-card rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300 bg-gradient-to-br ${card.gradient} border border-white/10`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                  {card.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {card.amount}
                  </div>
                  <div className="text-sm text-gray-400">{card.currency}</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Earnings</span>
                <span className="text-sm text-white font-medium">
                  {card.earnings}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Net APR</span>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-white font-medium">
                    {card.netAPR}%
                  </span>
                  {card.change > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Button */}
            <Button
              className="w-full bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-700 text-white backdrop-blur-sm"
              size="sm"
            >
              Start Earning
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}