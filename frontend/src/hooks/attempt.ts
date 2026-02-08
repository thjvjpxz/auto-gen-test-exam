import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attemptService } from "@/services/attempt";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import type { AnswersPayload, ViolationRequest } from "@/types";

/**
 * Starts exam and initializes attempt store.
 */
export function useStartExam() {
  const initAttempt = useExamAttemptStore((s) => s.initAttempt);

  return useMutation({
    mutationFn: (examId: number) => attemptService.startExam(examId),
    onSuccess: (data, examId) => {
      initAttempt({
        attemptId: data.attempt_id,
        examId,
        examData: data.exam_data,
        startedAt: data.started_at,
        duration: data.duration,
      });
    },
  });
}

/**
 * Submits exam and triggers AI grading.
 */
export function useSubmitExam() {
  const queryClient = useQueryClient();
  const reset = useExamAttemptStore((s) => s.reset);

  return useMutation({
    mutationFn: ({
      attemptId,
      answers,
    }: {
      attemptId: number;
      answers: AnswersPayload;
    }) => attemptService.submitExam(attemptId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attempts"] });
      reset();
    },
  });
}

/**
 * Gets result for submitted attempt.
 */
export function useExamResult(attemptId: number | null) {
  return useQuery({
    queryKey: ["attempt-result", attemptId],
    queryFn: () => attemptService.getResult(attemptId!),
    enabled: attemptId !== null,
  });
}

/**
 * Logs violation (fire-and-forget pattern).
 */
export function useLogViolation() {
  const updateTrustScore = useExamAttemptStore((s) => s.updateTrustScore);

  return useMutation({
    mutationFn: ({
      attemptId,
      violation,
    }: {
      attemptId: number;
      violation: ViolationRequest;
    }) => attemptService.logViolation(attemptId, violation),
    onSuccess: (data) => {
      updateTrustScore(data.trust_score, data.warning_level);
    },
  });
}

/**
 * Gets current user's attempt history.
 */
export function useMyAttempts() {
  return useQuery({
    queryKey: ["my-attempts"],
    queryFn: () => attemptService.getMyAttempts(),
    staleTime: 5 * 60 * 1000,
  });
}
