"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  TrendingUp,
  Activity,
  DollarSign,
  CheckCircle,
  Loader2,
  Filter,
  RefreshCw,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransactionCard from "@/components/transaction-card";
import TransactionTimeline from "@/components/transaction-timeline";

type FilterStatus = "all" | "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// Animated counter component
function AnimatedCounter({ value, decimals = 0, prefix = "", suffix = "" }: { 
  value: number; 
  decimals?: number; 
  prefix?: string; 
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    const duration = 800; // Animation duration in ms
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * easeOutQuart;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Mock data generator for live demo effect
const generateMockTransaction = () => {
  const statuses: Array<"PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"> = [
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "COMPLETED",
    "COMPLETED",
  ];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const xlmAmount = (Math.random() * 1000 + 100).toFixed(2);
  const usdcAmount = (parseFloat(xlmAmount) * 0.12).toFixed(2);
  const yieldEarned = randomStatus === "COMPLETED" ? (Math.random() * 5 + 0.5).toFixed(4) : "0";

  return {
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userAddress: `G${Math.random().toString(36).substr(2, 9).toUpperCase()}...${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    status: randomStatus,
    currentStep: randomStatus === "COMPLETED" ? 5 : randomStatus === "FAILED" ? 3 : Math.floor(Math.random() * 3) + 1,
    createdAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    amounts: {
      xlmDeposit: xlmAmount,
      usdcAfterSwap: usdcAmount,
      yieldEarned,
      xlmReturned: randomStatus === "COMPLETED" ? (parseFloat(xlmAmount) + parseFloat(yieldEarned) * 8).toFixed(2) : "-",
    },
    events: [
      {
        step: 1,
        name: "XLM Deposit",
        status: "completed",
        timestamp: new Date(Date.now() - Math.random() * 3000000).toISOString(),
        txHash: `0x${Math.random().toString(16).substr(2, 16)}`,
      },
      {
        step: 2,
        name: "Swap to USDC",
        status: randomStatus === "PENDING" ? "pending" : "completed",
        timestamp: randomStatus === "PENDING" ? null : new Date(Date.now() - Math.random() * 2000000).toISOString(),
        txHash: randomStatus === "PENDING" ? null : `0x${Math.random().toString(16).substr(2, 16)}`,
      },
      {
        step: 3,
        name: "Bridge to Base",
        status: randomStatus === "PROCESSING" || randomStatus === "PENDING" ? "pending" : "completed",
        timestamp: randomStatus === "PROCESSING" || randomStatus === "PENDING" ? null : new Date(Date.now() - Math.random() * 1000000).toISOString(),
      },
      {
        step: 4,
        name: "Earn Yield on Base",
        status: randomStatus === "COMPLETED" ? "completed" : "pending",
        timestamp: randomStatus === "COMPLETED" ? new Date(Date.now() - Math.random() * 500000).toISOString() : null,
      },
      {
        step: 5,
        name: "Return to Stellar",
        status: randomStatus === "COMPLETED" ? "completed" : "pending",
        timestamp: randomStatus === "COMPLETED" ? new Date().toISOString() : null,
        txHash: randomStatus === "COMPLETED" ? `0x${Math.random().toString(16).substr(2, 16)}` : null,
      },
    ],
  };
};

export default function TransactionsPage() {
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [mockTransactions, setMockTransactions] = useState<any[]>([]);

  // Fetch all transactions with real-time updates using proper tRPC hooks
  const {
    data: realTransactions = [],
    isLoading: isLoadingTx,
    refetch,
  } = trpc.stellar.getAllFlows.useQuery(undefined, {
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    staleTime: 1000,
  });

  // Fetch statistics using proper tRPC hooks
  const {
    data: realStats,
    isLoading: isLoadingStats,
  } = trpc.stellar.getFlowStatistics.useQuery(undefined, {
    refetchInterval: 5000, // Refresh stats every 5 seconds
    staleTime: 2000,
  });

  // Generate mock transactions if no real data
  useEffect(() => {
    if (!isLoadingTx && realTransactions.length === 0) {
      // Initialize with some mock transactions
      const initialMocks = Array.from({ length: 8 }, () => generateMockTransaction());
      setMockTransactions(initialMocks);

      // Add new mock transactions every 5-10 seconds for live effect
      const interval = setInterval(() => {
        setMockTransactions((prev) => {
          const newTx = generateMockTransaction();
          // Keep max 20 mock transactions
          const updated = [newTx, ...prev].slice(0, 20);
          return updated;
        });
      }, Math.random() * 5000 + 5000); // Random interval between 5-10 seconds

      return () => clearInterval(interval);
    } else if (realTransactions.length > 0) {
      // Clear mocks when real data arrives
      setMockTransactions([]);
    }
  }, [isLoadingTx, realTransactions.length]);

  // Use real transactions if available, otherwise use mocks
  const transactions = realTransactions.length > 0 ? realTransactions : mockTransactions;

  // Calculate stats from mock data if no real stats
  const stats = useMemo(() => {
    // Use real stats only if we have real transactions
    if (realStats && realTransactions.length > 0) return realStats;

    // Calculate from mock data
    if (mockTransactions.length === 0) {
      return {
        total24h: 0,
        volume24h: 0,
        yield24h: 0,
        successRate: 0,
        byStatus: {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
        },
      };
    }

    const completed = mockTransactions.filter((tx) => tx.status === "COMPLETED");
    const totalVolume = mockTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.amounts.usdcAfterSwap || "0"),
      0
    );
    const totalYield = completed.reduce(
      (sum, tx) => sum + parseFloat(tx.amounts.yieldEarned || "0"),
      0
    );

    return {
      total24h: mockTransactions.length,
      volume24h: totalVolume,
      yield24h: totalYield,
      successRate: (completed.length / mockTransactions.length) * 100,
      byStatus: {
        pending: mockTransactions.filter((tx) => tx.status === "PENDING").length,
        processing: mockTransactions.filter((tx) => tx.status === "PROCESSING").length,
        completed: completed.length,
        failed: mockTransactions.filter((tx) => tx.status === "FAILED").length,
      },
    };
  }, [realStats, realTransactions.length, mockTransactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((tx: any) => tx.status === filter);
  }, [transactions, filter]);

  const isLoading = isLoadingTx || isLoadingStats;
  const isMockMode = realTransactions.length === 0 && mockTransactions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#151932] to-[#1a1f3a]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                Yield Transactions
              </h1>
              {isMockMode && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">
                    Live Demo
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-400">
              Real-time monitoring of cross-chain yield flows
            </p>
          </div>

          <Button
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card p-4 border border-white/10 transition-all hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-400/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">Total Transactions</div>
                <div className="text-2xl font-bold text-white tabular-nums">
                  <AnimatedCounter value={stats?.total24h || 0} />
                </div>
                <div className="text-xs text-gray-500 mt-1">Last 24h</div>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="glass-card p-4 border border-white/10 transition-all hover:border-green-400/30 hover:shadow-lg hover:shadow-green-400/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">Total Volume</div>
                <div className="text-2xl font-bold text-white tabular-nums">
                  <AnimatedCounter value={stats?.volume24h || 0} decimals={2} prefix="$" />
                </div>
                <div className="text-xs text-gray-500 mt-1">Last 24h</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="glass-card p-4 border border-white/10 transition-all hover:border-green-400/30 hover:shadow-lg hover:shadow-green-400/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">Total Yield</div>
                <div className="text-2xl font-bold text-green-400 tabular-nums">
                  <AnimatedCounter value={stats?.yield24h || 0} decimals={4} prefix="+$" />
                </div>
                <div className="text-xs text-gray-500 mt-1">Last 24h</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="glass-card p-4 border border-white/10 transition-all hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-400/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-white tabular-nums">
                  <AnimatedCounter value={stats?.successRate || 0} decimals={1} suffix="%" />
                </div>
                <div className="text-xs text-gray-500 mt-1">All time</div>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
            <TabsList className="glass-panel border border-white/10">
              <TabsTrigger value="all">
                All ({transactions.length})
              </TabsTrigger>
              <TabsTrigger value="PENDING">
                Pending ({stats?.byStatus?.pending || 0})
              </TabsTrigger>
              <TabsTrigger value="PROCESSING">
                Processing ({stats?.byStatus?.processing || 0})
              </TabsTrigger>
              <TabsTrigger value="COMPLETED">
                Completed ({stats?.byStatus?.completed || 0})
              </TabsTrigger>
              <TabsTrigger value="FAILED">
                Failed ({stats?.byStatus?.failed || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        )}

        {/* Transactions List */}
        {!isLoading && filteredTransactions.length === 0 && (
          <Card className="glass-card p-12 border border-white/10 text-center">
            <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No transactions found
            </h3>
            <p className="text-gray-400 text-sm">
              {filter === "all"
                ? "Start a yield flow to see transactions here"
                : `No ${filter.toLowerCase()} transactions at the moment`}
            </p>
          </Card>
        )}

        {!isLoading && filteredTransactions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTransactions.map((tx: any, index: number) => (
              <div
                key={tx.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationDuration: "500ms",
                  animationFillMode: "backwards",
                }}
              >
                <TransactionCard
                  transaction={tx}
                  onClick={() => setSelectedTx(tx)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Transaction Details Modal */}
        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent className="glass-card border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Transaction Details</DialogTitle>
            </DialogHeader>

            {selectedTx && (
              <div className="space-y-6">
                {/* Transaction Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Transaction ID</div>
                    <div className="text-sm font-mono text-white break-all">
                      {selectedTx.id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Status</div>
                    <div className="text-sm text-white">{selectedTx.status}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">User Address</div>
                    <div className="text-sm font-mono text-white">
                      {selectedTx.userAddress}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Created At</div>
                    <div className="text-sm text-white">
                      {new Date(selectedTx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="glass-panel p-4 rounded-lg border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Amount Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-400">XLM Deposited</div>
                      <div className="text-white font-medium">
                        {selectedTx.amounts?.xlmDeposit || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">USDC After Swap</div>
                      <div className="text-white font-medium">
                        ${selectedTx.amounts?.usdcAfterSwap || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Yield Earned</div>
                      <div className="text-green-400 font-medium">
                        +${selectedTx.amounts?.yieldEarned || "0"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">XLM Returned</div>
                      <div className="text-white font-medium">
                        {selectedTx.amounts?.xlmReturned || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="glass-panel p-4 rounded-lg border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-4">
                    Transaction Timeline
                  </h3>
                  <TransactionTimeline
                    events={selectedTx.events || []}
                    currentStep={selectedTx.currentStep}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
