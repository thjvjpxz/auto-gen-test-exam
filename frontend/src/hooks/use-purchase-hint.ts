import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseHint } from "@/services/hint";
import type { HintPurchaseRequest, HintPurchaseResponse } from "@/types";

export function usePurchaseHint() {
  const queryClient = useQueryClient();

  return useMutation<
    HintPurchaseResponse,
    Error,
    { attemptId: number; request: HintPurchaseRequest }
  >({
    mutationFn: ({ attemptId, request }) => purchaseHint(attemptId, request),
    onSuccess: (_, { attemptId }) => {
      queryClient.invalidateQueries({
        queryKey: ["purchased-hints", attemptId],
      });
      queryClient.invalidateQueries({ queryKey: ["hint-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["progression"] });
    },
  });
}
