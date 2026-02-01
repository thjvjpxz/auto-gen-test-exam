"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "strict",
  fontFamily: "Source Sans 3, sans-serif",
});

/**
 * Normalize chart code to handle escaped newlines from JSON/API.
 * Handles multiple levels of escaping that can occur during data transfer.
 */
function normalizeChart(code: string): string {
  let result = code;

  // Handle double-escaped (\\n -> \n -> newline)
  // First pass: \\n -> \n (literal backslash-n to escape sequence)
  result = result.replace(/\\\\n/g, "\n");
  // Second pass: \n (if still literal) -> newline
  result = result.replace(/\\n/g, "\n");

  // Handle carriage returns and tabs
  result = result.replace(/\\\\r/g, "");
  result = result.replace(/\\r/g, "");
  result = result.replace(/\\\\t/g, "  ");
  result = result.replace(/\\t/g, "  ");

  return result;
}

/**
 * Sanitize ERD code to fix common syntax issues from AI generation.
 * Mermaid ERD has strict syntax: each attribute must be "type name [key]"
 */
function sanitizeErdCode(code: string): string {
  const lines = code.split("\n");
  const sanitizedLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.match(/^PRIMARY\s+KEY\s*\(/i)) {
      return false;
    }
    if (trimmed.match(/^CONSTRAINT\s+/i)) {
      return false;
    }
    if (trimmed.match(/^FOREIGN\s+KEY\s*\(/i)) {
      return false;
    }
    return true;
  });

  return sanitizedLines
    .map((line) => {
      return line.replace(/\bUNIQUE\b/g, "UK");
    })
    .join("\n");
}

export function MermaidRenderer({
  chart,
  className = "",
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderChart = useCallback(async () => {
    if (!containerRef.current || !chart) return;

    setIsLoading(true);
    setError(null);

    try {
      const id = `mermaid-${Math.random().toString(36).substring(7)}`;
      // Normalize escaped characters, then sanitize ERD-specific syntax issues
      const normalizedChart = normalizeChart(chart);
      const sanitizedChart = chart.trim().startsWith("erDiagram")
        ? sanitizeErdCode(normalizedChart)
        : normalizedChart;

      const { svg } = await mermaid.render(id, sanitizedChart);

      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    } catch (err) {
      console.error("Mermaid render error:", err);
      setError("Không thể hiển thị sơ đồ ERD");
    } finally {
      setIsLoading(false);
    }
  }, [chart]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  if (!chart) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg bg-muted/50">
        <Database className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Không có sơ đồ ERD</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="animate-fade-in-scale">
        <AlertCircle className="size-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={renderChart}
            className="ml-4 cursor-pointer"
          >
            <RefreshCw className="mr-1 size-3" />
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-muted/80 backdrop-blur-sm">
          <div className="relative">
            <div className="size-10 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Đang tải sơ đồ...</p>
        </div>
      )}

      {/* Chart container */}
      <div
        ref={containerRef}
        className={`overflow-auto rounded-lg border border-border bg-white p-4 transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "animate-fade-in-scale opacity-100"
        }`}
        style={{ minHeight: isLoading ? "200px" : "auto" }}
      />
    </div>
  );
}
