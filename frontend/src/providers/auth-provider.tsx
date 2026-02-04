"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component that handles:
 * - Listening for unauthorized events (401) and redirecting to login
 * - Syncing user state from cookie-based session on mount
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { logout, setUser, setLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      toast.error("Phiên đăng nhập đã hết hạn", {
        description: "Vui lòng đăng nhập lại",
      });
      router.push("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout, router]);

  useEffect(() => {
    const syncUserFromCookie = async () => {
      setLoading(true);

      try {
        const user = await authService.getCurrentUser();
        setUser({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatar_url || undefined,
        });
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    syncUserFromCookie();
  }, []);

  return <>{children}</>;
}
