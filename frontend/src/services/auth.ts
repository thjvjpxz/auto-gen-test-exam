import api from "./api";
import type {
  TokenResponse,
  UserOut,
  RegisterRequest,
  LoginRequest,
  RegisterFormData,
} from "@/types";

/**
 * Authentication service for API endpoints.
 */
export const authService = {
  /**
   * Login and receive access token with user info.
   *
   * @param data - Login credentials
   * @returns TokenResponse with access_token and user data
   */
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/auth/login", data);
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
   * Get current authenticated user info.
   *
   * @returns UserOut with current user data
   */
  async getCurrentUser(): Promise<UserOut> {
    const response = await api.get<UserOut>("/auth/me");
    return response.data;
  },
};
