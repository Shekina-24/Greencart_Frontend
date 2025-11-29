'use client';

import { useMemo } from "react";
import useSWR from "swr";
import { getStoredTokens } from "@/lib/auth/tokens";
import { fetchOrders } from "@/lib/services/orders";
import type { Order } from "@/lib/types";

export function useOrdersData(enabled: boolean) {
  const key = useMemo(() => {
    if (!enabled) return null;
    const tokens = getStoredTokens();
    return tokens ? ["orders", tokens.accessToken] : "orders-missing-token";
  }, [enabled]);

  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    key,
    async () => {
      const tokens = getStoredTokens();
      if (!tokens) {
        throw new Error("missing-token");
      }
      const response = await fetchOrders(tokens.accessToken);
      return response.items;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: (err) => (err as Error).message !== "missing-token"
    }
  );

  return {
    orders: data ?? [],
    isLoading,
    error,
    mutate
  };
}
