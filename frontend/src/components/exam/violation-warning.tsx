"use client";

import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import type { WarningLevel } from "@/types";

const WARNING_CONFIG: Record<
  WarningLevel,
  { title: string; message: string; className: string; show: boolean }
> = {
  none: {
    title: "",
    message: "",
    className: "",
    show: false,
  },
  low: {
    title: "Cảnh báo nhẹ",
    message:
      "Hệ thống đã ghi nhận một số hành động bất thường. Vui lòng tiếp tục làm bài bình thường.",
    className: "bg-yellow-50 border-yellow-300 text-yellow-800",
    show: true,
  },
  medium: {
    title: "Cảnh báo trung bình",
    message:
      "Bạn đã vi phạm một số quy tắc. Điểm tin cậy của bạn đang bị ảnh hưởng.",
    className: "bg-orange-50 border-orange-300 text-orange-800",
    show: true,
  },
  high: {
    title: "Cảnh báo nghiêm trọng",
    message: "Phát hiện nhiều vi phạm. Bài thi có thể bị đánh dấu để xem xét.",
    className: "bg-red-50 border-red-300 text-red-800",
    show: true,
  },
  critical: {
    title: "Vi phạm nghiêm trọng",
    message:
      "Bài thi của bạn đã bị đánh dấu do vi phạm quá nhiều. Kết quả sẽ được xem xét.",
    className: "bg-red-100 border-red-500 text-red-900",
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
        "border rounded-lg p-4 mb-4 flex items-start gap-3",
        config.className,
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold">{config.title}</h3>
        <p className="text-sm mt-1">{config.message}</p>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <span>Điểm tin cậy: {trustScore}%</span>
          <span>Vi phạm: {violations.length}</span>
        </div>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-8 w-8 p-0 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
