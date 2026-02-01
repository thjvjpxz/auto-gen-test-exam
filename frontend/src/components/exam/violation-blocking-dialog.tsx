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
import { AlertTriangle } from "lucide-react";
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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-red-600">
              Cảnh báo nghiêm trọng!
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              <p>
                Bạn đã vi phạm quy tắc thi{" "}
                <strong>{violations.length} lần</strong>. Hệ thống đã ghi nhận
                các hành vi sau:
              </p>

              <ul className="list-disc list-inside text-sm space-y-1 bg-red-50 p-3 rounded-lg">
                {violations.slice(-3).map((v, i) => (
                  <li key={i} className="text-red-700">
                    {getViolationLabel(v.type)}
                  </li>
                ))}
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  ⚠️ Còn {remainingWarnings} lần vi phạm nữa, bài thi sẽ được tự
                  động nộp!
                </p>
              </div>

              <p className="text-muted-foreground text-sm">
                Vui lòng tập trung làm bài và không rời khỏi trang thi.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onAcknowledge}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            Tôi đã hiểu, tiếp tục làm bài
          </AlertDialogAction>
        </AlertDialogFooter>
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
