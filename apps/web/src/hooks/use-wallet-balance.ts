import { useState, useEffect } from "react";
import { createPublicClient, http, formatEther } from "viem";
import { mainnet } from "viem/chains";

interface UseWalletBalanceResult {
  balance: string;
  balanceFormatted: string;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWalletBalance(address?: string): UseWalletBalanceResult {
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) {
        setBalance("0");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const publicClient = createPublicClient({
          chain: mainnet,
          transport: http(),
        });

        const result = await publicClient.getBalance({
          address: address as `0x${string}`,
        });

        setBalance(formatEther(result));
      } catch (err) {
        console.error("Error fetching balance:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch balance"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [address, refetchTrigger]);

  const refetch = () => setRefetchTrigger((prev) => prev + 1);

  const balanceFormatted = parseFloat(balance).toFixed(4);

  return {
    balance,
    balanceFormatted,
    isLoading,
    error,
    refetch,
  };
}

