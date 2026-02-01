import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  clearAuth: () => void;
  getToken: () => string | null;
}

let tokenCache: string | null = null;
let tokenCacheTime: number = 0;
const CACHE_DURATION = 5000;

function getCachedToken(): string | null {
  if (typeof window === "undefined") return null;

  const now = Date.now();
  if (tokenCache !== null && now - tokenCacheTime < CACHE_DURATION) {
    return tokenCache;
  }

  tokenCache = localStorage.getItem("access_token");
  tokenCacheTime = now;
  return tokenCache;
}

function setCachedToken(token: string | null): void {
  tokenCache = token;
  tokenCacheTime = Date.now();

  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setToken: (token) => {
        setCachedToken(token);
      },

      setLoading: (loading) => set({ isLoading: loading }),

      getToken: () => getCachedToken(),

      logout: () => {
        setCachedToken(null);
        set({ user: null, isAuthenticated: false });
      },

      clearAuth: function () {
        this.logout();
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false);
        }
      },
    },
  ),
);
