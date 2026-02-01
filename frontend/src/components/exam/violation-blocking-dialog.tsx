"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, AlertCircle, ShieldAlert } from "lucide-react";
import { useExamAttemptStore } from "@/stores/exam-attempt";

interface ViolationBlockingDialogProps {
  open: boolean;
  onAcknowledge: () => void;
  remainingWarnings: number;
}

/**
 * Blocking dialog shown when violation count reaches 3-4.
 * User must acknowledge to continue.
 */
export function ViolationBlockingDialog({
  open,
  onAcknowledge,
  remainingWarnings,
}: ViolationBlockingDialogProps) {
  const violations = useExamAttemptStore((s) => s.violations);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md animate-fade-in-scale overflow-hidden border-0 p-0 shadow-2xl">
        {/* Top accent bar with gradient */}
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-orange-500" />

        <div className="p-6">
          <AlertDialogHeader className="space-y-4">
            {/* Animated icon */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex size-14 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="size-7 text-red-600" />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-red-400 opacity-50" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-red-600">
                Cảnh báo nghiêm trọng!
              </AlertDialogTitle>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-left">
                <p className="text-base text-foreground">
                  Bạn đã vi phạm quy tắc thi{" "}
                  <span className="font-bold text-red-600">
                    {violations.length} lần
                  </span>
                  . Hệ thống đã ghi nhận các hành vi sau:
                </p>

                {/* Violations list with staggered animation */}
                <ul className="space-y-2 rounded-lg bg-red-50 p-4">
                  {violations.slice(-3).map((v, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-red-700"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${i * 100}ms forwards`,
                        opacity: 0,
                      }}
                    >
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{getViolationLabel(v.type)}</span>
                    </li>
                  ))}
                </ul>

                {/* Warning countdown with animation */}
                <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-4">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">
                    Còn{" "}
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-yellow-200 font-bold text-yellow-900">
                      {remainingWarnings}
                    </span>{" "}
                    lần vi phạm nữa, bài thi sẽ được tự động nộp!
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  Vui lòng tập trung làm bài và không rời khỏi trang thi.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6">
            <AlertDialogAction
              onClick={onAcknowledge}
              className="w-full cursor-pointer bg-red-600 text-base font-medium transition-all duration-200 hover:scale-[1.01] hover:bg-red-700"
            >
              Tôi đã hiểu, tiếp tục làm bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getViolationLabel(type: string): string {
  const labels: Record<string, string> = {
    tab_switch: "Chuyển tab/cửa sổ",
    fullscreen_exit: "Thoát chế độ toàn màn hình",
    copy: "Cố gắng sao chép nội dung",
    paste: "Cố gắng dán nội dung",
    devtools_open: "Mở công cụ phát triển (DevTools)",
    window_blur: "Cửa sổ bị mất focus",
    mouse_leave: "Chuột rời khỏi vùng thi",
  };
  return labels[type] || type;
}
