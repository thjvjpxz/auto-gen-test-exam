import { useQuery } from "@tanstack/react-query";
import { getHintCatalog, getPurchasedHints } from "@/services/hint";
import type { HintCatalogItem, PurchasedHint } from "@/types";

export function useHintCatalog(examId: number | null) {
  return useQuery<Record<string, HintCatalogItem[]>>({
    queryKey: ["hint-catalog", examId],
    queryFn: () => getHintCatalog(examId!),
    enabled: examId !== null,
  });
}

export function usePurchasedHints(attemptId: number | null) {
  return useQuery<PurchasedHint[]>({
    queryKey: ["purchased-hints", attemptId],
    queryFn: () => getPurchasedHints(attemptId!),
    enabled: attemptId !== null,
  });
}
