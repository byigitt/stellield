"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useEthPrice } from "@/hooks/use-eth-price";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Globe,
  Wallet,
  Copy,
  LogOut,
  Shield,
  Activity,
  Menu,
  X,
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
import { fetchDefiLlamaPools } from "@/lib/data-sources";
import { computeRiskDistribution, RISK_COLOR_SCHEME } from "@/lib/metrics";
import { sepolia } from "viem/chains";

const normalizeChainId = (value?: string | number | null) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const radix = value.startsWith("0x") ? 16 : 10;
    const parsed = Number.parseInt(value, radix);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Yields", href: "/dashboard/yields" },
  { label: "Agent", href: "/dashboard/agent" },
  { label: "Transactions", href: "/dashboard/transactions" },
  { label: "Bridge", href: "/dashboard/bridge" },
  { label: "Docs", href: "/docs" },
];

export default function StellarHeader() {
  const pathname = usePathname();
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const connectedWallet = wallets && wallets.length > 0 ? wallets[0] : null;
  const walletAddress = connectedWallet?.address
    ? `${connectedWallet.address.slice(0, 6)}...${connectedWallet.address.slice(-4)}`
    : "";
  const walletChainId = normalizeChainId(connectedWallet?.chainId);
  const isOnSepolia = walletChainId === sepolia.id;
  const networkIndicator = connectedWallet
    ? isOnSepolia
      ? {
          dotClass: "bg-amber-400 animate-pulse",
          label: "Sepolia Testnet",
          tooltip: "Wallet connected to Ethereum Sepolia Testnet",
        }
      : {
          dotClass: "bg-red-400",
          label: "Wrong Network",
          tooltip: `Wallet connected to chain ${connectedWallet?.chainId ?? "unknown"}. Switch to Ethereum Sepolia (chainId ${sepolia.id}).`,
        }
    : {
        dotClass: "bg-amber-300/70",
        label: "Sepolia Testnet",
        tooltip: "Default network: Ethereum Sepolia Testnet",
      };

  // Fetch wallet balance and ETH price
  const { balanceFormatted, isLoading: isLoadingBalance } = useWalletBalance(connectedWallet?.address);
  const { price: ethPrice } = useEthPrice();

  const { data: stellarPools, isLoading: isLoadingRisk } = useQuery({
    queryKey: ["defillama-pools", "Stellar"],
    queryFn: () => fetchDefiLlamaPools("Stellar"),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const { distribution: riskDistribution, grade: riskGrade } = useMemo(
    () => computeRiskDistribution(stellarPools),
    [stellarPools],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyAddress = () => {
    if (connectedWallet?.address) {
      navigator.clipboard.writeText(connectedWallet.address);
      toast.success("Address copied to clipboard!");
    }
  };

  const balanceValue = Number.parseFloat(balanceFormatted);
  const balanceUSD = Number.isFinite(balanceValue) && Number.isFinite(ethPrice)
    ? (balanceValue * ethPrice).toFixed(2)
    : "0.00";

  return (
    <header className="glass-panel border-b border-white/[0.05] sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8">
            <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-8 sm:w-10 h-8 sm:h-10 relative">
                <Image
                  src="/logo-main.png"
                  alt="Stellield Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-semibold text-white">
                  Stellield
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 -mt-0.5 sm:-mt-1">
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
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* Network Status - Hidden on mobile */}
            <div className="hidden sm:block">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center space-x-2 px-3 py-1.5 glass-panel rounded-lg cursor-default">
                      <div className={`w-2 h-2 rounded-full ${networkIndicator.dotClass}`}></div>
                      <span className="text-xs text-gray-400">{networkIndicator.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{networkIndicator.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Risk Score */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 glass-panel rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <Shield className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400" />
                  <span className="text-[10px] sm:text-xs font-medium text-yellow-400">
                    {isLoadingRisk ? "…" : riskGrade}
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
                  {isLoadingRisk ? (
                    <div className="flex items-center justify-center py-6 text-xs text-gray-400">
                      Loading risk metrics...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {riskDistribution.map(({ tier, percentage }) => (
                        <div key={tier} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${RISK_COLOR_SCHEME[tier].marker}`}></div>
                            <span className="text-xs text-gray-400">
                              Tier {tier} ({RISK_COLOR_SCHEME[tier].label})
                            </span>
                          </div>
                          <span className="text-xs font-medium text-white">
                            {percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Activity - Hidden on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Activity className="w-4 h-4" />
            </Button>

            {/* Language Selector - Hidden on mobile */}
            <div className="hidden sm:block">
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
            </div>

            {/* Wallet Connection */}
            {mounted &&
              (!authenticated || !connectedWallet ? (
                <Button
                  onClick={login}
                  disabled={!ready}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white px-3 sm:px-6 flex items-center space-x-2 shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white px-2 sm:px-4 shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] transition-all duration-200">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-[10px] sm:text-xs font-bold">
                            {walletAddress.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                          {walletAddress}
                        </span>
                        <ChevronDown className="w-3 h-3 sm:w-3 sm:h-3" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-card border-white/10 w-56">
                    {/* User Info */}
                    {user?.email?.address && (
                      <>
                        <div className="px-3 py-2">
                          <div className="text-xs text-gray-400">Email</div>
                          <div className="text-sm font-medium text-white truncate">
                            {user.email.address}
                          </div>
                        </div>
                        <DropdownMenuSeparator className="bg-white/10" />
                      </>
                    )}
                    
                    {/* Wallet Info */}
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">Wallet</div>
                        <div className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                          {connectedWallet?.walletClientType === "privy" ? "Embedded" : "External"}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-white mt-1">
                        {walletAddress}
                      </div>
                      {connectedWallet?.connectorType && connectedWallet.connectorType !== "embedded" && (
                        <div className="text-xs text-gray-500 mt-0.5 capitalize">
                          via {connectedWallet.connectorType}
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    {/* Balance */}
                    <div className="px-3 py-2">
                      <div className="text-xs text-gray-400">Balance</div>
                      {isLoadingBalance ? (
                        <div className="text-sm font-medium text-white">
                          Loading...
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-white">
                            {balanceFormatted} ETH (Sepolia)
                          </div>
                          <div className="text-xs text-gray-500">
                            ≈ ${balanceUSD} USD
                          </div>
                          {!isOnSepolia && connectedWallet && (
                            <div className="text-[10px] text-red-400 mt-1">
                              Switch wallet to Sepolia to ensure accurate balance.
                            </div>
                          )}
                        </>
                      )}
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
                      onClick={logout}
                      className="text-red-400"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors ml-1"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 top-16 bg-black/80 backdrop-blur-md z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="md:hidden fixed inset-x-0 top-16 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container mx-auto px-4 py-4">
            {/* Navigation */}
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href as any}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border border-white/20"
                        : "text-gray-300 hover:text-white hover:bg-white/10 bg-white/5"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Status Info */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
              {/* Network Status */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-lg">
                <div className={`w-2 h-2 rounded-full ${networkIndicator.dotClass}`}></div>
                <span className="text-xs text-gray-300">{networkIndicator.label}</span>
              </div>

              {/* Risk Score */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-lg">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-medium text-yellow-400">
                  {isLoadingRisk ? "…" : riskGrade}
                </span>
              </div>
            </div>

            {/* Wallet Info in Mobile Menu */}
            {mounted && connectedWallet && (
              <div className="mt-4 p-3 bg-white/10 backdrop-blur-xl rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Wallet</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    {connectedWallet?.walletClientType === "privy" ? "Embedded" : "External"}
                  </span>
                </div>
                <div className="text-sm font-medium text-white">{walletAddress}</div>
                {!isLoadingBalance && (
                  <div className="text-xs text-gray-500 mt-1">
                    {balanceFormatted} ETH ≈ ${balanceUSD}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </header>
  );
}
