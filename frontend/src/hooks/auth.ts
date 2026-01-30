import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";
import type { LoginRequest, RegisterFormData, UserOut } from "@/types";

/**
 * Query keys for auth queries following client-swr-dedup pattern.
 */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

/**
 * Maps UserOut from API response to User interface for frontend.
 *
 * @param userOut - User data from API
 * @returns User object with mapped avatar_url to avatarUrl
 */
function mapUserOutToUser(userOut: UserOut) {
  return {
    id: userOut.id,
    email: userOut.email,
    name: userOut.name,
    role: userOut.role,
    avatarUrl: userOut.avatar_url || undefined,
  };
}

/**
 * Login mutation hook with React Query.
 * Handles authentication, updates auth store, and navigates to dashboard.
 *
 * @returns Mutation object with login function
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setToken(response.access_token);
      setUser(mapUserOutToUser(response.user));
      queryClient.invalidateQueries({ queryKey: authKeys.me() });

      toast.success("Đăng nhập thành công!", {
        description: `Chào mừng ${response.user.name}`,
      });

      const dashboardPath =
        response.user.role === "admin" ? "/admin" : "/dashboard";
      router.push(dashboardPath);
    },
  });
}

/**
 * Register mutation hook with React Query.
 * Registers new user and redirects to login page (no auto-login).
 *
 * @returns Mutation object with register function
 */
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterFormData) => authService.register(data),
    onSuccess: (userOut) => {
      toast.success("Đăng ký thành công!", {
        description: `Tài khoản ${userOut.email} đã được tạo. Vui lòng đăng nhập.`,
      });
      router.push("/login");
    },
  });
}

/**
 * Current user query hook with React Query.
 * Fetches user data with automatic caching and deduplication.
 *
 * @returns Query object with user data
 */
export function useMe() {
  const { setUser, logout, getToken } = useAuthStore();
  const token = getToken();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        const userOut = await authService.getCurrentUser();
        setUser(mapUserOutToUser(userOut));
        return userOut;
      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 401) {
          logout();
        }
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
