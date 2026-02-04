"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Globe,
  GlobeLock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useExams,
  usePublishExam,
  useUnpublishExam,
  useDeleteExam,
} from "@/hooks/exam";
import type { ExamType, ExamListParams } from "@/types";
import { toast } from "sonner";
import { fadeInDown, springItem } from "@/lib/motion";

const ITEMS_PER_PAGE = 10;

const examTypeLabels: Record<ExamType, string> = {
  sql_testing: "SQL + Testing",
  sql_only: "Chỉ SQL",
  testing_only: "Chỉ Testing",
};

export default function ExamListPage() {
  const [filters, setFilters] = useState<ExamListParams>({
    skip: 0,
    limit: ITEMS_PER_PAGE,
  });

  const { data, isLoading } = useExams(filters);
  const publishMutation = usePublishExam();
  const unpublishMutation = useUnpublishExam();
  const deleteMutation = useDeleteExam();

  const currentPage = Math.floor((filters.skip || 0) / ITEMS_PER_PAGE) + 1;
  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const handleFilterChange = (key: keyof ExamListParams, value: string) => {
    setFilters((prev) => ({
      ...prev,
      skip: 0,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      skip: (page - 1) * ITEMS_PER_PAGE,
    }));
  };

  const handlePublish = async (examId: number) => {
    try {
      await publishMutation.mutateAsync(examId);
      toast.success("Đã xuất bản đề thi");
    } catch {
      toast.error("Không thể xuất bản đề thi");
    }
  };

  const handleUnpublish = async (examId: number) => {
    try {
      await unpublishMutation.mutateAsync(examId);
      toast.success("Đã hủy xuất bản đề thi");
    } catch {
      toast.error("Không thể hủy xuất bản đề thi");
    }
  };

  const handleDelete = async (examId: number) => {
    if (!confirm("Bạn có chắc muốn xóa đề thi này?")) return;
    try {
      await deleteMutation.mutateAsync(examId);
      toast.success("Đã xóa đề thi");
    } catch {
      toast.error("Không thể xóa đề thi");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Danh sách đề thi
          </h1>
          <p className="mt-1 text-muted-foreground">
            Quản lý tất cả đề thi trong hệ thống
          </p>
        </div>
        <Button
          asChild
          className="glow-effect cursor-pointer bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90"
        >
          <Link href="/admin/exams/generate">
            <Sparkles className="mr-2 size-4" />
            Sinh đề mới
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={springItem} initial="hidden" animate="visible">
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Filter className="size-4 text-primary" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Select
                value={filters.exam_type || "all"}
                onValueChange={(value) =>
                  handleFilterChange("exam_type", value)
                }
              >
                <SelectTrigger className="w-full cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/20 sm:w-48">
                  <SelectValue placeholder="Loại đề thi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    Tất cả loại
                  </SelectItem>
                  <SelectItem value="sql_testing" className="cursor-pointer">
                    SQL + Testing
                  </SelectItem>
                  <SelectItem value="sql_only" className="cursor-pointer">
                    Chỉ SQL
                  </SelectItem>
                  <SelectItem value="testing_only" className="cursor-pointer">
                    Chỉ Testing
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  filters.is_published === undefined
                    ? "all"
                    : filters.is_published
                      ? "true"
                      : "false"
                }
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    skip: 0,
                    is_published:
                      value === "all" ? undefined : value === "true",
                  }))
                }
              >
                <SelectTrigger className="w-full cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/20 sm:w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    Tất cả trạng thái
                  </SelectItem>
                  <SelectItem value="true" className="cursor-pointer">
                    Đã xuất bản
                  </SelectItem>
                  <SelectItem value="false" className="cursor-pointer">
                    Bản nháp
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">
                  Tiêu đề
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Loại
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  Thời gian
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground">
                  Điểm đạt
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Trạng thái
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Ngày tạo
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="mx-auto h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="mx-auto h-5 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                        <Search className="size-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Không có đề thi nào
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Bắt đầu bằng cách sinh đề thi đầu tiên
                        </p>
                      </div>
                      <Button
                        asChild
                        className="mt-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      >
                        <Link href="/admin/exams/generate">
                          <Sparkles className="mr-2 size-4" />
                          Sinh đề đầu tiên
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((exam, index) => (
                  <TableRow
                    key={exam.id}
                    className="group cursor-pointer transition-colors duration-150 hover:bg-muted/50"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell>
                      <Link
                        href={`/admin/exams/${exam.id}`}
                        className="font-medium text-foreground transition-colors duration-200 group-hover:text-primary"
                      >
                        {exam.title}
                      </Link>
                      {exam.subject && (
                        <p className="text-sm text-muted-foreground">
                          {exam.subject}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-primary/20 font-normal"
                      >
                        {examTypeLabels[exam.exam_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {exam.duration} phút
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {exam.passing_score}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          exam.is_published
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-muted text-muted-foreground hover:bg-muted"
                        }
                      >
                        {exam.is_published ? "Đã xuất bản" : "Bản nháp"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(exam.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/admin/exams/${exam.id}`}>
                              <Eye className="mr-2 size-4" />
                              Xem chi tiết
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {exam.is_published ? (
                            <DropdownMenuItem
                              onClick={() => handleUnpublish(exam.id)}
                              className="cursor-pointer"
                            >
                              <GlobeLock className="mr-2 size-4" />
                              Hủy xuất bản
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handlePublish(exam.id)}
                              className="cursor-pointer"
                            >
                              <Globe className="mr-2 size-4" />
                              Xuất bản
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(exam.id)}
                            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Hiển thị {(filters.skip || 0) + 1} -{" "}
            {Math.min((filters.skip || 0) + ITEMS_PER_PAGE, data.total)} trong
            tổng số {data.total} đề thi
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="size-8 cursor-pointer transition-all duration-200 hover:border-primary/50"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[100px] text-center text-sm font-medium text-foreground">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="size-8 cursor-pointer transition-all duration-200 hover:border-primary/50"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
