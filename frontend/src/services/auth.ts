import api from "./api";
import type {
  AuthResponse,
  ApiError,
  RegisterFormData,
  LoginFormData,
} from "@/types";

export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterFormData): Promise<AuthResponse> {
    await api.post("/auth/register", data);
    return this.login({
      email: data.email,
      password: data.password,
    });
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getCurrentUser(): Promise<AuthResponse["user"]> {
    const response = await api.get<AuthResponse["user"]>("/auth/me");
    return response.data;
  },
};

export type { ApiError };
