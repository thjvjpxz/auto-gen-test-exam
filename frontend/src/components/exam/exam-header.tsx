"use client";

import { Timer, Send, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "./save-indicator";
import { useExamAttemptStore } from "@/stores/exam-attempt";

interface ExamHeaderProps {
  examTitle: string;
  formattedTime: string;
  isLowTime: boolean;
  isUrgent: boolean;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Exam header with timer, save indicator, and submit button.
 */
export function ExamHeader({
  examTitle,
  formattedTime,
  isLowTime,
  isUrgent,
  onSubmit,
  isSubmitting = false,
}: ExamHeaderProps) {
  const warningLevel = useExamAttemptStore((s) => s.warningLevel);

  const timerClasses = cn(
    "flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-lg font-semibold transition-colors duration-300",
    {
      "bg-slate-100 text-slate-800": !isLowTime && !isUrgent,
      "bg-yellow-100 text-yellow-800": isLowTime && !isUrgent,
      "bg-red-100 text-red-800 animate-pulse": isUrgent,
    },
  );

  const hasWarning = warningLevel !== "none";

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">E</span>
          </div>
          <h1 className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
            {examTitle}
          </h1>
          {hasWarning && (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">Cảnh báo</span>
            </div>
          )}
        </div>

        {/* Center: Timer */}
        <div className={timerClasses}>
          <Timer className="h-5 w-5" />
          <span>{formattedTime}</span>
        </div>

        {/* Right: Save indicator + Submit */}
        <div className="flex items-center gap-4">
          <SaveIndicator />
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-accent hover:brightness-95 text-accent-foreground cursor-pointer transition-all"
          >
            <Send className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {isSubmitting ? "Đang nộp..." : "Nộp bài"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
