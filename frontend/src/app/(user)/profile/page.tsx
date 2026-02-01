"use client";

import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth";
import { useMyAttempts } from "@/hooks/attempt";
import type { UserAttemptHistoryItem } from "@/types";

/**
 * Profile page showing user info and exam history.
 * Style: Flat Design Professional - minimal, clean, typography-focused.
 */
export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: attemptsData, isLoading, error } = useMyAttempts();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getExamTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sql_testing: "SQL + Testing",
      sql_only: "SQL",
      testing_only: "Testing",
    };
    return labels[type] || type;
  };

  const passedCount = attemptsData?.items.filter((a) => a.passed).length ?? 0;
  const totalCount = attemptsData?.total ?? 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hồ sơ</h1>
        <p className="text-muted-foreground mt-1">
          Thông tin cá nhân và lịch sử làm bài
        </p>
      </div>

      {/* User Info Card */}
      <Card className="border border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {user?.name}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalCount}
                </p>
                <p className="text-sm text-muted-foreground">Bài đã làm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {passedCount}
                </p>
                <p className="text-sm text-muted-foreground">Bài đạt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalCount > 0
                    ? Math.round((passedCount / totalCount) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Tỷ lệ đạt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam History */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Lịch sử làm bài
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Không thể tải lịch sử làm bài
              </p>
            </div>
          ) : !attemptsData?.items.length ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-base font-medium text-foreground">
                Chưa có bài làm nào
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Bắt đầu làm bài thi để xem lịch sử tại đây
              </p>
              <Link href="/exams">
                <Button className="mt-4 cursor-pointer">Xem bài thi</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {attemptsData.items.map((attempt: UserAttemptHistoryItem) => (
                <AttemptRow
                  key={attempt.id}
                  attempt={attempt}
                  formatDate={formatDate}
                  formatDuration={formatDuration}
                  getExamTypeLabel={getExamTypeLabel}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface AttemptRowProps {
  attempt: UserAttemptHistoryItem;
  formatDate: (date: string | null) => string;
  formatDuration: (seconds: number | null) => string;
  getExamTypeLabel: (type: string) => string;
}

function AttemptRow({
  attempt,
  formatDate,
  formatDuration,
  getExamTypeLabel,
}: AttemptRowProps) {
  return (
    <div className="flex items-center gap-4 py-4 hover:bg-muted/30 transition-colors duration-150 -mx-4 px-4 cursor-pointer">
      {/* Status Icon */}
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
          attempt.passed ? "bg-green-50" : "bg-red-50"
        }`}
      >
        {attempt.passed ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
      </div>

      {/* Exam Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate">
            {attempt.exam_title}
          </h4>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {getExamTypeLabel(attempt.exam_type)}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(attempt.time_taken)}
          </span>
          <span>{formatDate(attempt.submitted_at)}</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <p
          className={`text-lg font-semibold ${
            attempt.passed ? "text-green-600" : "text-red-600"
          }`}
        >
          {attempt.percentage?.toFixed(0) ?? 0}%
        </p>
        <p className="text-xs text-muted-foreground">
          {attempt.score}/{attempt.max_score}
        </p>
      </div>

      {/* Action */}
      <Link href={`/exams/${attempt.exam_id}/result/${attempt.id}`}>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer hover:bg-muted"
        >
          <Eye className="h-4 w-4 mr-1" />
          Chi tiết
        </Button>
      </Link>
    </div>
  );
}
