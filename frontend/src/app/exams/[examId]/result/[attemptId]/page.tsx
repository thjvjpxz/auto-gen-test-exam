"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy kết quả
            </h2>
            <p className="text-muted-foreground mb-4">
              Kết quả bài thi không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Link href="/exams">
              <Button className="cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" />
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/exams" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                E
              </span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline">
              Kết quả bài thi
            </span>
          </Link>

          <Link href="/exams">
            <Button variant="outline" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>
      </header>

      {/* Result Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <ExamResult result={result} />
      </main>
    </div>
  );
}
