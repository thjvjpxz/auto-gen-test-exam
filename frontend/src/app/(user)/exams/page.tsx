"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  Clock,
  Play,
  CheckCircle,
  BookOpen,
  Search,
  Trophy,
  Target,
  Calendar,
  XCircle,
  Eye,
  RotateCcw,
  Coins,
  X,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useExams } from "@/hooks/exam";
import { useStartExam, useSubmitExam } from "@/hooks/attempt";
import { ExamConflictDialog } from "@/components/exam/exam-conflict-dialog";
import type {
  ExamListItem,
  ExamConflictResponse,
  AnswersPayload,
} from "@/types";
import { toast } from "sonner";
import {
  staggerContainer,
  springItem,
  fadeInScale,
  floatAnimation,
} from "@/lib/motion";

/**
 * User exam list page - shows published exams available to take.
 */
export default function ExamsPage() {
  const router = useRouter();
  const { data: examsData, isLoading, error } = useExams();
  const [showCoinInfo, setShowCoinInfo] = useState(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("coin-info-dismissed");
      return dismissed !== "true";
    }
    return true;
  });

  const [conflictData, setConflictData] = useState<ExamConflictResponse | null>(
    null,
  );
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingExamId, setPendingExamId] = useState<number | null>(null);

  const startExam = useStartExam();
  const submitExam = useSubmitExam();

  const handleDismissCoinInfo = () => {
    setShowCoinInfo(false);
    localStorage.setItem("coin-info-dismissed", "true");
  };

  const publishedExams =
    examsData?.items?.filter((exam) => exam.is_published) ?? [];

  const handleStartExam = (examId: number) => {
    setPendingExamId(examId);

    startExam.mutate(examId, {
      onSuccess: () => {
        router.push(`/exams/${examId}/take`);
      },
      onError: (error: any) => {
        if (error.response?.status === 409) {
          const conflictDetail = error.response?.data?.detail;
          if (conflictDetail && typeof conflictDetail === "object") {
            setConflictData(conflictDetail as ExamConflictResponse);
            setShowConflictDialog(true);
          }
        }
      },
    });
  };

  const handleContinueExisting = () => {
    if (conflictData) {
      setShowConflictDialog(false);
      router.push(`/exams/${conflictData.existing_exam_id}/take`);
      setConflictData(null);
      setPendingExamId(null);
    }
  };

  const handleForceSubmit = () => {
    if (!conflictData) return;

    const attemptId = conflictData.existing_attempt_id;
    const localDraftKey = `exam_draft_${attemptId}`;
    const savedDraft = localStorage.getItem(localDraftKey);

    let answers: AnswersPayload = {
      sql_part: null,
      testing_part: null,
    };

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        answers = parsed.answers || answers;
      } catch {
        console.warn("Failed to parse saved draft");
      }
    }

    submitExam.mutate(
      { attemptId, answers },
      {
        onSuccess: () => {
          localStorage.removeItem(localDraftKey);
          setShowConflictDialog(false);
          setConflictData(null);

          if (pendingExamId) {
            router.push(`/exams/${pendingExamId}/take`);
          }
        },
        onError: (error) => {
          console.error("Force submit failed:", error);
          toast.error("Không thể nộp bài cũ. Vui lòng thử lại.");
        },
      },
    );
  };

  const getExamTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      sql_testing: "SQL + Testing",
      sql_only: "SQL",
      testing_only: "Testing",
    };
    return typeLabels[type] || type;
  };

  if (error) {
    return (
      <motion.div
        variants={springItem}
        initial="hidden"
        animate="visible"
        className="py-12 text-center"
      >
        <div className="mx-auto max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-6">
          <FileText className="mx-auto mb-4 size-12 text-destructive/60" />
          <p className="mb-4 text-destructive">
            Đã có lỗi xảy ra khi tải danh sách bài thi.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          >
            Thử lại
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div variants={springItem} initial="hidden" animate="visible">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bài thi</h1>
            <p className="mt-0.5 text-muted-foreground">
              Chọn một bài thi để bắt đầu làm
            </p>
          </div>
        </div>
      </motion.div>

      {showCoinInfo && (
        <motion.div
          variants={springItem}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <Card className="relative overflow-hidden border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500" />
            <CardContent className="pt-4">
              <button
                onClick={handleDismissCoinInfo}
                className="absolute right-3 top-3 rounded-md p-1 transition-colors hover:bg-amber-100"
                aria-label="Đóng"
              >
                <X className="size-4 text-amber-600" />
              </button>
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Coins className="size-6 text-amber-600" />
                </div>
                <div className="flex-1 pr-8">
                  <h3 className="flex items-center gap-2 font-semibold text-amber-900">
                    <Lightbulb className="size-4" />
                    Mẹo: Hệ thống Coin
                  </h3>
                  <p className="mt-1 text-sm text-amber-800">
                    Làm bài đạt điểm cao để kiếm coin, sau đó dùng coin để mua
                    gợi ý trong các bài thi tiếp theo!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : publishedExams.length === 0 ? (
        <motion.div variants={fadeInScale} initial="hidden" animate="visible">
          <Card className="py-16 text-center">
            <CardContent>
              <motion.div
                variants={floatAnimation}
                animate="animate"
                className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-muted"
              >
                <Search className="size-10 text-muted-foreground" />
              </motion.div>
              <h3 className="text-xl font-medium">Chưa có bài thi nào</h3>
              <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                Hiện tại không có bài thi nào được công bố. Vui lòng quay lại
                sau.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {publishedExams.map((exam: ExamListItem) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              getExamTypeBadge={getExamTypeBadge}
              onStart={() => handleStartExam(exam.id)}
            />
          ))}
        </motion.div>
      )}

      <ExamConflictDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
        conflictData={conflictData}
        onContinueExisting={handleContinueExisting}
        onForceSubmit={handleForceSubmit}
        isSubmitting={submitExam.isPending}
      />
    </div>
  );
}

interface ExamCardProps {
  exam: ExamListItem;
  getExamTypeBadge: (type: string) => string;
  onStart: () => void;
}

/**
 * Displays an individual exam card with adaptive UI based on user's attempt status.
 */
function ExamCard({ exam, getExamTypeBadge, onStart }: ExamCardProps) {
  const router = useRouter();

  const isCompleted =
    exam.last_attempt_status === "submitted" ||
    exam.last_attempt_status === "graded";
  const isInProgress = exam.last_attempt_status === "in_progress";

  const score = exam.last_attempt_score ?? 0;
  const passed = isCompleted && score >= exam.passing_score;

  const handleViewResult = () => {
    if (exam.last_attempt_id) {
      router.push(`/exams/${exam.id}/result/${exam.last_attempt_id}`);
    }
  };

  const getBorderColor = () => {
    if (!isCompleted) return "border-border";
    return passed
      ? "border-green-500/50 hover:border-green-500/70"
      : "border-amber-500/50 hover:border-amber-500/70";
  };

  const getScoreBadgeClasses = () => {
    if (passed) {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  };

  const formatRelativeTime = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <motion.div variants={springItem}>
      <Card
        className={`hover-lift group flex cursor-pointer flex-col overflow-hidden border-2 transition-all duration-300 ${getBorderColor()}`}
      >
        <div
          className={`h-1 w-full transition-opacity duration-300 ${
            isCompleted
              ? passed
                ? "bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 opacity-100"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 opacity-100"
              : "bg-gradient-to-r from-primary via-primary/60 to-transparent opacity-0 group-hover:opacity-100"
          }`}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold transition-colors duration-200 group-hover:text-primary">
              {exam.title}
            </h3>
            {isCompleted ? (
              <div
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${getScoreBadgeClasses()}`}
              >
                {passed ? (
                  <Trophy className="size-3.5" />
                ) : (
                  <Target className="size-3.5" />
                )}
                <span>{Math.round(score)}%</span>
              </div>
            ) : (
              <Badge
                variant="secondary"
                className="shrink-0 transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary"
              >
                {getExamTypeBadge(exam.exam_type)}
              </Badge>
            )}
          </div>
          {exam.subject && (
            <p className="mt-1 text-sm text-muted-foreground">{exam.subject}</p>
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {isCompleted ? (
                <>
                  <div className="flex items-center gap-1.5 transition-colors duration-200 group-hover:text-foreground">
                    <Calendar className="size-4" />
                    <span>{formatRelativeTime(exam.last_attempt_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passed ? (
                      <>
                        <CheckCircle className="size-4 text-green-600" />
                        <span className="font-medium text-green-700 dark:text-green-400">
                          ĐẬU
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="size-4 text-amber-600" />
                        <span className="font-medium text-amber-700 dark:text-amber-400">
                          CHƯA ĐẠT
                        </span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 transition-colors duration-200 group-hover:text-foreground">
                    <Clock className="size-4" />
                    <span>{exam.duration} phút</span>
                  </div>
                  <div className="flex items-center gap-1.5 transition-colors duration-200 group-hover:text-foreground">
                    <CheckCircle className="size-4" />
                    <span>Đạt: {exam.passing_score}%</span>
                  </div>
                </>
              )}
            </div>
            {isCompleted &&
              exam.recent_attempt_score != null &&
              exam.recent_attempt_score !== exam.last_attempt_score && (
                <p className="text-xs text-muted-foreground/70">
                  Lần thử gần nhất: {Math.round(exam.recent_attempt_score)}% (
                  {formatRelativeTime(exam.recent_attempt_at)})
                </p>
              )}
          </div>
        </CardContent>

        <CardFooter className="gap-2 pt-0">
          {isCompleted ? (
            <>
              <Button
                onClick={handleViewResult}
                variant="outline"
                className="flex-1 cursor-pointer border-primary/30 transition-all duration-200 hover:scale-[1.01] hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <Eye className="mr-2 size-4" />
                Xem chi tiết
              </Button>
              <Button
                onClick={onStart}
                variant="ghost"
                size="icon"
                className="cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                title="Làm lại"
              >
                <RotateCcw className="size-4" />
              </Button>
            </>
          ) : isInProgress ? (
            <Button
              onClick={onStart}
              className="glow-effect w-full cursor-pointer bg-amber-500 transition-all duration-200 hover:scale-[1.01] hover:bg-amber-600"
            >
              <Play className="mr-2 size-4" />
              Tiếp tục làm bài
            </Button>
          ) : (
            <Button
              onClick={onStart}
              className="glow-effect w-full cursor-pointer bg-primary transition-all duration-200 hover:scale-[1.01]"
            >
              <Play className="mr-2 size-4" />
              Bắt đầu thi
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
