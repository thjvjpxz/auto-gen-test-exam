import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminService,
  type UserListParams,
  type AttemptListParams,
  type AdminStatsOut,
  type UserListResponse,
  type UserDetailOut,
  type AdminAttemptListResponse,
  type UserUpdateRequest,
} from "@/services/admin";

/**
 * Hook for fetching admin dashboard stats
 */
export function useAdminStats() {
  return useQuery<AdminStatsOut>({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
  });
}

/**
 * Hook for fetching users list with pagination and filters
 */
export function useAdminUsers(params: UserListParams = {}) {
  return useQuery<UserListResponse>({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.listUsers(params),
  });
}

/**
 * Hook for fetching single user detail
 */
export function useAdminUserDetail(userId: number | null) {
  return useQuery<UserDetailOut>({
    queryKey: ["admin", "user", userId],
    queryFn: () => adminService.getUserDetail(userId!),
    enabled: userId !== null,
  });
}

/**
 * Hook for updating user
 */
export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: number;
      data: UserUpdateRequest;
    }) => adminService.updateUser(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

/**
 * Hook for deleting user (soft delete)
 */
export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

/**
 * Hook for fetching all attempts with filters
 */
export function useAdminAttempts(params: AttemptListParams = {}) {
  return useQuery<AdminAttemptListResponse>({
    queryKey: ["admin", "attempts", params],
    queryFn: () => adminService.listAttempts(params),
  });
}
