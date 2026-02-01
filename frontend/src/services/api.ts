import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import type { ApiError } from "@/types";

export const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      if (!isAuthEndpoint && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    // Extract error message from API response 
    const responseData = error.response?.data as
      | { detail?: string; message?: string }
      | undefined;
    const apiErrorMessage =
      responseData?.detail ||
      responseData?.message ||
      error.message ||
      "Đã có lỗi xảy ra";

    // Create new Error with API message
    const enhancedError = new Error(apiErrorMessage);
    return Promise.reject(enhancedError);
  },
);

export default api;
