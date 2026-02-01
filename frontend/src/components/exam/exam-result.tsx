"use client";

import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  Clock,
  Shield,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ExamSubmitResponse } from "@/types";

interface ExamResultProps {
  result: ExamSubmitResponse;
}

/**
 * Exam result display with score breakdown and AI feedback.
 */
export function ExamResult({ result }: ExamResultProps) {
  const { grading } = result;
  const passed = result.passed;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card
        className={cn(
          "border-2",
          passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50",
        )}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {passed ? (
                <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <h2
                  className={cn(
                    "text-2xl font-bold",
                    passed ? "text-green-700" : "text-red-700",
                  )}
                >
                  {passed ? "Chúc mừng! Bạn đã đậu!" : "Chưa đạt yêu cầu"}
                </h2>
                <p className="text-muted-foreground">{result.exam_title}</p>
              </div>
            </div>

            <div className="text-center">
              <div
                className={cn(
                  "text-5xl font-bold",
                  passed ? "text-green-600" : "text-red-600",
                )}
              >
                {result.percentage}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {result.score}/{result.max_score} điểm
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-sm text-muted-foreground">Thời gian</p>
            <p className="font-semibold">{formatTime(result.time_taken)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Shield className="h-6 w-6 mx-auto text-purple-600 mb-2" />
            <p className="text-sm text-muted-foreground">Điểm tin cậy</p>
            <p className="font-semibold">{result.trust_score}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
            <p className="text-sm text-muted-foreground">Vi phạm</p>
            <p className="font-semibold">{result.violation_count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            {result.flagged_for_review ? (
              <XCircle className="h-6 w-6 mx-auto text-red-600 mb-2" />
            ) : (
              <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
            )}
            <p className="text-sm text-muted-foreground">Trạng thái</p>
            <p className="font-semibold">
              {result.flagged_for_review ? "Cần xem xét" : "Hợp lệ"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết điểm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SQL Part */}
          {grading.sql_part && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Phần SQL</h3>
                <span className="text-sm font-semibold">
                  {grading.sql_part.total_score}/{grading.sql_part.max_score}
                </span>
              </div>
              <Progress
                value={
                  (grading.sql_part.total_score / grading.sql_part.max_score) *
                  100
                }
                className="h-2"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {grading.sql_part.question_1 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">Câu 1</p>
                    <p className="text-muted-foreground">
                      {grading.sql_part.question_1.feedback}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {grading.sql_part.question_1.correct_syntax && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          Cú pháp đúng
                        </span>
                      )}
                      {grading.sql_part.question_1.logic_correct && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          Logic đúng
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {grading.sql_part.question_2 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">Câu 2</p>
                    <p className="text-muted-foreground">
                      {grading.sql_part.question_2.feedback}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {grading.sql_part.question_2.correct_syntax && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          Cú pháp đúng
                        </span>
                      )}
                      {grading.sql_part.question_2.logic_correct && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          Logic đúng
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Testing Part */}
          {grading.testing_part && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Phần Testing</h3>
                <span className="text-sm font-semibold">
                  {grading.testing_part.total_score}/
                  {grading.testing_part.max_score}
                </span>
              </div>
              <Progress
                value={
                  (grading.testing_part.total_score /
                    grading.testing_part.max_score) *
                  100
                }
                className="h-2"
              />
              <div className="p-3 bg-slate-50 rounded-lg text-sm">
                <p className="text-muted-foreground mb-2">
                  {grading.testing_part.feedback}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      grading.testing_part.technique_correct
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    Kỹ thuật:{" "}
                    {grading.testing_part.technique_correct ? "Đúng" : "Sai"}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                    Giải thích: {grading.testing_part.explanation_score} điểm
                  </span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                    Test cases: {grading.testing_part.test_cases_score} điểm
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Nhận xét từ AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{grading.overall_feedback}</p>

          {grading.strengths && grading.strengths.length > 0 && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Điểm mạnh
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {grading.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {grading.improvements && grading.improvements.length > 0 && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Cần cải thiện
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {grading.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
