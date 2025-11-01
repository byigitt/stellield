"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Globe,
  Wallet,
  Copy,
  LogOut,
  Shield,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Yields", href: "/dashboard/yields" },
  { label: "Portfolio", href: "/dashboard/portfolio" },
  { label: "Bridge", href: "/dashboard/bridge" },
  { label: "Analytics", href: "/dashboard/analytics" }
];

export default function StellarHeader() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [mounted, setMounted] = useState(false);

  const riskDistribution = [
    {
      tier: "A",
      label: "Low Risk",
      percentage: 42,
      color: "bg-green-500",
      dotColor: "bg-green-400",
    },
    {
      tier: "B",
      label: "Medium",
      percentage: 35,
      color: "bg-yellow-500",
      dotColor: "bg-yellow-400",
    },
    {
      tier: "C",
      label: "Higher",
      percentage: 18,
      color: "bg-orange-500",
      dotColor: "bg-orange-400",
    },
    {
      tier: "D",
      label: "High",
      percentage: 5,
      color: "bg-red-500",
      dotColor: "bg-red-400",
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const connectWallet = async () => {
    setIsConnected(true);
    setWalletAddress("GBXZ...3FD4");
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("");
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
    }
  };

  return (
    <header className="glass-panel border-b border-white/[0.05] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo-main.png"
                  alt="Stellar Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-white">
                  Stellar
                </span>
                <span className="text-xs text-gray-400 -mt-1">
                  Yield Aggregator
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href as any}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center space-x-2 px-3 py-1.5 glass-panel rounded-lg cursor-default">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-gray-400">Mainnet</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Connected to Stellar Mainnet</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Risk Score */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center space-x-2 px-3 py-1.5 glass-panel rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">
                    B+
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="glass-card rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">
                      Risk Distribution
                    </h3>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-xs text-gray-400">
                          Tier A (Low Risk)
                        </span>
                      </div>
                      <span className="text-xs font-medium text-white">
                        42%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <span className="text-xs text-gray-400">
                          Tier B (Medium)
                        </span>
                      </div>
                      <span className="text-xs font-medium text-white">
                        35%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        <span className="text-xs text-gray-400">
                          Tier C (Higher)
                        </span>
                      </div>
                      <span className="text-xs font-medium text-white">
                        18%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span className="text-xs text-gray-400">
                          Tier D (High)
                        </span>
                      </div>
                      <span className="text-xs font-medium text-white">5%</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Activity */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Activity className="w-4 h-4" />
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-card border-white/10">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Español</DropdownMenuItem>
                <DropdownMenuItem>中文</DropdownMenuItem>
                <DropdownMenuItem>日本語</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wallet Connection */}
            {mounted &&
              (!isConnected ? (
                <Button
                  onClick={connectWallet}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white px-6 flex items-center space-x-2 shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white px-4 shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-xs font-bold">S</span>
                        </div>
                        <span className="text-sm font-medium">
                          {walletAddress}
                        </span>
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-card border-white/10 w-48">
                    <div className="px-3 py-2">
                      <div className="text-xs text-gray-400">Balance</div>
                      <div className="text-sm font-medium text-white">
                        1,234.56 XLM
                      </div>
                      <div className="text-xs text-gray-500">≈ $148.15 USD</div>
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={copyAddress}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Activity className="w-4 h-4 mr-2" />
                      View Activity
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={disconnectWallet}
                      className="text-red-400"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
}
