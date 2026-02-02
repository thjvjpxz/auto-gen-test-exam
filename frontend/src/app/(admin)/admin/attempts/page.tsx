"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  User,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAttempts } from "@/hooks/admin";

export default function AdminAttemptsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const limit = 15;
  const { data, isLoading } = useAdminAttempts({
    skip: page * limit,
    limit,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string, passed: boolean) => {
    if (status === "graded") {
      return passed ? (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle2 className="mr-1 size-3" />
          Đạt
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          <XCircle className="mr-1 size-3" />
          Không đạt
        </Badge>
      );
    }
    if (status === "in_progress") {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Clock className="mr-1 size-3" />
          Đang làm
        </Badge>
      );
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Tất cả bài làm
        </h1>
        <p className="mt-1 text-muted-foreground">
          Xem tất cả lượt làm bài thi của người dùng
        </p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="graded">Đã chấm</SelectItem>
                <SelectItem value="in_progress">Đang làm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attempts Table */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <ClipboardList className="size-5 text-primary" />
            Danh sách bài làm
            {data && (
              <Badge variant="secondary" className="ml-2">
                {data.total}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead>Người dùng</TableHead>
                <TableHead>Đề thi</TableHead>
                <TableHead className="text-center">Điểm</TableHead>
                <TableHead className="text-center">Tin cậy</TableHead>
                <TableHead className="text-center">Kết quả</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-4 w-12" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="size-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Chưa có bài làm nào
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((attempt) => (
                  <TableRow key={attempt.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                          <User className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {attempt.user_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {attempt.user_email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span
                          className="max-w-[200px] truncate"
                          title={attempt.exam_title}
                        >
                          {attempt.exam_title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">
                        {attempt.score.toFixed(1)} /{" "}
                        {attempt.max_score.toFixed(1)}
                      </span>
                      {attempt.percentage !== null && (
                        <span className="ml-1 text-sm text-muted-foreground">
                          ({attempt.percentage.toFixed(0)}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-medium ${getTrustScoreColor(attempt.trust_score)}`}
                      >
                        {attempt.trust_score}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(attempt.status, attempt.passed)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(attempt.submitted_at || attempt.started_at)}
                    </TableCell>
                    <TableCell>
                      {attempt.status === "graded" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Link
                            href={`/exams/${attempt.exam_id}/result/${attempt.id}?from=admin`}
                          >
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {page * limit + 1} -{" "}
                {Math.min((page + 1) * limit, data.total)} / {data.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= data.total}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
