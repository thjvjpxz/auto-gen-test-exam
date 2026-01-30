import { api } from "./api";
import type {
  ExamGenerateRequest,
  GenerationTaskResponse,
  GenerationStatusResponse,
  ExamOut,
  ExamListResponse,
  ExamListParams,
} from "@/types";

const EXAM_API_BASE = "/v1/exams";

/**
 * Exam API Service
 * Handles all exam-related API calls following FRONTEND_INTEGRATION_GUIDE.md
 */
export const examService = {
  /**
   * Generate a new exam using AI (Admin only)
   * Returns task_id for polling status
   */
  async generateExam(data: ExamGenerateRequest): Promise<GenerationTaskResponse> {
    const response = await api.post<GenerationTaskResponse>(
      `${EXAM_API_BASE}/generate`,
      data
    );
    return response.data;
  },

  /**
   * Check generation task status
   * Poll this endpoint every 2s until status !== "pending"
   */
  async getGenerationStatus(taskId: string): Promise<GenerationStatusResponse> {
    const response = await api.get<GenerationStatusResponse>(
      `${EXAM_API_BASE}/generation-status/${taskId}`
    );
    return response.data;
  },

  /**
   * Get single exam by ID
   */
  async getExam(examId: number): Promise<ExamOut> {
    const response = await api.get<ExamOut>(`${EXAM_API_BASE}/${examId}`);
    return response.data;
  },

  /**
   * List exams with pagination and filters
   * Non-admin users only see published exams
   */
  async listExams(params: ExamListParams = {}): Promise<ExamListResponse> {
    const response = await api.get<ExamListResponse>(EXAM_API_BASE, { params });
    return response.data;
  },

  /**
   * Publish an exam (Admin only)
   */
  async publishExam(examId: number): Promise<ExamOut> {
    const response = await api.patch<ExamOut>(`${EXAM_API_BASE}/${examId}`, {
      is_published: true,
    });
    return response.data;
  },

  /**
   * Unpublish an exam (Admin only)
   */
  async unpublishExam(examId: number): Promise<ExamOut> {
    const response = await api.patch<ExamOut>(`${EXAM_API_BASE}/${examId}`, {
      is_published: false,
    });
    return response.data;
  },

  /**
   * Delete an exam (Admin only)
   */
  async deleteExam(examId: number): Promise<void> {
    await api.delete(`${EXAM_API_BASE}/${examId}`);
  },
};

export default examService;
