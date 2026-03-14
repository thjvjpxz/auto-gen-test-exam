import { api } from "./api";

const ADMIN_API_BASE = "/v1/admin";

export interface AdminStatsOut {
  total_users: number;
  total_exams: number;
  total_attempts: number;
  published_exams: number;
  average_score: number | null;
  pass_rate: number | null;
}

export interface UserListOut {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar_url: string | null;
  created_at: string;
  exam_count: number;
}

export interface UserListResponse {
  items: UserListOut[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserExamHistoryItem {
  attempt_id: number;
  exam_id: number;
  exam_title: string;
  exam_type: string;
  status: string;
  score: number;
  max_score: number;
  percentage: number | null;
  passed: boolean;
  submitted_at: string | null;
}

export interface UserDetailOut {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar_url: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  total_exams_taken: number;
  average_score: number | null;
  pass_rate: number | null;
  coin_balance: number;
  recent_attempts: UserExamHistoryItem[];
}

export interface AdminCoinAdjustmentRequest {
  amount: number;
  reason: string;
}

export interface AdminCoinAdjustmentResponse {
  user_id: number;
  balance_before: number;
  balance_after: number;
  adjustment_amount: number;
  reason: string;
  adjusted_by_admin_id: number;
  adjusted_by_admin_name: string;
  adjusted_at: string;
}

export interface UserUpdateRequest {
  name?: string;
  role?: "user" | "admin";
}

export interface AdminAttemptListOut {
  id: number;
  exam_id: number;
  exam_title: string;
  exam_type: string;
  user_id: number;
  user_name: string;
  user_email: string;
  status: string;
  score: number;
  max_score: number;
  percentage: number | null;
  trust_score: number;
  passed: boolean;
  started_at: string;
  submitted_at: string | null;
  time_taken: number | null;
}

export interface AdminAttemptListResponse {
  items: AdminAttemptListOut[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminRegradeResponse {
  attempt_id: number;
  status: string;
  score: number | null;
  message: string;
}

export interface AdminBatchRegradeRequest {
  attempt_ids?: number[];
  status_filter?: string;
}

export interface AdminBatchRegradeResponse {
  success_count: number;
  failed_count: number;
  results: AdminRegradeResponse[];
}

export interface UserListParams {
  skip?: number;
  limit?: number;
  search?: string;
  role?: "user" | "admin";
}

export interface AttemptListParams {
  skip?: number;
  limit?: number;
  user_id?: number;
  exam_id?: number;
  status?: string;
}

/**
 * Admin API Service
 */
export const adminService = {
  /**
   * Get dashboard stats
   */
  async getStats(): Promise<AdminStatsOut> {
    const response = await api.get<AdminStatsOut>(`${ADMIN_API_BASE}/stats`);
    return response.data;
  },

  /**
   * List users with pagination and filters
   */
  async listUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const response = await api.get<UserListResponse>(
      `${ADMIN_API_BASE}/users`,
      { params },
    );
    return response.data;
  },

  /**
   * Get user detail
   */
  async getUserDetail(userId: number): Promise<UserDetailOut> {
    const response = await api.get<UserDetailOut>(
      `${ADMIN_API_BASE}/users/${userId}`,
    );
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(
    userId: number,
    data: UserUpdateRequest,
  ): Promise<UserDetailOut> {
    const response = await api.patch<UserDetailOut>(
      `${ADMIN_API_BASE}/users/${userId}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: number): Promise<void> {
    await api.delete(`${ADMIN_API_BASE}/users/${userId}`);
  },

  /**
   * List all attempts with filters
   */
  async listAttempts(
    params: AttemptListParams = {},
  ): Promise<AdminAttemptListResponse> {
    const response = await api.get<AdminAttemptListResponse>(
      `${ADMIN_API_BASE}/attempts`,
      { params },
    );
    return response.data;
  },

  /**
   * Adjust user coin balance (admin only)
   */
  async adjustUserCoins(
    userId: number,
    data: AdminCoinAdjustmentRequest,
  ): Promise<AdminCoinAdjustmentResponse> {
    const response = await api.patch<AdminCoinAdjustmentResponse>(
      `${ADMIN_API_BASE}/users/${userId}/coins`,
      data,
    );
    return response.data;
  },

  async regradeAttempt(attemptId: number): Promise<AdminRegradeResponse> {
    const response = await api.post<AdminRegradeResponse>(
      `${ADMIN_API_BASE}/attempts/${attemptId}/regrade`,
    );
    return response.data;
  },

  async regradeBatch(
    data: AdminBatchRegradeRequest,
  ): Promise<AdminBatchRegradeResponse> {
    const response = await api.post<AdminBatchRegradeResponse>(
      `${ADMIN_API_BASE}/attempts/regrade-batch`,
      data,
    );
    return response.data;
  },
};

export default adminService;
