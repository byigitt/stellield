"use client";

import React from "react";
import {
  Check,
  Loader2,
  Circle,
  ArrowRight,
  ExternalLink,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TimelineEvent {
  step: string;
  status: "started" | "completed" | "failed";
  timestamp: Date;
  txHash?: string;
  data?: any;
}

interface TransactionTimelineProps {
  events: TimelineEvent[];
  currentStep: string;
}

const STEP_LABELS: Record<string, string> = {
  XLM_RECEIVED: "XLM Received",
  XLM_TO_USDC_SWAP: "Swap XLM → USDC",
  USDC_BURN_STELLAR_TO_ETH: "Burn USDC on Stellar",
  BRIDGE_ATTESTATION_STELLAR_TO_ETH: "Bridge Attestation",
  USDC_MINT_ETHEREUM: "Mint USDC on Ethereum",
  AAVE_SUPPLY: "Supply to Aave",
  YIELD_ACCUMULATION: "Yield Accumulation",
  AAVE_WITHDRAW: "Withdraw from Aave",
  USDC_BURN_ETHEREUM: "Burn USDC on Ethereum",
  BRIDGE_ATTESTATION_ETH_TO_STELLAR: "Return Bridge Attestation",
  USDC_MINT_STELLAR_FROM_ETH: "Mint USDC on Stellar",
  USDC_TO_XLM_SWAP: "Swap USDC → XLM",
  XLM_RETURNED: "XLM Returned",
};

export default function TransactionTimeline({
  events,
  currentStep,
}: TransactionTimelineProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStepStatus = (step: string): "completed" | "current" | "pending" => {
    const event = events.find((e) => e.step === step);
    if (!event) return "pending";
    if (event.status === "completed") return "completed";
    if (step === currentStep) return "current";
    return "pending";
  };

  const allSteps = Object.keys(STEP_LABELS);
  const stepWithEvents = allSteps.map((step) => ({
    step,
    label: STEP_LABELS[step],
    status: getStepStatus(step),
    event: events.find((e) => e.step === step),
  }));

  return (
    <div className="space-y-1">
      {stepWithEvents.map((item, index) => {
        const isCompleted = item.status === "completed";
        const isCurrent = item.status === "current";
        const isPending = item.status === "pending";

        return (
          <div key={item.step} className="relative">
            {/* Connector Line */}
            {index < stepWithEvents.length - 1 && (
              <div
                className={cn(
                  "absolute left-3 top-6 w-0.5 h-6",
                  isCompleted ? "bg-green-500/50" : "bg-white/10"
                )}
              />
            )}

            {/* Step Item */}
            <div
              className={cn(
                "flex items-start space-x-3 p-2 rounded-lg transition-all",
                isCurrent && "bg-blue-500/10",
                isCompleted && "opacity-75 hover:opacity-100"
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted && (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                )}
                {isCurrent && (
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  </div>
                )}
                {isPending && (
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                    <Circle className="w-3 h-3 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCompleted && "text-gray-400",
                        isCurrent && "text-white",
                        isPending && "text-gray-500"
                      )}
                    >
                      {item.label}
                    </span>
                    {isCurrent && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        In Progress
                      </span>
                    )}
                  </div>

                  {item.event && (
                    <span className="text-xs text-gray-500">
                      {formatTime(item.event.timestamp)}
                    </span>
                  )}
                </div>

                {/* Transaction Hash */}
                {item.event?.txHash && item.event && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-mono text-gray-500">
                      {item.event.txHash.slice(0, 12)}...
                    </span>
                    <button
                      onClick={() => item.event?.txHash && copyToClipboard(item.event.txHash)}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <a
                      href={`https://etherscan.io/tx/${item.event.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Additional Data */}
                {item.event?.data && Object.keys(item.event.data).length > 0 && (
                  <div className="mt-1 text-xs text-gray-400">
                    {item.event.data.usdcAmount && (
                      <span>Amount: ${item.event.data.usdcAmount} USDC</span>
                    )}
                    {item.event.data.yieldEarned && (
                      <span className="text-green-400">
                        Yield: +${item.event.data.yieldEarned} USDC
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
