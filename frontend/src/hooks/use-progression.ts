import { useQuery } from "@tanstack/react-query";
import { getProgression, getCoinTransactions } from "@/services/progression";
import type { UserProgression, CoinTransactionListResponse } from "@/types";

export function useProgression() {
  return useQuery<UserProgression>({
    queryKey: ["progression"],
    queryFn: getProgression,
  });
}

export function useCoinTransactions(limit = 20, offset = 0) {
  return useQuery<CoinTransactionListResponse>({
    queryKey: ["coin-transactions", limit, offset],
    queryFn: () => getCoinTransactions(limit, offset),
  });
}
