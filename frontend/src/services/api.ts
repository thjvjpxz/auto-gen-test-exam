import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/types";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register") ||
        error.config?.url?.includes("/auth/me");

      if (!isAuthEndpoint && typeof window !== "undefined") {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // Suppress logout error
        }

        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    const responseData = error.response?.data as
      | {
          detail?: string | Array<{ msg?: string }>;
          message?: string;
          error?: string;
        }
      | undefined;

    let apiErrorMessage: string;
    const detail = responseData?.detail;

    if (typeof detail === "string") {
      apiErrorMessage = detail;
    } else if (Array.isArray(detail) && detail.length > 0) {
      apiErrorMessage = detail[0]?.msg || "Dữ liệu không hợp lệ";
    } else {
      apiErrorMessage =
        responseData?.message ||
        responseData?.error ||
        error.message ||
        "Đã có lỗi xảy ra";
    }

    error.message = apiErrorMessage;
    return Promise.reject(error);
  },
);

export default api;
