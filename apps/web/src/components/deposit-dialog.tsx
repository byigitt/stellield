"use client";

import React, { useState } from "react";
import { X, Info, ChevronDown, Check } from "lucide-react";
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

export default function DepositDialog({ open, onOpenChange }: DepositDialogProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([
    { id: "amount", label: "Enter an Amount", status: "active" },
    { id: "approve", label: "Approve", status: "pending" },
    { id: "deposit", label: "Deposit", status: "pending" },
  ]);

  const handleMaxClick = () => {
    // Mock balance - in real app this would come from wallet
    setDepositAmount("10000");
  };

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDepositAmount(value);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      const newSteps = [...steps];
      newSteps[currentStep].status = "completed";
      newSteps[currentStep + 1].status = "active";
      setSteps(newSteps);
      setCurrentStep(currentStep + 1);
    }
  };

  const receiptTokenAmount = depositAmount
    ? (parseFloat(depositAmount) * parseFloat(MOCK_DATA.exchangeRate)).toFixed(4)
    : "0";

  const isButtonDisabled = !depositAmount || parseFloat(depositAmount) < MOCK_DATA.minDeposit;

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
          <div className="space-y-6 p-8 flex-1 min-w-0">
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
              <label className="text-gray-400 text-sm">Enter to Deposit</label>
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
              <div className="flex justify-end">
                <span className="text-gray-500 text-xs">Balance: 0</span>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-start py-3 max-w-[480px]">
              <svg className="w-5 h-5 text-gray-600 ml-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Receipt Token */}
            <div className="space-y-2 max-w-[480px]">
              <label className="text-gray-400 text-sm">Receipt Token</label>
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
              <div className="flex justify-end">
                <span className="text-gray-500 text-xs">Balance: 0</span>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="flex justify-between items-center text-sm max-w-[480px]">
              <span className="text-gray-400">Exchange Rate:</span>
              <span className="text-white">
                1 USDC = {MOCK_DATA.exchangeRate} yUSDC_USDC
              </span>
            </div>

            {/* Action Button */}
            <div className="max-w-[480px]">
              <Button
                onClick={handleNextStep}
                disabled={isButtonDisabled}
                className={cn(
                  "w-full py-5 text-base font-medium transition-all",
                  isButtonDisabled
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : currentStep === 0
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                )}
              >
                {currentStep === 0 ? "Enter an Amount" : steps[currentStep].label}
              </Button>
            </div>

            {/* Min Deposit Warning */}
            {depositAmount && parseFloat(depositAmount) < MOCK_DATA.minDeposit && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg max-w-[480px]">
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