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
  Target,
  Award,
  FileCode,
  ClipboardList,
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
          "animate-fade-in-scale overflow-hidden border-2 shadow-lg",
          passed
            ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50"
            : "border-red-400 bg-gradient-to-br from-red-50 to-orange-50",
        )}
      >
        {/* Top accent bar */}
        <div
          className={cn(
            "h-1.5",
            passed
              ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"
              : "bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500",
          )}
        />
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-5">
              {/* Animated icon */}
              <div className="relative">
                <div
                  className={cn(
                    "flex size-20 items-center justify-center rounded-full shadow-lg",
                    passed ? "bg-green-500" : "bg-red-500",
                  )}
                >
                  {passed ? (
                    <Trophy className="size-10 text-white" />
                  ) : (
                    <XCircle className="size-10 text-white" />
                  )}
                </div>
                {passed && (
                  <div className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-yellow-400 shadow-md">
                    <Award className="size-4 text-yellow-800" />
                  </div>
                )}
              </div>
              <div>
                <h2
                  className={cn(
                    "text-2xl font-bold",
                    passed ? "text-green-700" : "text-red-700",
                  )}
                >
                  {passed ? "Chúc mừng! Bạn đã đậu!" : "Chưa đạt yêu cầu"}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {result.exam_title}
                </p>
              </div>
            </div>

            {/* Score display */}
            <div className="text-center">
              <div
                className={cn(
                  "text-6xl font-bold tabular-nums",
                  passed ? "text-green-600" : "text-red-600",
                )}
              >
                {result.percentage}%
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.score}/{result.max_score} điểm
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            icon: Clock,
            label: "Thời gian",
            value: formatTime(result.time_taken),
            color: "blue",
          },
          {
            icon: Shield,
            label: "Điểm tin cậy",
            value: `${result.trust_score}%`,
            color: "purple",
          },
          {
            icon: AlertTriangle,
            label: "Vi phạm",
            value: result.violation_count.toString(),
            color: "yellow",
          },
          {
            icon: result.flagged_for_review ? XCircle : CheckCircle,
            label: "Trạng thái",
            value: result.flagged_for_review ? "Cần xem xét" : "Hợp lệ",
            color: result.flagged_for_review ? "red" : "green",
          },
        ].map((stat, index) => (
          <Card
            key={stat.label}
            className="group overflow-hidden transition-all duration-300 hover:shadow-md"
            style={{ animationDelay: `${index * 100 + 200}ms` }}
          >
            <CardContent className="pt-4 text-center">
              <div
                className={cn(
                  "mx-auto mb-3 flex size-12 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110",
                  stat.color === "blue" && "bg-blue-100",
                  stat.color === "purple" && "bg-purple-100",
                  stat.color === "yellow" && "bg-yellow-100",
                  stat.color === "green" && "bg-green-100",
                  stat.color === "red" && "bg-red-100",
                )}
              >
                <stat.icon
                  className={cn(
                    "size-6",
                    stat.color === "blue" && "text-blue-600",
                    stat.color === "purple" && "text-purple-600",
                    stat.color === "yellow" && "text-yellow-600",
                    stat.color === "green" && "text-green-600",
                    stat.color === "red" && "text-red-600",
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score Breakdown */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-primary" />
            Chi tiết điểm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* SQL Part */}
          {grading.sql_part && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-medium">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    1
                  </span>
                  Phần SQL
                </h3>
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {grading.sql_part.question_1 && (
                  <div className="rounded-lg border bg-muted/30 p-4 transition-colors duration-200 hover:bg-muted/50">
                    <p className="mb-2 font-medium">Câu 1</p>
                    <p className="text-sm text-muted-foreground">
                      {grading.sql_part.question_1.feedback}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {grading.sql_part.question_1.correct_syntax && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="size-3" />
                          Cú pháp đúng
                        </span>
                      )}
                      {grading.sql_part.question_1.logic_correct && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          <CheckCircle className="size-3" />
                          Logic đúng
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {grading.sql_part.question_2 && (
                  <div className="rounded-lg border bg-muted/30 p-4 transition-colors duration-200 hover:bg-muted/50">
                    <p className="mb-2 font-medium">Câu 2</p>
                    <p className="text-sm text-muted-foreground">
                      {grading.sql_part.question_2.feedback}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {grading.sql_part.question_2.correct_syntax && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="size-3" />
                          Cú pháp đúng
                        </span>
                      )}
                      {grading.sql_part.question_2.logic_correct && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          <CheckCircle className="size-3" />
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-medium">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    2
                  </span>
                  Phần Testing
                </h3>
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
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
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-3 text-sm text-muted-foreground">
                  {grading.testing_part.feedback}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      grading.testing_part.technique_correct
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {grading.testing_part.technique_correct ? (
                      <CheckCircle className="size-3" />
                    ) : (
                      <XCircle className="size-3" />
                    )}
                    Kỹ thuật:{" "}
                    {grading.testing_part.technique_correct ? "Đúng" : "Sai"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    Giải thích: {grading.testing_part.explanation_score} điểm
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                    Test cases: {grading.testing_part.test_cases_score} điểm
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submitted Answers */}
      {result.submitted_answers && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-slate-100">
                <FileCode className="size-4 text-slate-600" />
              </div>
              Bài làm của bạn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* SQL Answers */}
            {result.submitted_answers.sql_part && (
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium text-slate-800">
                  <FileCode className="size-4" />
                  Phần SQL
                </h4>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {result.submitted_answers.sql_part.question_1_answer && (
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <p className="mb-2 text-sm font-medium text-slate-600">
                        Câu 1:
                      </p>
                      <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-sm text-green-400">
                        <code>
                          {result.submitted_answers.sql_part.question_1_answer}
                        </code>
                      </pre>
                    </div>
                  )}
                  {result.submitted_answers.sql_part.question_2_answer && (
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <p className="mb-2 text-sm font-medium text-slate-600">
                        Câu 2:
                      </p>
                      <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-sm text-green-400">
                        <code>
                          {result.submitted_answers.sql_part.question_2_answer}
                        </code>
                      </pre>
                    </div>
                  )}
                  {!result.submitted_answers.sql_part.question_1_answer &&
                    !result.submitted_answers.sql_part.question_2_answer && (
                      <p className="text-sm italic text-muted-foreground">
                        Không có câu trả lời
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Testing Answers */}
            {result.submitted_answers.testing_part && (
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium text-slate-800">
                  <ClipboardList className="size-4" />
                  Phần Testing
                </h4>
                <div className="space-y-4">
                  {result.submitted_answers.testing_part.technique && (
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <p className="mb-1 text-sm font-medium text-slate-600">
                        Kỹ thuật đã chọn:
                      </p>
                      <p className="font-semibold text-slate-800">
                        {result.submitted_answers.testing_part.technique}
                      </p>
                    </div>
                  )}
                  {result.submitted_answers.testing_part.explanation && (
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <p className="mb-1 text-sm font-medium text-slate-600">
                        Giải thích:
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {result.submitted_answers.testing_part.explanation}
                      </p>
                    </div>
                  )}
                  {result.submitted_answers.testing_part.test_cases &&
                    result.submitted_answers.testing_part.test_cases.length >
                      0 && (
                      <div className="rounded-lg border bg-slate-50 p-4">
                        <p className="mb-2 text-sm font-medium text-slate-600">
                          Test cases (
                          {result.submitted_answers.testing_part.test_cases
                            .length ?? 0}{" "}
                          cases):
                        </p>
                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b bg-slate-100 text-left">
                              <tr>
                                <th className="p-2">#</th>
                                <th className="p-2">Input</th>
                                <th className="p-2">Expected Output</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.submitted_answers.testing_part.test_cases.map(
                                (tc, idx) => (
                                  <tr key={idx} className="border-b">
                                    <td className="p-2 text-muted-foreground">
                                      {idx + 1}
                                    </td>
                                    <td className="p-2">{tc.input}</td>
                                    <td className="p-2">
                                      {tc.expected_output}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  {!result.submitted_answers.testing_part.technique &&
                    !result.submitted_answers.testing_part.explanation &&
                    (!result.submitted_answers.testing_part.test_cases ||
                      result.submitted_answers.testing_part.test_cases
                        .length === 0) && (
                      <p className="text-sm italic text-muted-foreground">
                        Không có câu trả lời
                      </p>
                    )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Feedback */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-yellow-100">
              <Lightbulb className="size-4 text-yellow-600" />
            </div>
            Nhận xét từ AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <p className="text-muted-foreground">{grading.overall_feedback}</p>

          {grading.strengths && grading.strengths.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium text-green-800">
                <TrendingUp className="size-4" />
                Điểm mạnh
              </h4>
              <ul className="space-y-2">
                {grading.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-green-700"
                  >
                    <CheckCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {grading.improvements && grading.improvements.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4">
              <h4 className="mb-3 flex items-center gap-2 font-medium text-yellow-800">
                <AlertTriangle className="size-4" />
                Cần cải thiện
              </h4>
              <ul className="space-y-2">
                {grading.improvements.map((improvement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-yellow-700"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-yellow-500" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
