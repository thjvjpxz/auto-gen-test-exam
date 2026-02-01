"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trophy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExamResult } from "@/components/exam/exam-result";
import { useExamResult } from "@/hooks/attempt";
import { useAuthStore } from "@/stores/auth";

/**
 * Exam result page showing grading and AI feedback.
 */
export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = Number(params.attemptId);

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: result, isLoading, error } = useExamResult(attemptId);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-fade-in-up space-y-4 text-center">
          <div className="relative mx-auto size-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <Loader2 className="absolute inset-0 size-16 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="animate-fade-in-scale w-full max-w-md overflow-hidden border-2">
          <div className="h-1 bg-gradient-to-r from-destructive via-destructive/60 to-transparent" />
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">
              Không tìm thấy kết quả
            </h2>
            <p className="mb-6 text-muted-foreground">
              Kết quả bài thi không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Link href="/exams">
              <Button className="glow-effect cursor-pointer transition-all duration-200 hover:scale-[1.02]">
                <ArrowLeft className="mr-2 size-4" />
                Quay lại danh sách
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with animation */}
      <header className="animate-fade-in-down sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href="/exams"
            className="group flex items-center gap-2 transition-colors duration-200 hover:text-primary"
          >
            <div className="flex size-8 items-center justify-center rounded-md bg-primary transition-transform duration-200 group-hover:scale-105">
              <Trophy className="size-4 text-primary-foreground" />
            </div>
            <span className="hidden font-semibold text-lg sm:inline">
              Kết quả bài thi
            </span>
          </Link>

          <Link href="/exams">
            <Button
              variant="outline"
              className="group cursor-pointer transition-all duration-200 hover:border-primary/50"
            >
              <ArrowLeft className="mr-2 size-4 transition-transform duration-200 group-hover:-translate-x-1" />
              Quay lại
            </Button>
          </Link>
        </div>
      </header>

      {/* Result Content with animation */}
      <main className="container mx-auto max-w-4xl px-4 py-6">
        <div className="animate-fade-in-up animation-delay-200">
          <ExamResult result={result} />
        </div>
      </main>
    </div>
  );
}
