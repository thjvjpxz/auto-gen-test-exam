import api from "./api";
import type {
  UserOut,
  RegisterRequest,
  LoginRequest,
  RegisterFormData,
} from "@/types";

interface LoginResponse {
  user: UserOut;
}

/**
 * Authentication service for API endpoints.
 * Works with Next.js API proxy routes for cookie-based authentication.
 */
export const authService = {
  /**
   * Login via Next.js proxy and receive user info.
   * Token is set as HttpOnly cookie by the proxy.
   *
   * @param data - Login credentials
   * @returns LoginResponse with user data (token is in cookie)
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  /**
   * Register new user account.
   *
   * @param data - Registration form data
   * @returns UserOut (does not auto-login)
   */
  async register(data: RegisterFormData): Promise<UserOut> {
    const registerData: RegisterRequest = {
      email: data.email,
      password: data.password,
      name: data.name,
    };
    const response = await api.post<UserOut>("/auth/register", registerData);
    return response.data;
  },

  /**
   * Get current authenticated user info from cookie-based session.
   *
   * @returns UserOut with current user data
   */
  async getCurrentUser(): Promise<UserOut> {
    const response = await api.get<UserOut>("/auth/me");
    return response.data;
  },
};
