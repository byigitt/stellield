"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  X,
  Info,
  ChevronDown,
  Check,
  Search,
  Repeat2,
  Flame,
  Timer,
  Coins,
  PiggyBank,
  Sparkles,
  Wallet,
  ArrowLeftRight,
  BadgeCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useEthPrice } from "@/hooks/use-eth-price";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data for demonstration
const MOCK_DATA = {
  performanceFee: 10,
  exitFee: 0.02,
  minDeposit: 10000,
  withdrawalWaiting: "~7 days",
  withdrawToken: "USDC",
  exchangeRate: "0.9964",
  supportLinks: {
    discord: "https://discord.gg/example",
    telegram: "https://t.me/example",
  },
};

type StepStatus = "pending" | "active" | "completed";

interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

interface YieldFlowState {
  id: string;
  status: StepStatus;
}

interface YieldFlowContext {
  walletLabel: string;
  walletAddress?: string;
  depositUSDC: number;
  depositXLM: number;
  postSwapUSDC: number;
  forwardSlippageUSDC: number;
  forwardBridgeFeeUSDC: number;
  mintedUSDC: number;
  interestUSDC: number;
  withdrawUSDC: number;
  returnBridgeFeeUSDC: number;
  returnSlippageUSDC: number;
  exitFeeUSDC: number;
  finalUSDC: number;
  finalXLM: number;
  netUSDCChange: number;
  netXLMChange: number;
  apy: number;
  attestationMinutes: number;
}

interface YieldFlowDescriptor {
  id: string;
  duration: number;
  icon: LucideIcon;
  title: (ctx: YieldFlowContext) => string;
  description: (ctx: YieldFlowContext) => string;
  highlight?: (ctx: YieldFlowContext) => string | null;
}

const formatCurrency = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);

const formatToken = (value: number, symbol: string, maximumFractionDigits = 2) =>
  `${value.toLocaleString("en-US", {
    minimumFractionDigits: value >= 1 ? 0 : Math.min(4, maximumFractionDigits),
    maximumFractionDigits,
  })} ${symbol}`;

const formatCurrencyDelta = (value: number, maximumFractionDigits = 2) => {
  const absolute = formatCurrency(Math.abs(value), maximumFractionDigits);
  return `${value >= 0 ? "+" : "-"}${absolute}`;
};

const formatPercent = (value: number, maximumFractionDigits = 2) =>
  `${(value * 100).toFixed(maximumFractionDigits)}%`;

const FLOW_BLUEPRINT: readonly YieldFlowDescriptor[] = [
  {
    id: "analyze",
    duration: 1200,
    icon: Search,
    title: () => "Routing Intelligence",
    description: ctx =>
      `Scanning Stellar order books for ${formatCurrency(ctx.depositUSDC)} funding from ${ctx.walletLabel}.`,
    highlight: ctx =>
      `Slippage guard set at ${formatCurrency(ctx.forwardSlippageUSDC, 2)} to protect execution`,
  },
  {
    id: "swap",
    duration: 1600,
    icon: Repeat2,
    title: () => "Swap XLM → USDC",
    description: ctx =>
      `Executing swap for ${formatToken(ctx.depositXLM, "XLM", 2)} with minimum ${formatCurrency(ctx.postSwapUSDC)} out.`,
    highlight: ctx =>
      `Forward bridge fee ${formatCurrency(ctx.forwardBridgeFeeUSDC, 2)} applied post-swap`,
  },
  {
    id: "burn-stellar",
    duration: 1500,
    icon: Flame,
    title: () => "Burn on Stellar",
    description: ctx =>
      `Retiring ${formatCurrency(ctx.postSwapUSDC)} on Stellar to initiate Circle CCTP message.`,
  },
  {
    id: "attestation-forward",
    duration: 1800,
    icon: Timer,
    title: () => "Circle Attestation",
    description: ctx =>
      `Waiting ~${ctx.attestationMinutes} minutes for attestation signature (fast-forwarded in demo).`,
  },
  {
    id: "mint-ethereum",
    duration: 1500,
    icon: Coins,
    title: () => "Mint on Ethereum",
    description: ctx =>
      `Claiming ${formatCurrency(ctx.mintedUSDC)} USDC on Sepolia for ${ctx.walletLabel}.`,
  },
  {
    id: "supply-aave",
    duration: 1500,
    icon: PiggyBank,
    title: () => "Supply to Aave V3",
    description: ctx =>
      `Supplying ${formatCurrency(ctx.mintedUSDC)} into Aave to start earning ${formatPercent(ctx.apy)} APY.`,
  },
  {
    id: "yield-sim",
    duration: 1700,
    icon: Sparkles,
    title: () => "Simulate 30 Days",
    description: ctx =>
      `Projecting 30 days of yield at ${formatPercent(ctx.apy)} based on current on-chain rates.`,
    highlight: ctx =>
      `Projected interest: ${formatCurrency(ctx.interestUSDC, 2)} USDC`,
  },
  {
    id: "withdraw-aave",
    duration: 1500,
    icon: Wallet,
    title: () => "Withdraw with Yield",
    description: ctx =>
      `Withdrawing ${formatCurrency(ctx.withdrawUSDC)} (principal + interest) back to the bridge layer.`,
  },
  {
    id: "burn-eth",
    duration: 1500,
    icon: Flame,
    title: () => "Burn on Ethereum",
    description: ctx =>
      `Burning ${formatCurrency(ctx.withdrawUSDC)} on Ethereum to send value back to Stellar.`,
  },
  {
    id: "attestation-return",
    duration: 1800,
    icon: BadgeCheck,
    title: () => "Return Attestation",
    description: ctx =>
      `Circle confirms availability for ${formatCurrency(ctx.finalUSDC)} to mint on Stellar.`,
  },
  {
    id: "swap-back",
    duration: 1600,
    icon: ArrowLeftRight,
    title: () => "Swap USDC → XLM",
    description: ctx =>
      `Finishing cycle: swapping ${formatCurrency(ctx.finalUSDC)} back to ${formatToken(ctx.finalXLM, "XLM", 2)}.`,
    highlight: ctx =>
      `Net change: ${formatCurrencyDelta(ctx.netUSDCChange, 2)} (${formatToken(ctx.netXLMChange, "XLM", 2)})`,
  },
];

const FLOW_STEP_IDS = FLOW_BLUEPRINT.map(step => step.id);

const buildInitialFlowState = (): YieldFlowState[] =>
  FLOW_STEP_IDS.map((id, index) => ({
    id,
    status: index === 0 ? "active" : "pending",
  }));

const buildInitialSteps = (): Step[] => [
  { id: "amount", label: "Enter an Amount", status: "active" },
  { id: "approve", label: "Approve", status: "pending" },
  { id: "deposit", label: "Deposit", status: "pending" },
];

export default function DepositDialog({ open, onOpenChange }: DepositDialogProps) {
  const { wallets } = useWallets();
  const { authenticated } = usePrivy();
  const [depositAmount, setDepositAmount] = useState(MOCK_DATA.minDeposit.toString());
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>(buildInitialSteps);
  const [flowSteps, setFlowSteps] = useState<YieldFlowState[]>(buildInitialFlowState);
  const [flowStatus, setFlowStatus] = useState<"idle" | "running" | "completed">("idle");
  const timersRef = useRef<number[]>([]);

  const totalFlowDuration = useMemo(
    () => FLOW_BLUEPRINT.reduce((acc, step) => acc + step.duration, 0),
    []
  );

  const connectedWallet = wallets && wallets.length > 0 ? wallets[0] : undefined;
  const walletAddress = connectedWallet?.address;
  const walletLabel = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : authenticated
    ? "Connected Wallet"
    : "Demo Wallet";
  const {
    balance: walletBalance,
    balanceFormatted: walletBalanceFormatted,
    isLoading: isWalletBalanceLoading,
  } = useWalletBalance(walletAddress);
  const { price: ethPrice } = useEthPrice();
  const walletBalanceEth = Number.parseFloat(walletBalance);
  const walletBalanceUsd =
    Number.isFinite(walletBalanceEth) && Number.isFinite(ethPrice)
      ? (walletBalanceEth * ethPrice).toFixed(2)
      : "0.00";
  const walletBalanceLabel = connectedWallet
    ? isWalletBalanceLoading
      ? "Loading…"
      : `${walletBalanceFormatted} ETH (Sepolia • ≈ $${walletBalanceUsd})`
    : "Connect a wallet to view balance";

  const parsedDeposit = parseFloat(depositAmount || "0");
  const depositUSDC = Number.isFinite(parsedDeposit) && parsedDeposit > 0 ? parsedDeposit : MOCK_DATA.minDeposit;

  const apy = 0.0345;
  const estimatedXlmUsd = 0.11;
  const forwardSlippageBps = 5; // 0.05%
  const returnSlippageBps = 5; // 0.05%
  const bridgeFeeBps = 2; // 0.02%
  const returnBridgeFeeBps = 2; // 0.02%
  const attestationMinutes = 12;

  const depositXLM = depositUSDC / estimatedXlmUsd;
  const forwardSlippageUSDC = (depositUSDC * forwardSlippageBps) / 10_000;
  const postSwapUSDC = depositUSDC - forwardSlippageUSDC;
  const forwardBridgeFeeUSDC = (postSwapUSDC * bridgeFeeBps) / 10_000;
  const mintedUSDC = postSwapUSDC - forwardBridgeFeeUSDC;
  const interestUSDC = mintedUSDC * apy * (30 / 365);
  const withdrawUSDC = mintedUSDC + interestUSDC;
  const returnBridgeFeeUSDC = (withdrawUSDC * returnBridgeFeeBps) / 10_000;
  const returnSlippageUSDC = (withdrawUSDC * returnSlippageBps) / 10_000;
  const exitFeeUSDC = (withdrawUSDC * MOCK_DATA.exitFee) / 100;
  const finalUSDC = withdrawUSDC - returnBridgeFeeUSDC - returnSlippageUSDC - exitFeeUSDC;
  const finalXLM = finalUSDC / estimatedXlmUsd;
  const netUSDCChange = finalUSDC - depositUSDC;
  const netXLMChange = finalXLM - depositXLM;

  const flowContext: YieldFlowContext = useMemo(
    () => ({
      walletLabel,
      walletAddress,
      depositUSDC,
      depositXLM,
      postSwapUSDC,
      forwardSlippageUSDC,
      forwardBridgeFeeUSDC,
      mintedUSDC,
      interestUSDC,
      withdrawUSDC,
      returnBridgeFeeUSDC,
      returnSlippageUSDC,
      exitFeeUSDC,
      finalUSDC,
      finalXLM,
      netUSDCChange,
      netXLMChange,
      apy,
      attestationMinutes,
    }),
    [
      walletLabel,
      walletAddress,
      depositUSDC,
      depositXLM,
      postSwapUSDC,
      forwardSlippageUSDC,
      forwardBridgeFeeUSDC,
      mintedUSDC,
      interestUSDC,
      withdrawUSDC,
      returnBridgeFeeUSDC,
      returnSlippageUSDC,
      exitFeeUSDC,
      finalUSDC,
      finalXLM,
      netUSDCChange,
      netXLMChange,
      apy,
      attestationMinutes,
    ]
  );

  const handleMaxClick = () => {
    if (!connectedWallet) {
      setDepositAmount(MOCK_DATA.minDeposit.toString());
      return;
    }

    const maxUsd = Number.parseFloat(walletBalanceUsd);
    if (!Number.isFinite(maxUsd) || maxUsd <= 0) {
      setDepositAmount(MOCK_DATA.minDeposit.toString());
      return;
    }

    setDepositAmount(maxUsd.toFixed(2));
  };

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDepositAmount(value);
    }
  };

  const clearFlowTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  }, []);

  const startYieldFlow = useCallback(() => {
    clearFlowTimers();
    setFlowSteps(buildInitialFlowState());
    setFlowStatus("running");

    let cumulativeDelay = 0;

    FLOW_BLUEPRINT.forEach((_, index) => {
      if (index === 0) return;
      cumulativeDelay += FLOW_BLUEPRINT[index - 1].duration;

      const timer = window.setTimeout(() => {
        setFlowSteps(prev =>
          prev.map((step, stepIndex) => {
            if (stepIndex < index) {
              return { ...step, status: "completed" };
            }
            if (stepIndex === index) {
              return { ...step, status: "active" };
            }
            return { ...step, status: "pending" };
          })
        );
      }, cumulativeDelay);

      timersRef.current.push(timer);
    });

    const finalizeTimer = window.setTimeout(() => {
      setFlowSteps(prev => prev.map(step => ({ ...step, status: "completed" })));
      setFlowStatus("completed");
    }, totalFlowDuration);

    timersRef.current.push(finalizeTimer);
  }, [clearFlowTimers, totalFlowDuration]);

  const resetFlowState = useCallback(() => {
    clearFlowTimers();
    setFlowSteps(buildInitialFlowState());
    setFlowStatus("idle");
    setSteps(buildInitialSteps());
    setCurrentStep(0);
  }, [clearFlowTimers]);

  const handlePrimaryAction = () => {
    if (currentStep < steps.length - 1) {
      setSteps(prev => {
        const next = [...prev];
        next[currentStep] = { ...next[currentStep], status: "completed" };
        next[currentStep + 1] = { ...next[currentStep + 1], status: "active" };
        return next;
      });
      setCurrentStep(currentStep + 1);
      return;
    }

    setSteps(prev =>
      prev.map((step, index) =>
        index <= currentStep ? { ...step, status: "completed" } : step,
      ),
    );

    if (flowStatus === "running") return;
    startYieldFlow();
  };

  useEffect(() => {
    if (!open) {
      resetFlowState();
    }
    return () => {
      clearFlowTimers();
    };
  }, [open, clearFlowTimers, resetFlowState]);

  const receiptTokenAmount = depositAmount
    ? (parseFloat(depositAmount) * parseFloat(MOCK_DATA.exchangeRate)).toFixed(4)
    : "0";

  const isDepositValid = depositAmount && parseFloat(depositAmount) >= MOCK_DATA.minDeposit;
  const isPrimaryActionDisabled =
    !isDepositValid ||
    (currentStep === steps.length - 1 && flowStatus === "running");

  const primaryActionLabel =
    currentStep < steps.length - 1
      ? steps[currentStep].label
      : flowStatus === "running"
      ? "Running Yield Simulation..."
      : flowStatus === "completed"
      ? "Replay Yield Simulation"
      : "Start Yield Simulation";

  const displaySteps = useMemo(() => {
    const stateById = new Map(flowSteps.map(step => [step.id, step.status]));
    return FLOW_BLUEPRINT.map(descriptor => {
      const status = stateById.get(descriptor.id) ?? "pending";
      return {
        id: descriptor.id,
        status,
        icon: descriptor.icon,
        title: descriptor.title(flowContext),
        description: descriptor.description(flowContext),
        highlight: descriptor.highlight?.(flowContext) ?? null,
      };
    });
  }, [flowSteps, flowContext]);

  const completedFlowSteps = displaySteps.filter(step => step.status === "completed").length;
  const activeFlowStep = displaySteps.find(step => step.status === "active");
  const activeIndex = displaySteps.findIndex(step => step.status === "active");
  const flowProgress = Math.min(
    100,
    displaySteps.length ? (completedFlowSteps / displaySteps.length) * 100 : 0
  );
  const displayStepNumber = activeIndex >= 0 ? activeIndex + 1 : displaySteps.length;
  const ActiveIcon = activeFlowStep?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-max p-0 bg-gray-900 border-gray-800"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-800">
          <DialogTitle className="text-xl font-semibold text-white">
            Deposit Into USCC Yield Layer
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex min-h-0">
          {/* Left Panel - Information */}
          <div className="space-y-6 p-8 border-r border-gray-800 w-[340px] lg:w-[380px] flex-shrink-0">
            {/* Fee Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Performance Fee</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Fee charged on profits</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-white text-sm font-medium">{MOCK_DATA.performanceFee}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Exit Fee</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Fee charged on withdrawal</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-white text-sm font-medium">
                  <s className="text-gray-500">0</s> {MOCK_DATA.exitFee}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Min Deposit</span>
                <span className="text-white text-sm font-medium">
                  {MOCK_DATA.minDeposit.toLocaleString()} USDC
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Est. Withdrawal Waiting</span>
                <span className="text-white text-sm font-medium">{MOCK_DATA.withdrawalWaiting}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Withdraw Token</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-[10px] text-blue-400 font-bold">$</span>
                  </div>
                  <span className="text-white text-sm font-medium">{MOCK_DATA.withdrawToken}</span>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="pt-6 border-t border-gray-800">
              <h3 className="text-white text-sm font-medium mb-2">Support</h3>
              <p className="text-gray-400 text-xs mb-2">
                If there are any needs, feel free to contact us on{" "}
                <a href={MOCK_DATA.supportLinks.discord} className="text-blue-400 hover:text-blue-300">
                  Discord
                </a>{" "}
                or{" "}
                <a href={MOCK_DATA.supportLinks.telegram} className="text-blue-400 hover:text-blue-300">
                  Telegram
                </a>
                .
              </p>
            </div>
          </div>

          {/* Right Panel - Deposit Form */}
          <div className="space-y-4 p-6 flex-1 min-w-0">
            {/* Yield Flow Visualizer - Only show when simulation is running */}
            {flowStatus === "running" && (
              <div className="max-w-[520px]">
                <div className="rounded-2xl border border-gray-700/80 bg-gray-800/40 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.25)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-blue-400">Smart Routing</p>
                      <h3 className="text-lg font-semibold text-white">Yield Flow Projection</h3>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      Step {displayStepNumber} / {displaySteps.length}
                    </div>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-gray-700/70">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 transition-all duration-500"
                      style={{ width: `${Math.max(flowProgress, flowProgress > 0 ? 10 : 6)}%` }}
                    />
                  </div>

                  {activeFlowStep && ActiveIcon && (
                    <div className="mt-4 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/20">
                          <ActiveIcon className="h-5 w-5 text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{activeFlowStep.title}</p>
                          <p className="text-xs text-blue-100/80">{activeFlowStep.description}</p>
                        </div>
                      </div>
                      {activeFlowStep.highlight && (
                        <p className="mt-3 text-[11px] font-medium text-blue-200/90">
                          {activeFlowStep.highlight}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-1">
                    {displaySteps.map(step => {
                      const Icon = step.icon;
                      const isActive = step.status === "active";
                      const isCompleted = step.status === "completed";
                      
                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-start gap-3 rounded-xl border px-3 py-2",
                            isCompleted
                              ? "border-green-500/40 bg-green-500/5"
                              : isActive
                              ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_25px_rgba(56,189,248,0.25)]"
                              : "border-gray-700/60 bg-gray-800/40"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full border",
                              isCompleted
                                ? "border-green-500/60 bg-green-500/15 text-green-400"
                                : isActive
                                ? "border-blue-500/60 bg-blue-500/25 text-blue-200"
                                : "border-gray-600/60 bg-gray-700/30 text-gray-500"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium",
                              isCompleted || isActive ? "text-white" : "text-gray-400"
                            )}>{step.title}</p>
                            <p className={cn(
                              "text-[11px]",
                              isCompleted || isActive ? "text-gray-400" : "text-gray-500"
                            )}>{step.description}</p>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-wide",
                              isCompleted
                                ? "text-green-400"
                                : isActive
                                ? "text-blue-300"
                                : "text-gray-600"
                            )}
                          >
                            {isCompleted ? "Done" : isActive ? "Now" : "Queued"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-[11px] text-gray-500">
                    Route stitched: Stellar DEX → Circle CCTP → Ethereum Sepolia → Aave V3 → Return • Projected net {formatCurrencyDelta(flowContext.netUSDCChange, 2)}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div className="relative mb-4 max-w-[480px]">
              <div className="flex items-start justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all bg-gray-900 relative z-10",
                          step.status === "completed"
                            ? "border-green-500"
                            : step.status === "active"
                            ? "border-blue-500"
                            : "border-gray-600"
                        )}
                      >
                        {step.status === "completed" ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : step.status === "active" && index === 0 && !depositAmount ? (
                          <Spinner className="w-5 h-5 text-blue-500" />
                        ) : (
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              step.status === "active" ? "bg-blue-500" : "bg-gray-600"
                            )}
                          />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs mt-2 whitespace-nowrap",
                          step.status === "active" ? "text-gray-300" : "text-gray-500"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div className="flex-1 mt-5 mx-4">
                        <div
                          className={cn(
                            "h-0.5 transition-all duration-500",
                            index < currentStep ? "bg-green-500" : "bg-gray-700"
                          )}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Deposit Input */}
            <div className="space-y-2 max-w-[480px]">
              <label className="text-gray-400 text-sm flex items-center justify-between">
                <span>Enter to Deposit</span>
                <span className="text-[11px] uppercase tracking-wide text-blue-400">Smart Routing</span>
              </label>
              <div className="relative">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between min-h-[64px]">
                  <input
                    type="text"
                    value={depositAmount}
                    onChange={handleDepositChange}
                    placeholder="0"
                    className="bg-transparent text-white text-2xl placeholder-gray-600 focus:outline-none flex-1 min-w-0"
                  />
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-[10px] text-blue-400 font-bold">$</span>
                      </div>
                      <span className="text-white text-sm">USDC</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={handleMaxClick}
                      className="px-3 py-1.5 text-yellow-400 text-sm font-medium hover:text-yellow-300 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Smart Routing Preview - Inline */}
              {depositAmount && parseFloat(depositAmount) > 0 && (
                <div className="mt-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">Route</span>
                    <span className="text-blue-300 font-mono text-[9px]">Stellar → CCTP → ETH → Aave</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <div className="bg-white/5 rounded px-1.5 py-1">
                      <div className="text-gray-500 text-[9px]">Bridge Fee</div>
                      <div className="text-white text-[11px] font-medium">{formatCurrency(forwardBridgeFeeUSDC + returnBridgeFeeUSDC, 2)}</div>
                    </div>
                    <div className="bg-white/5 rounded px-1.5 py-1">
                      <div className="text-gray-500 text-[9px]">Slippage</div>
                      <div className="text-white text-[11px] font-medium">{formatCurrency(forwardSlippageUSDC + returnSlippageUSDC, 2)}</div>
                    </div>
                    <div className="bg-emerald-500/10 rounded px-1.5 py-1">
                      <div className="text-gray-500 text-[9px]">30d Yield</div>
                      <div className="text-emerald-300 text-[11px] font-medium">{formatCurrency(interestUSDC, 2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-gray-400 text-[10px]">Net Return</span>
                    <span className={cn(
                      "text-xs font-semibold",
                      netUSDCChange >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {formatCurrencyDelta(netUSDCChange, 2)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <span className="text-gray-500 text-xs">
                  Balance: {walletBalanceLabel}
                </span>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-start py-2 max-w-[480px]">
              <svg className="w-4 h-4 text-gray-600 ml-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Receipt Token */}
            <div className="space-y-2 max-w-[480px]">
              <label className="text-gray-400 text-sm flex items-center justify-between">
                <span>Receipt Token</span>
                {depositAmount && parseFloat(depositAmount) > 0 && (
                  <span className="text-[11px] text-emerald-400">
                    APY {formatPercent(apy)}
                  </span>
                )}
              </label>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between min-h-[64px]">
                <span className="text-white text-2xl flex-1 min-w-0 truncate">
                  {receiptTokenAmount}
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/30 rounded-lg ml-4 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-[10px] text-black font-bold">Y</span>
                  </div>
                  <span className="text-white text-sm font-medium">yUSDC_USDC</span>
                </div>
              </div>
              
              {/* Smart Routing Output Preview */}
              {depositAmount && parseFloat(depositAmount) > 0 && (
                <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-white/5 rounded px-1.5 py-1">
                      <div className="text-gray-500 text-[9px]">You Supply</div>
                      <div className="text-white text-[11px] font-medium">{formatCurrency(mintedUSDC, 2)}</div>
                    </div>
                    <div className="bg-white/5 rounded px-1.5 py-1">
                      <div className="text-gray-500 text-[9px]">Interest (30d)</div>
                      <div className="text-emerald-300 text-[11px] font-medium">+{formatCurrency(interestUSDC, 2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-gray-400 text-[10px]">Total Est.</span>
                    <span className="text-emerald-400 text-xs font-semibold">
                      {formatCurrency(withdrawUSDC, 2)}
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-500 text-center">
                    Aave V3 • Auto-compound
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <span className="text-gray-500 text-xs">
                  Balance: {walletBalanceLabel}
                </span>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="flex justify-between items-center text-xs max-w-[480px]">
              <span className="text-gray-400">Exchange Rate:</span>
              <span className="text-white">
                1 USDC = {MOCK_DATA.exchangeRate} yUSDC_USDC
              </span>
            </div>

            {/* Action Button */}
            <div className="max-w-[480px]">
              <Button
                onClick={handlePrimaryAction}
                disabled={isPrimaryActionDisabled}
                className={cn(
                  "w-full py-3 text-sm font-medium transition-all",
                  isPrimaryActionDisabled
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : currentStep === 0
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                )}
              >
                {primaryActionLabel}
              </Button>
            </div>
            {/* Min Deposit Warning */}
            {depositAmount && parseFloat(depositAmount) < MOCK_DATA.minDeposit && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-[520px]">
                <p className="text-red-400 text-xs">
                  Minimum deposit amount is {MOCK_DATA.minDeposit.toLocaleString()} USDC
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
