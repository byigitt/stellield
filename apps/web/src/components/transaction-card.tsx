"use client";

import React from "react";
import {
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TransactionCardProps {
  transaction: {
    id: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    currentStep: string | number;
    userAddress: string;
    amount?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    amounts?: {
      xlmDeposit?: string;
      usdcAfterSwap?: string;
      yieldEarned?: string;
      xlmReturned?: string;
    };
    events?: Array<{
      step: string | number;
      name?: string;
      status: string;
      timestamp: Date | string | null;
      txHash?: string | null;
    }>;
  };
  onClick?: () => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Clock,
    dotColor: "bg-blue-400",
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: Loader2,
    dotColor: "bg-yellow-400 animate-pulse",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: CheckCircle,
    dotColor: "bg-green-400",
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: XCircle,
    dotColor: "bg-red-400",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    icon: XCircle,
    dotColor: "bg-gray-400",
  },
};

export default function TransactionCard({
  transaction,
  onClick,
}: TransactionCardProps) {
  const config = STATUS_CONFIG[transaction.status];
  const StatusIcon = config.icon;

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatAddress = (address: string) => {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatStep = (step: string | number) => {
    if (typeof step === "number") {
      const steps = ["Initiated", "Swapping", "Bridging", "Earning Yield", "Completing"];
      return steps[step - 1] || `Step ${step}`;
    }
    return step.replace(/_/g, " ");
  };

  const yieldEarned = transaction.amounts?.yieldEarned
    ? parseFloat(transaction.amounts.yieldEarned)
    : 0;

  const totalSteps = transaction.events?.length || 0;
  const completedSteps = transaction.events?.filter(
    (e) => e.status === "completed"
  ).length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card
      className={cn(
        "glass-card p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer",
        "hover:shadow-lg hover:shadow-blue-500/10"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono text-gray-400">
                {formatAddress(transaction.id)}
              </span>
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {formatDate(transaction.createdAt)}
            </div>
          </div>
        </div>

        <Badge className={cn("text-xs border", config.color)}>
          <StatusIcon className={cn("w-3 h-3 mr-1", transaction.status === "PROCESSING" && "animate-spin")} />
          {config.label}
        </Badge>
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <div className="text-xs text-gray-400">Deposited</div>
          <div className="text-sm font-medium text-white">
            {transaction.amounts?.xlmDeposit || transaction.amount || "0"} XLM
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Value</div>
          <div className="text-sm font-medium text-white">
            ${transaction.amounts?.usdcAfterSwap || "0.00"}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Yield</div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              ${yieldEarned.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {transaction.status === "PROCESSING" && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{formatStep(transaction.currentStep)}</span>
            <span>
              {completedSteps}/{totalSteps} steps
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Step */}
      <div className="text-xs text-gray-400">
        {transaction.status === "PROCESSING" && (
          <span>Current: {formatStep(transaction.currentStep)}</span>
        )}
        {transaction.status === "COMPLETED" && (
          <span className="text-green-400">
            ✓ Returned {transaction.amounts?.xlmReturned || "0"} XLM
          </span>
        )}
        {transaction.status === "PENDING" && (
          <span>Waiting to start...</span>
        )}
      </div>
    </Card>
  );
}
