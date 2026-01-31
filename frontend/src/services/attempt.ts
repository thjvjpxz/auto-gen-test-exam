import { api } from "./api";
import type {
  AttemptStartResponse,
  AttemptSaveResponse,
  ExamSubmitResponse,
  ViolationRequest,
  ViolationResponse,
  AnswersPayload,
} from "@/types";

const ATTEMPT_API_BASE = "/v1";

/**
 * API service for Exam Attempts.
 * Handles start, save, submit, result, and violation logging.
 */
export const attemptService = {
  /**
   * Starts exam - creates new attempt or returns existing in_progress.
   * @param examId - The exam ID to start.
   * @returns AttemptStartResponse with attempt_id, exam_data, and timer info.
   */
  async startExam(examId: number): Promise<AttemptStartResponse> {
    const response = await api.post<AttemptStartResponse>(
      `${ATTEMPT_API_BASE}/exams/${examId}/start`,
    );
    return response.data;
  },

  /**
   * Auto-saves answers (partial update).
   * @param attemptId - The attempt ID.
   * @param answers - Partial answers payload.
   * @returns Updated attempt state.
   */
  async saveAnswers(
    attemptId: number,
    answers: AnswersPayload,
  ): Promise<AttemptSaveResponse> {
    const response = await api.patch<AttemptSaveResponse>(
      `${ATTEMPT_API_BASE}/attempts/${attemptId}/save`,
      { answers },
    );
    return response.data;
  },

  /**
   * Submits exam and triggers AI grading.
   * @param attemptId - The attempt ID.
   * @param answers - Final answers payload.
   * @returns Full grading response.
   */
  async submitExam(
    attemptId: number,
    answers: AnswersPayload,
  ): Promise<ExamSubmitResponse> {
    const response = await api.post<ExamSubmitResponse>(
      `${ATTEMPT_API_BASE}/attempts/${attemptId}/submit`,
      { answers },
    );
    return response.data;
  },

  /**
   * Gets result for submitted attempt.
   * @param attemptId - The attempt ID.
   * @returns Full grading response.
   */
  async getResult(attemptId: number): Promise<ExamSubmitResponse> {
    const response = await api.get<ExamSubmitResponse>(
      `${ATTEMPT_API_BASE}/attempts/${attemptId}/result`,
    );
    return response.data;
  },

  /**
   * Logs violation (fire-and-forget pattern).
   * @param attemptId - The attempt ID.
   * @param violation - Violation details.
   * @returns Updated trust score and warning level.
   */
  async logViolation(
    attemptId: number,
    violation: ViolationRequest,
  ): Promise<ViolationResponse> {
    const response = await api.post<ViolationResponse>(
      `${ATTEMPT_API_BASE}/attempts/${attemptId}/violations`,
      violation,
    );
    return response.data;
  },
};

export default attemptService;
