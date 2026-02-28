import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam";
import type {
  ExamGenerateRequest,
  ExamGenerateFormData,
  GenerationStatusResponse,
  ExamListParams,
  ExamOut,
  ExamListResponse,
} from "@/types";

const POLL_INTERVAL = 2000;
const MAX_POLL_ATTEMPTS = 60;
const SMOOTH_PROGRESS_INTERVAL = 800;
const SMOOTH_PROGRESS_MAX = 65;

/**
 * Hook for exam generation with polling
 * Handles the async generation flow: start -> poll -> complete/fail
 * Includes smooth progress simulation for better UX
 */
export function useExamGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const pollCountRef = useRef(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const smoothProgressRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (smoothProgressRef.current) {
      clearInterval(smoothProgressRef.current);
      smoothProgressRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  const realProgress = status?.progress ?? 0;

  useEffect(() => {
    if (realProgress > displayProgress) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setDisplayProgress(realProgress);
        }
      }, 0);
      return () => clearTimeout(timer);
    }

    if (realProgress === 20 && displayProgress < SMOOTH_PROGRESS_MAX) {
      smoothProgressRef.current = setInterval(() => {
        if (!isMountedRef.current) return;
        setDisplayProgress((prev) => {
          if (prev >= SMOOTH_PROGRESS_MAX) {
            if (smoothProgressRef.current) {
              clearInterval(smoothProgressRef.current);
              smoothProgressRef.current = null;
            }
            return prev;
          }
          return Math.min(
            prev + Math.floor(Math.random() * 4) + 2,
            SMOOTH_PROGRESS_MAX,
          );
        });
      }, SMOOTH_PROGRESS_INTERVAL);
    }

    return () => {
      if (smoothProgressRef.current) {
        clearInterval(smoothProgressRef.current);
        smoothProgressRef.current = null;
      }
    };
  }, [realProgress, displayProgress]);

  const startGeneration = useCallback(async (data: ExamGenerateFormData) => {
    try {
      setIsGenerating(true);
      setError(null);
      setStatus(null);
      setDisplayProgress(0);
      pollCountRef.current = 0;

      const request: ExamGenerateRequest = {
        exam_type: data.exam_type,
        duration: data.duration,
        passing_score: data.passing_score,
        subject: data.subject || null,
      };

      const result = await examService.generateExam(request);
      if (isMountedRef.current) {
        setTaskId(result.task_id);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể bắt đầu sinh đề";
        setError(errorMessage);
        setIsGenerating(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!taskId) return;

    const pollStatus = async () => {
      if (!isMountedRef.current) return;

      try {
        pollCountRef.current += 1;

        if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
          if (isMountedRef.current) {
            setError("Quá thời gian chờ. Vui lòng thử lại.");
            setIsGenerating(false);
          }
          stopPolling();
          return;
        }

        const statusData = await examService.getGenerationStatus(taskId);

        if (!isMountedRef.current) return;

        setStatus(statusData);

        if (statusData.status !== "pending") {
          setIsGenerating(false);
          stopPolling();

          if (statusData.status === "failed") {
            setError(statusData.error || "Đã xảy ra lỗi khi sinh đề");
          }
        }
      } catch (err: unknown) {
        if (isMountedRef.current) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Không thể kiểm tra trạng thái";
          setError(errorMessage);
          setIsGenerating(false);
        }
        stopPolling();
      }
    };

    pollStatus();
    pollIntervalRef.current = setInterval(pollStatus, POLL_INTERVAL);

    return () => stopPolling();
  }, [taskId, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setIsGenerating(false);
    setTaskId(null);
    setStatus(null);
    setError(null);
    setDisplayProgress(0);
    pollCountRef.current = 0;
  }, [stopPolling]);

  return {
    isGenerating,
    status,
    error,
    progress: displayProgress,
    examId: status?.exam_id,
    exam: status?.exam,
    isCompleted: status?.status === "completed",
    isFailed: status?.status === "failed",
    startGeneration,
    reset,
  };
}

/**
 * Hook for fetching exam list with pagination and filters
 */
export function useExams(params: ExamListParams = {}) {
  return useQuery<ExamListResponse>({
    queryKey: ["exams", params],
    queryFn: () => examService.listExams(params),
  });
}

/**
 * Hook for fetching single exam
 */
export function useExam(examId: number | null) {
  return useQuery<ExamOut>({
    queryKey: ["exam", examId],
    queryFn: () => examService.getExam(examId!),
    enabled: examId !== null,
  });
}

/**
 * Hook for publishing exam
 */
export function usePublishExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: number) => examService.publishExam(examId),
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
  });
}

/**
 * Hook for unpublishing exam
 */
export function useUnpublishExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: number) => examService.unpublishExam(examId),
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
  });
}

/**
 * Hook for deleting exam
 */
export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: number) => examService.deleteExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

/**
 * Hook for updating exam (including settings)
 */
export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examId,
      data,
    }: {
      examId: number;
      data: import("@/types").ExamUpdateData;
    }) => examService.updateExam(examId, data),
    onSuccess: (_, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
  });
}

/**
 * Hook for regenerating hints with polling
 */
export function useRegenerateHints() {
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regenerate = useCallback(
    async (examId: number) => {
      try {
        setIsRegenerating(true);
        setError(null);

        const { task_id } = await examService.regenerateHints(examId);

        // Poll until completion
        let attempts = 0;
        const poll = async (): Promise<void> => {
          attempts++;
          if (attempts > MAX_POLL_ATTEMPTS) {
            throw new Error("Quá thời gian chờ gen lại hints");
          }

          const status = await examService.getGenerationStatus(task_id);

          if (status.status === "completed") {
            queryClient.invalidateQueries({ queryKey: ["exam", examId] });
            return;
          }

          if (status.status === "failed") {
            throw new Error(status.error || "Lỗi khi gen lại hints");
          }

          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
          return poll();
        };

        await poll();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Không thể gen lại hints";
        setError(msg);
        throw err;
      } finally {
        setIsRegenerating(false);
      }
    },
    [queryClient],
  );

  return { regenerate, isRegenerating, error };
}
