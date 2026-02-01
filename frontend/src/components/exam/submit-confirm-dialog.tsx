"use client";

import {
  AlertTriangle,
  Send,
  Clock,
  FileText,
  CheckCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useExamAttemptStore } from "@/stores/exam-attempt";

interface SubmitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  remainingTime: string;
}

/**
 * Confirmation dialog before exam submission.
 */
export function SubmitConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  remainingTime,
}: SubmitConfirmDialogProps) {
  const answers = useExamAttemptStore((s) => s.answers);
  const violations = useExamAttemptStore((s) => s.violations);

  const sqlAnswered =
    (answers.sql_part?.question_1_answer?.trim()?.length ?? 0) > 0 ||
    (answers.sql_part?.question_2_answer?.trim()?.length ?? 0) > 0;

  const testingAnswered =
    (answers.testing_part?.technique?.length ?? 0) > 0 ||
    (answers.testing_part?.test_cases?.length ?? 0) > 0;

  const hasViolations = violations.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Xác nhận nộp bài
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-2">
              <p>
                Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn không thể chỉnh
                sửa.
              </p>

              {/* Progress Summary */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Thời gian còn lại: <strong>{remainingTime}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Phần SQL:{" "}
                    {sqlAnswered ? (
                      <span className="text-green-600 font-medium">
                        Đã trả lời
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        Chưa trả lời
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Phần Testing:{" "}
                    {testingAnswered ? (
                      <span className="text-green-600 font-medium">
                        Đã trả lời
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        Chưa trả lời
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Violations Warning */}
              {hasViolations && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Bài thi có {violations.length} vi phạm được ghi nhận. Kết
                    quả có thể bị xem xét.
                  </span>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isSubmitting}
            className="cursor-pointer hover:bg-muted transition-colors"
          >
            Tiếp tục làm bài
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-accent hover:brightness-95 text-accent-foreground cursor-pointer transition-all"
          >
            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
