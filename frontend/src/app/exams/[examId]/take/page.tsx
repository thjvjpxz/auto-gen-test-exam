"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExamHeader } from "@/components/exam/exam-header";
import { SqlPartForm } from "@/components/exam/sql-part-form";
import { TestingPartForm } from "@/components/exam/testing-part-form";
import { ViolationWarning } from "@/components/exam/violation-warning";
import { SubmitConfirmDialog } from "@/components/exam/submit-confirm-dialog";
import { useStartExam, useSubmitExam } from "@/hooks/attempt";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useExamTimer } from "@/hooks/use-exam-timer";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useViolationMonitor } from "@/hooks/use-violation-monitor";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import { useAuthStore } from "@/stores/auth";

/**
 * Main exam taking page with proctoring and auto-save.
 */
export default function ExamTakePage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.examId);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const startExam = useStartExam();
  const submitExam = useSubmitExam();

  const attemptId = useExamAttemptStore((s) => s.attemptId);
  const examData = useExamAttemptStore((s) => s.examData);
  const startedAt = useExamAttemptStore((s) => s.startedAt);
  const duration = useExamAttemptStore((s) => s.duration);
  const answers = useExamAttemptStore((s) => s.answers);
  const warningLevel = useExamAttemptStore((s) => s.warningLevel);

  // Auto-save hook
  const { recoverFromLocal, clearLocalDraft } = useAutoSave(attemptId);

  // Fullscreen hook
  const { isFullscreen, isSupported, enterFullscreen } = useFullscreen(
    useCallback(() => {
      // Report fullscreen exit violation
    }, []),
  );

  // Violation monitor
  const { reportViolation } = useViolationMonitor(attemptId);

  // Handle auto-submit on time up
  const handleTimeUp = useCallback(() => {
    if (attemptId && answers) {
      submitExam.mutate(
        { attemptId, answers },
        {
          onSuccess: (data) => {
            clearLocalDraft();
            router.push(`/exams/${examId}/result/${data.attempt_id}`);
          },
        },
      );
    }
  }, [attemptId, answers, submitExam, clearLocalDraft, router, examId]);

  // Timer hook
  const { formattedTime, isLowTime, isUrgent } = useExamTimer(
    startedAt,
    duration,
    handleTimeUp,
  );

  // Track if start exam was called for current exam
  const hasStartedRef = useRef<number | null>(null);
  const reset = useExamAttemptStore((s) => s.reset);

  // Reset store on mount or when examId changes
  useEffect(() => {
    reset();
    hasStartedRef.current = null;
  }, [examId, reset]);

  // Start exam after reset
  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated &&
      examId &&
      !attemptId &&
      hasStartedRef.current !== examId
    ) {
      hasStartedRef.current = examId;
      startExam.mutate(examId);
    }
  }, [authLoading, isAuthenticated, examId, attemptId, startExam]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Recover from local storage on mount
  useEffect(() => {
    if (attemptId) {
      const recovered = recoverFromLocal();
      if (recovered) {
        // Could show a dialog asking if user wants to restore
        console.log("Recovered draft available");
      }
    }
  }, [attemptId, recoverFromLocal]);

  // Handle fullscreen exit violation
  useEffect(() => {
    if (attemptId && !isFullscreen && !showFullscreenPrompt && isSupported) {
      reportViolation("fullscreen_exit", "User exited fullscreen mode");
    }
  }, [
    isFullscreen,
    attemptId,
    showFullscreenPrompt,
    isSupported,
    reportViolation,
  ]);

  const handleEnterFullscreen = async () => {
    await enterFullscreen();
    setShowFullscreenPrompt(false);
  };

  const handleSkipFullscreen = () => {
    setShowFullscreenPrompt(false);
  };

  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  const handleConfirmSubmit = () => {
    if (attemptId && answers) {
      submitExam.mutate(
        { attemptId, answers },
        {
          onSuccess: (data) => {
            clearLocalDraft();
            setShowSubmitDialog(false);
            router.push(`/exams/${examId}/result/${data.attempt_id}`);
          },
        },
      );
    }
  };

  // Loading state
  if (authLoading || startExam.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (startExam.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Không thể bắt đầu bài thi
            </h2>
            <p className="text-muted-foreground mb-4">
              {startExam.error?.message || "Đã có lỗi xảy ra"}
            </p>
            <Button
              onClick={() => router.push("/exams")}
              className="cursor-pointer"
            >
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fullscreen prompt
  if (showFullscreenPrompt && isSupported && attemptId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <Maximize className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Chế độ toàn màn hình</h2>
            <p className="text-muted-foreground">
              Để đảm bảo tính công bằng, bài thi sẽ được thực hiện ở chế độ toàn
              màn hình. Việc thoát khỏi chế độ này sẽ được ghi lại.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleSkipFullscreen}
                className="cursor-pointer"
              >
                Bỏ qua
              </Button>
              <Button
                onClick={handleEnterFullscreen}
                className="cursor-pointer"
              >
                Bật toàn màn hình
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <ExamHeader
        examTitle={examData.title || "Bài thi"}
        formattedTime={formattedTime}
        isLowTime={isLowTime}
        isUrgent={isUrgent}
        onSubmit={handleSubmit}
        isSubmitting={submitExam.isPending}
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Violation Warning */}
        {warningLevel !== "none" && !dismissedWarning && (
          <ViolationWarning onDismiss={() => setDismissedWarning(true)} />
        )}

        <div className="space-y-6">
          {/* SQL Part */}
          {examData.sql_part && <SqlPartForm sqlPart={examData.sql_part} />}

          {/* Testing Part */}
          {examData.testing_part && (
            <TestingPartForm testingPart={examData.testing_part} />
          )}
        </div>
      </main>

      {/* Submit Confirmation */}
      <SubmitConfirmDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleConfirmSubmit}
        isSubmitting={submitExam.isPending}
        remainingTime={formattedTime}
      />
    </div>
  );
}
