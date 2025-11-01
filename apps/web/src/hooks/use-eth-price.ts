import { useState, useEffect } from "react";

interface UseEthPriceResult {
  price: number;
  isLoading: boolean;
  error: Error | null;
}

export function useEthPrice(refreshInterval = 60000): UseEthPriceResult {
  const [price, setPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();
        setPrice(data.ethereum?.usd || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching ETH price:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch ETH price"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { price, isLoading, error };
}

