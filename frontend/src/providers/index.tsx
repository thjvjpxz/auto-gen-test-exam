"use client";

import { type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

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
      <ThemeProvider defaultTheme="system" storageKey="exam-app-theme">
        {children}
        {mounted && <Toaster position="top-center" richColors />}
      </ThemeProvider>
    </QueryProvider>
  );
}
