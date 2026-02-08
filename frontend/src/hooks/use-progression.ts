import { useQuery } from "@tanstack/react-query";
import { getProgression, getCoinTransactions } from "@/services/progression";
import type { UserProgression, CoinTransaction } from "@/types";

export function useProgression() {
  return useQuery<UserProgression>({
    queryKey: ["progression"],
    queryFn: getProgression,
  });
}

export function useCoinTransactions(limit = 20, offset = 0) {
  return useQuery<CoinTransaction[]>({
    queryKey: ["coin-transactions", limit, offset],
    queryFn: () => getCoinTransactions(limit, offset),
  });
}
