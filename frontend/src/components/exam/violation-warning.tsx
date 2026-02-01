"use client";

import { AlertTriangle, X, ShieldAlert, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import type { WarningLevel } from "@/types";

interface WarningConfig {
  title: string;
  message: string;
  className: string;
  iconClassName: string;
  progressColor: string;
  show: boolean;
}

const WARNING_CONFIG: Record<WarningLevel, WarningConfig> = {
  none: {
    title: "",
    message: "",
    className: "",
    iconClassName: "",
    progressColor: "",
    show: false,
  },
  low: {
    title: "Cảnh báo nhẹ",
    message:
      "Hệ thống đã ghi nhận một số hành động bất thường. Vui lòng tiếp tục làm bài bình thường.",
    className:
      "border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100/50",
    iconClassName: "bg-yellow-100 text-yellow-600",
    progressColor: "bg-yellow-400",
    show: true,
  },
  medium: {
    title: "Cảnh báo trung bình",
    message:
      "Bạn đã vi phạm một số quy tắc. Điểm tin cậy của bạn đang bị ảnh hưởng.",
    className:
      "border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100/50",
    iconClassName: "bg-orange-100 text-orange-600",
    progressColor: "bg-orange-400",
    show: true,
  },
  high: {
    title: "Cảnh báo nghiêm trọng",
    message: "Phát hiện nhiều vi phạm. Bài thi có thể bị đánh dấu để xem xét.",
    className: "border-red-300 bg-gradient-to-r from-red-50 to-red-100/50",
    iconClassName: "bg-red-100 text-red-600",
    progressColor: "bg-red-500",
    show: true,
  },
  critical: {
    title: "Vi phạm nghiêm trọng",
    message:
      "Bài thi của bạn đã bị đánh dấu do vi phạm quá nhiều. Kết quả sẽ được xem xét.",
    className: "border-red-500 bg-gradient-to-r from-red-100 to-red-200/50",
    iconClassName: "bg-red-200 text-red-700",
    progressColor: "bg-red-600",
    show: true,
  },
};

interface ViolationWarningProps {
  onDismiss?: () => void;
}

/**
 * Warning banner displayed when violations are detected.
 */
export function ViolationWarning({ onDismiss }: ViolationWarningProps) {
  const warningLevel = useExamAttemptStore((s) => s.warningLevel);
  const trustScore = useExamAttemptStore((s) => s.trustScore);
  const violations = useExamAttemptStore((s) => s.violations);

  const config = WARNING_CONFIG[warningLevel];

  if (!config.show) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border-2 p-4 shadow-sm transition-all duration-300",
        config.className,
      )}
      role="alert"
    >
      {/* Progress bar at top */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-black/5">
        <div
          className={cn(
            "h-full transition-all duration-500",
            config.progressColor,
          )}
          style={{ width: `${100 - trustScore}%` }}
        />
      </div>

      <div className="flex items-start gap-3 pt-1">
        {/* Animated icon */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110",
            config.iconClassName,
          )}
        >
          {warningLevel === "critical" ? (
            <ShieldAlert className="size-5" />
          ) : (
            <AlertTriangle className="size-5" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="font-semibold text-foreground">{config.title}</h3>
          <p className="text-sm opacity-90">{config.message}</p>

          {/* Stats with icons */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium">
            <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1">
              <TrendingDown className="size-3" />
              <span>Điểm tin cậy: {trustScore}%</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1">
              <AlertTriangle className="size-3" />
              <span>Vi phạm: {violations.length}</span>
            </div>
          </div>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="size-8 shrink-0 cursor-pointer p-0 opacity-60 transition-all duration-200 hover:opacity-100"
            aria-label="Đóng cảnh báo"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
