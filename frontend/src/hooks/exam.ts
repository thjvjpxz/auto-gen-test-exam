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

/**
 * Hook for exam generation with polling
 * Handles the async generation flow: start -> poll -> complete/fail
 */
export function useExamGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollCountRef = useRef(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startGeneration = useCallback(
    async (data: ExamGenerateFormData) => {
      try {
        setIsGenerating(true);
        setError(null);
        setStatus(null);
        pollCountRef.current = 0;

        const request: ExamGenerateRequest = {
          exam_type: data.exam_type,
          duration: data.duration,
          passing_score: data.passing_score,
          subject: data.subject || null,
        };

        const result = await examService.generateExam(request);
        setTaskId(result.task_id);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể bắt đầu sinh đề";
        setError(errorMessage);
        setIsGenerating(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!taskId) return;

    const pollStatus = async () => {
      try {
        pollCountRef.current += 1;

        if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
          setError("Quá thời gian chờ. Vui lòng thử lại.");
          setIsGenerating(false);
          stopPolling();
          return;
        }

        const statusData = await examService.getGenerationStatus(taskId);
        setStatus(statusData);

        if (statusData.status !== "pending") {
          setIsGenerating(false);
          stopPolling();

          if (statusData.status === "failed") {
            setError(statusData.error || "Đã xảy ra lỗi khi sinh đề");
          }
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể kiểm tra trạng thái";
        setError(errorMessage);
        setIsGenerating(false);
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
    pollCountRef.current = 0;
  }, [stopPolling]);

  return {
    isGenerating,
    status,
    error,
    progress: status?.progress ?? 0,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
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
