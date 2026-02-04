"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Maximize,
  Loader2,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExamHeader } from "@/components/exam/exam-header";
import { SqlPartForm } from "@/components/exam/sql-part-form";
import { TestingPartForm } from "@/components/exam/testing-part-form";
import { ViolationWarning } from "@/components/exam/violation-warning";
import { SubmitConfirmDialog } from "@/components/exam/submit-confirm-dialog";
import { ViolationBlockingDialog } from "@/components/exam/violation-blocking-dialog";
import { useStartExam, useSubmitExam } from "@/hooks/attempt";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useExamTimer } from "@/hooks/use-exam-timer";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useViolationMonitor } from "@/hooks/use-violation-monitor";
import { useExamAttemptStore } from "@/stores/exam-attempt";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";
import Link from "next/link";
import {
  springItem,
  fadeInScale,
  fadeInDown,
  floatAnimation,
} from "@/lib/motion";

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
  const [showBlockingDialog, setShowBlockingDialog] = useState(false);
  const [acknowledgedHighWarning, setAcknowledgedHighWarning] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const startExam = useStartExam();
  const submitExam = useSubmitExam();

  const attemptId = useExamAttemptStore((s) => s.attemptId);
  const examData = useExamAttemptStore((s) => s.examData);
  const startedAt = useExamAttemptStore((s) => s.startedAt);
  const duration = useExamAttemptStore((s) => s.duration);
  const answers = useExamAttemptStore((s) => s.answers);
  const warningLevel = useExamAttemptStore((s) => s.warningLevel);
  const violations = useExamAttemptStore((s) => s.violations);
  const shouldForceSubmit = useExamAttemptStore((s) => s.shouldForceSubmit);
  const clearForceSubmit = useExamAttemptStore((s) => s.clearForceSubmit);

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
      const backupKey = `exam_timeup_backup_${attemptId}`;
      try {
        localStorage.setItem(
          backupKey,
          JSON.stringify({ attemptId, answers, timestamp: Date.now() }),
        );
      } catch {
        console.error("Failed to save backup to localStorage");
      }

      submitExam.mutate(
        { attemptId, answers },
        {
          onSuccess: (data) => {
            clearLocalDraft();
            localStorage.removeItem(backupKey);
            router.push(`/exams/${examId}/result/${data.attempt_id}`);
          },
          onError: (error) => {
            console.error("Auto-submit failed on time up:", error);
            localStorage.setItem(
              `exam_pending_submit_${attemptId}`,
              JSON.stringify({
                attemptId,
                answers,
                timestamp: Date.now(),
                error: error.message,
              }),
            );
            toast.error(
              "Không thể nộp bài tự động khi hết giờ. Bài làm đã được lưu cục bộ. Vui lòng kiểm tra kết nối mạng và thử lại.",
              { duration: 10000 },
            );
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
        console.log("Recovered draft available");
      }
    }
  }, [attemptId, recoverFromLocal]);

  // Handle fullscreen exit violation
  const wasFullscreenRef = useRef(false);
  useEffect(() => {
    const wasFullscreen = wasFullscreenRef.current;
    wasFullscreenRef.current = isFullscreen;

    if (
      attemptId &&
      wasFullscreen &&
      !isFullscreen &&
      !showFullscreenPrompt &&
      isSupported
    ) {
      reportViolation("fullscreen_exit", "User exited fullscreen mode");
    }
  }, [
    isFullscreen,
    attemptId,
    showFullscreenPrompt,
    isSupported,
    reportViolation,
  ]);

  // Handle warning level changes - show blocking dialog for high warnings
  const prevWarningLevelRef = useRef(warningLevel);
  useEffect(() => {
    const prevLevel = prevWarningLevelRef.current;
    prevWarningLevelRef.current = warningLevel;

    // Show toast for low/medium warnings
    if (warningLevel === "low" && prevLevel === "none") {
      toast.warning("Cảnh báo: Đã phát hiện hành vi bất thường.", {
        duration: 4000,
      });
    } else if (warningLevel === "medium" && prevLevel === "low") {
      toast.warning(
        "Cảnh báo: Số lần vi phạm đang tăng. Vui lòng tập trung làm bài.",
        {
          duration: 5000,
        },
      );
    }

    // Show blocking dialog for high warning (3-4 violations)
    if (warningLevel === "high" && !acknowledgedHighWarning) {
      const timerId = setTimeout(() => setShowBlockingDialog(true), 0);
      return () => clearTimeout(timerId);
    }
  }, [warningLevel, acknowledgedHighWarning]);

  // Handle auto-submit when violations reach critical threshold (5+)
  const forceSubmitTriggeredRef = useRef(false);
  useEffect(() => {
    if (
      shouldForceSubmit &&
      attemptId &&
      answers &&
      !forceSubmitTriggeredRef.current
    ) {
      forceSubmitTriggeredRef.current = true;

      toast.error("Bài thi đang được tự động nộp do vi phạm quá nhiều lần.", {
        duration: 5000,
      });

      submitExam.mutate(
        { attemptId, answers },
        {
          onSuccess: (data) => {
            clearLocalDraft();
            clearForceSubmit();
            router.push(`/exams/${examId}/result/${data.attempt_id}`);
          },
          onError: () => {
            forceSubmitTriggeredRef.current = false;
            toast.error(
              "Không thể tự động nộp bài. Vui lòng thử nộp bài thủ công.",
            );
          },
        },
      );
    }
  }, [
    shouldForceSubmit,
    attemptId,
    answers,
    submitExam,
    clearLocalDraft,
    clearForceSubmit,
    router,
    examId,
  ]);

  const handleAcknowledgeViolation = () => {
    setShowBlockingDialog(false);
    setAcknowledgedHighWarning(true);
  };

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          variants={springItem}
          initial="hidden"
          animate="visible"
          className="space-y-6 text-center"
        >
          {/* Animated loading spinner */}
          <div className="relative mx-auto size-20">
            <div className="absolute inset-0 animate-ping rounded-full border-4 border-primary/30" />
            <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <Loader2 className="absolute inset-0 m-auto size-8 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Đang tải bài thi...
            </p>
            <p className="text-sm text-muted-foreground">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (startExam.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div variants={fadeInScale} initial="hidden" animate="visible">
          <Card className="w-full max-w-md overflow-hidden border-2">
            <div className="h-1 bg-gradient-to-r from-destructive via-destructive/60 to-transparent" />
            <CardContent className="pt-8 text-center">
              <motion.div
                variants={floatAnimation}
                animate="animate"
                className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10"
              >
                <AlertTriangle className="size-8 text-destructive" />
              </motion.div>
              <h2 className="mb-2 text-xl font-semibold">
                Không thể bắt đầu bài thi
              </h2>
              <p className="mb-6 text-muted-foreground">
                {startExam.error?.message || "Đã có lỗi xảy ra"}
              </p>
              <Link href="/exams">
                <Button className="glow-effect cursor-pointer transition-all duration-200 hover:scale-[1.02]">
                  <ArrowLeft className="mr-2 size-4" />
                  Quay lại danh sách
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Fullscreen prompt
  if (showFullscreenPrompt && isSupported && attemptId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div variants={fadeInScale} initial="hidden" animate="visible">
          <Card className="w-full max-w-md overflow-hidden border-2">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-accent" />
            <CardContent className="space-y-6 pt-8 text-center">
              <motion.div
                variants={floatAnimation}
                animate="animate"
                className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10"
              >
                <Maximize className="size-8 text-primary" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Chế độ toàn màn hình</h2>
                <p className="text-muted-foreground">
                  Để đảm bảo tính công bằng, bài thi sẽ được thực hiện ở chế độ
                  toàn màn hình. Việc thoát khỏi chế độ này sẽ được ghi lại.
                </p>
              </div>

              {/* Security note */}
              <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <Shield className="size-4 shrink-0" />
                <span>Bài thi được bảo vệ bởi hệ thống giám sát tự động</span>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleSkipFullscreen}
                  className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                >
                  Bỏ qua
                </Button>
                <Button
                  onClick={handleEnterFullscreen}
                  className="glow-effect cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                >
                  <Maximize className="mr-2 size-4" />
                  Bật toàn màn hình
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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

      <main className="container mx-auto max-w-4xl px-4 py-6">
        {/* Violation Warning with animation */}
        {warningLevel !== "none" && !dismissedWarning && (
          <motion.div
            variants={fadeInDown}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <ViolationWarning onDismiss={() => setDismissedWarning(true)} />
          </motion.div>
        )}

        <motion.div
          variants={springItem}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* SQL Part */}
          {examData.sql_part && <SqlPartForm sqlPart={examData.sql_part} />}

          {/* Testing Part */}
          {examData.testing_part && (
            <TestingPartForm testingPart={examData.testing_part} />
          )}
        </motion.div>
      </main>

      {/* Submit Confirmation */}
      <SubmitConfirmDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleConfirmSubmit}
        isSubmitting={submitExam.isPending}
        remainingTime={formattedTime}
      />

      {/* Violation Blocking Dialog - shown at 3-4 violations */}
      <ViolationBlockingDialog
        open={showBlockingDialog}
        onAcknowledge={handleAcknowledgeViolation}
        remainingWarnings={5 - violations.length}
      />
    </div>
  );
}
