"use client";

import {
  AlertTriangle,
  Send,
  Clock,
  FileText,
  CheckCircle,
  Loader2,
  XCircle,
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
      <AlertDialogContent className="max-w-md overflow-hidden border-0 p-0 shadow-2xl">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-accent" />

        <div className="p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Send className="size-5 text-primary" />
              </div>
              Xác nhận nộp bài
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-4">
                <p className="text-base text-muted-foreground">
                  Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn không thể
                  chỉnh sửa.
                </p>

                {/* Progress Summary */}
                <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                  {/* Time remaining */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                      <Clock className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Thời gian còn lại:
                      </span>
                      <span className="ml-2 font-semibold text-foreground">
                        {remainingTime}
                      </span>
                    </div>
                  </div>

                  {/* SQL Part */}
                  <div className="flex items-center gap-3 text-sm">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full ${
                        sqlAnswered ? "bg-green-100" : "bg-yellow-100"
                      }`}
                    >
                      {sqlAnswered ? (
                        <CheckCircle className="size-4 text-green-600" />
                      ) : (
                        <XCircle className="size-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phần SQL:</span>
                      {sqlAnswered ? (
                        <span className="ml-2 font-medium text-green-600">
                          Đã trả lời
                        </span>
                      ) : (
                        <span className="ml-2 font-medium text-yellow-600">
                          Chưa trả lời
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Testing Part */}
                  <div className="flex items-center gap-3 text-sm">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full ${
                        testingAnswered ? "bg-green-100" : "bg-yellow-100"
                      }`}
                    >
                      {testingAnswered ? (
                        <CheckCircle className="size-4 text-green-600" />
                      ) : (
                        <FileText className="size-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Phần Testing:
                      </span>
                      {testingAnswered ? (
                        <span className="ml-2 font-medium text-green-600">
                          Đã trả lời
                        </span>
                      ) : (
                        <span className="ml-2 font-medium text-yellow-600">
                          Chưa trả lời
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Violations Warning */}
                {hasViolations && (
                  <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-600" />
                    <div className="text-yellow-800">
                      <p className="font-medium">Có vi phạm được ghi nhận</p>
                      <p className="mt-1 opacity-90">
                        Bài thi có {violations.length} vi phạm. Kết quả có thể
                        bị xem xét.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 gap-3 sm:gap-3">
            <AlertDialogCancel
              disabled={isSubmitting}
              className="cursor-pointer transition-all duration-200 hover:scale-[1.01]"
            >
              Tiếp tục làm bài
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isSubmitting}
              className="glow-effect cursor-pointer bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.01] hover:bg-accent/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Đang nộp...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Nộp bài
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
