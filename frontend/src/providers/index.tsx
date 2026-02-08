"use client";

import { type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";

const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
  ssr: false,
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="light" storageKey="exam-app-theme">
        <AuthProvider>
          {children}
          {mounted && <Toaster position="top-center" richColors />}
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
