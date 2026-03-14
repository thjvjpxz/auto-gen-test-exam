"use client";

import {
  Timer,
  Send,
  AlertTriangle,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "./save-indicator";
import { CoinBadge } from "@/components/progression/coin-badge";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import { fadeInDown, fadeInScale } from "@/lib/motion";

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
    "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-all duration-300",
    {
      "bg-muted text-foreground": !isLowTime && !isUrgent,
      "bg-yellow-100 text-yellow-800 shadow-sm": isLowTime && !isUrgent,
      "bg-red-100 text-red-800 shadow-md animate-pulse": isUrgent,
    },
  );

  const hasWarning = warningLevel !== "none";

  return (
    <motion.header
      variants={fadeInDown}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm transition-transform duration-200 hover:scale-105">
            <GraduationCap className="size-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="max-w-[200px] truncate font-semibold text-foreground sm:max-w-none">
              {examTitle}
            </h1>
          </div>
          {hasWarning && (
            <motion.div
              variants={fadeInScale}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-yellow-700"
            >
              <AlertTriangle className="size-3.5" />
              <span className="hidden text-xs font-medium sm:inline">
                Cảnh báo
              </span>
            </motion.div>
          )}
        </div>

        <div className={timerClasses}>
          <Timer className={cn("size-5", isUrgent && "animate-pulse")} />
          <span className="tabular-nums">{formattedTime}</span>
        </div>

        <CoinBadge variant="compact" className="hidden sm:flex" />

        <div className="flex items-center gap-3 sm:gap-4">
          <SaveIndicator />
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="glow-effect cursor-pointer bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <span className="hidden sm:inline">Đang nộp...</span>
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                <span className="hidden sm:inline">Nộp bài</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
