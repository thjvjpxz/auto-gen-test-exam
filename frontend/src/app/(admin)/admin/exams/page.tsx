"use client";

import { useState, useCallback } from "react";
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
  CheckSquare,
  Square,
  MinusSquare,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const { data, isLoading } = useExams(filters);
  const publishMutation = usePublishExam();
  const unpublishMutation = useUnpublishExam();
  const deleteMutation = useDeleteExam();

  const currentPage = Math.floor((filters.skip || 0) / ITEMS_PER_PAGE) + 1;
  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;
  const currentItems = data?.items ?? [];
  const allCurrentIds = currentItems.map((e) => e.id);
  const isAllSelected =
    currentItems.length > 0 && currentItems.every((e) => selectedIds.has(e.id));
  const isSomeSelected =
    currentItems.some((e) => selectedIds.has(e.id)) && !isAllSelected;
  const selectedCount = selectedIds.size;

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (allCurrentIds.every((id) => prev.has(id))) {
        const next = new Set(prev);
        allCurrentIds.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...prev, ...allCurrentIds]);
    });
  }, [allCurrentIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

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

  const handleBatchPublish = async () => {
    const ids = Array.from(selectedIds);
    const unpublished = currentItems.filter(
      (e) => ids.includes(e.id) && !e.is_published,
    );
    if (unpublished.length === 0) {
      toast.info("Tất cả đề đã chọn đều đã được xuất bản");
      return;
    }
    setIsBatchProcessing(true);
    try {
      await Promise.all(
        unpublished.map((e) => publishMutation.mutateAsync(e.id)),
      );
      toast.success(`Đã xuất bản ${unpublished.length} đề thi`);
      clearSelection();
    } catch {
      toast.error("Có lỗi khi xuất bản hàng loạt");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchUnpublish = async () => {
    const ids = Array.from(selectedIds);
    const published = currentItems.filter(
      (e) => ids.includes(e.id) && e.is_published,
    );
    if (published.length === 0) {
      toast.info("Tất cả đề đã chọn đều chưa xuất bản");
      return;
    }
    setIsBatchProcessing(true);
    try {
      await Promise.all(
        published.map((e) => unpublishMutation.mutateAsync(e.id)),
      );
      toast.success(`Đã hủy xuất bản ${published.length} đề thi`);
      clearSelection();
    } catch {
      toast.error("Có lỗi khi hủy xuất bản hàng loạt");
    } finally {
      setIsBatchProcessing(false);
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

      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="size-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Đã chọn {selectedCount} đề thi
                </span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBatchPublish}
                  disabled={isBatchProcessing}
                  className="cursor-pointer gap-1.5 border-green-200 text-green-700 transition-all duration-200 hover:bg-green-50 hover:text-green-800"
                >
                  <Globe className="size-3.5" />
                  Xuất bản
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBatchUnpublish}
                  disabled={isBatchProcessing}
                  className="cursor-pointer gap-1.5 border-amber-200 text-amber-700 transition-all duration-200 hover:bg-amber-50 hover:text-amber-800"
                >
                  <GlobeLock className="size-3.5" />
                  Hủy xuất bản
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSelection}
                  className="cursor-pointer gap-1.5 text-muted-foreground transition-all duration-200 hover:text-foreground"
                >
                  <X className="size-3.5" />
                  Bỏ chọn
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12 pl-4">
                  <button
                    onClick={toggleSelectAll}
                    disabled={currentItems.length === 0}
                    className="flex cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-50"
                    aria-label={
                      isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"
                    }
                  >
                    {isAllSelected ? (
                      <CheckSquare className="size-4 text-primary" />
                    ) : isSomeSelected ? (
                      <MinusSquare className="size-4 text-primary" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </TableHead>
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
                    <TableCell className="pl-4">
                      <Skeleton className="size-4" />
                    </TableCell>
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
                  <TableCell colSpan={8} className="h-48 text-center">
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
                data?.items?.map((exam, index) => {
                  const isSelected = selectedIds.has(exam.id);
                  return (
                    <TableRow
                      key={exam.id}
                      className={`group cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/50"
                      }`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(exam.id)}
                          className="cursor-pointer"
                          aria-label={`Chọn đề thi ${exam.title}`}
                        />
                      </TableCell>
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
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer"
                            >
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
                  );
                })
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
