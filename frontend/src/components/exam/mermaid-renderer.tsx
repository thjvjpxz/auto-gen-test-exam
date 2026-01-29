"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
  fontFamily: "Source Sans 3, sans-serif",
});

export function MermaidRenderer({ chart, className = "" }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chart) return;

      setIsLoading(true);
      setError(null);

      try {
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;
        const { svg } = await mermaid.render(id, chart);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Không thể hiển thị sơ đồ ERD");
      } finally {
        setIsLoading(false);
      }
    };

    renderChart();
  }, [chart]);

  if (!chart) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-50 rounded-lg">
        <p className="text-slate-500">Không có sơ đồ ERD</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-lg">
          <Skeleton className="h-48 w-full" />
        </div>
      )}
      <div
        ref={containerRef}
        className="overflow-auto bg-white rounded-lg p-4 border border-slate-200"
        style={{ minHeight: isLoading ? "200px" : "auto" }}
      />
    </div>
  );
}
