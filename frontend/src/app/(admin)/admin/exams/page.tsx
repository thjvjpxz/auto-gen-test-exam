"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Globe,
  GlobeLock,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Danh sách đề thi
          </h1>
          <p className="mt-1 text-slate-600">
            Quản lý tất cả đề thi trong hệ thống
          </p>
        </div>
        <Button
          asChild
          className="bg-accent hover:brightness-95 text-accent-foreground cursor-pointer transition-all"
        >
          <Link href="/admin/exams/generate">
            <PlusCircle className="mr-2 h-4 w-4" />
            Sinh đề mới
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={filters.exam_type || "all"}
              onValueChange={(value) => handleFilterChange("exam_type", value)}
            >
              <SelectTrigger className="w-full sm:w-48 cursor-pointer">
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
                  is_published: value === "all" ? undefined : value === "true",
                }))
              }
            >
              <SelectTrigger className="w-full sm:w-48 cursor-pointer">
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

      {/* Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">
                  Tiêu đề
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Loại
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">
                  Thời gian
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">
                  Điểm đạt
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Trạng thái
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
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
                      <Skeleton className="h-5 w-16 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-12 mx-auto" />
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
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-slate-300" />
                      <p className="text-slate-500">Không có đề thi nào</p>
                      <Button asChild className="mt-2 cursor-pointer">
                        <Link href="/admin/exams/generate">
                          Sinh đề đầu tiên
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((exam) => (
                  <TableRow
                    key={exam.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors duration-150"
                  >
                    <TableCell>
                      <Link
                        href={`/admin/exams/${exam.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {exam.title}
                      </Link>
                      {exam.subject && (
                        <p className="text-sm text-slate-500">{exam.subject}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {examTypeLabels[exam.exam_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-slate-600">
                      {exam.duration} phút
                    </TableCell>
                    <TableCell className="text-center text-slate-600">
                      {exam.passing_score}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          exam.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {exam.is_published ? "Đã xuất bản" : "Bản nháp"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(exam.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/admin/exams/${exam.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {exam.is_published ? (
                            <DropdownMenuItem
                              onClick={() => handleUnpublish(exam.id)}
                              className="cursor-pointer"
                            >
                              <GlobeLock className="mr-2 h-4 w-4" />
                              Hủy xuất bản
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handlePublish(exam.id)}
                              className="cursor-pointer"
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              Xuất bản
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(exam.id)}
                            className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
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
              className="h-8 w-8 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
