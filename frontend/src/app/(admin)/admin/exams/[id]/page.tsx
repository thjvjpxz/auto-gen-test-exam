"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Target,
  FileText,
  Database,
  TestTube,
  Globe,
  GlobeLock,
  Trash2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useExam, usePublishExam, useUnpublishExam, useDeleteExam } from "@/hooks/exam";
import { MermaidRenderer } from "@/components/exam/mermaid-renderer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ExamType } from "@/types";

const examTypeLabels: Record<ExamType, string> = {
  sql_testing: "SQL + Testing",
  sql_only: "Chỉ SQL",
  testing_only: "Chỉ Testing",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExamDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const examId = parseInt(id, 10);
  const { data: exam, isLoading, error } = useExam(examId);
  const publishMutation = usePublishExam();
  const unpublishMutation = useUnpublishExam();
  const deleteMutation = useDeleteExam();

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(examId);
      toast.success("Đã xuất bản đề thi");
    } catch {
      toast.error("Không thể xuất bản đề thi");
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishMutation.mutateAsync(examId);
      toast.success("Đã hủy xuất bản đề thi");
    } catch {
      toast.error("Không thể hủy xuất bản đề thi");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa đề thi này? Hành động này không thể hoàn tác.")) return;
    try {
      await deleteMutation.mutateAsync(examId);
      toast.success("Đã xóa đề thi");
      router.push("/admin/exams");
    } catch {
      toast.error("Không thể xóa đề thi");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-xl font-heading font-semibold text-slate-900">
          Không tìm thấy đề thi
        </h2>
        <p className="mt-2 text-slate-500">
          Đề thi này không tồn tại hoặc đã bị xóa
        </p>
        <Button asChild className="mt-4 cursor-pointer">
          <Link href="/admin/exams">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        asChild
        className="-ml-2 text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <Link href="/admin/exams">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-heading font-bold text-slate-900">
              {exam.title}
            </h1>
            <Badge
              className={
                exam.is_published
                  ? "bg-green-100 text-green-800"
                  : "bg-slate-100 text-slate-700"
              }
            >
              {exam.is_published ? "Đã xuất bản" : "Bản nháp"}
            </Badge>
          </div>
          {exam.subject && (
            <p className="text-lg text-slate-600">{exam.subject}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {examTypeLabels[exam.exam_type]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {exam.duration} phút
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Điểm đạt: {exam.passing_score}%
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(exam.created_at)}
            </span>
            {exam.ai_generated && (
              <span className="flex items-center gap-1 text-blue-600">
                <Sparkles className="h-4 w-4" />
                AI Generated ({exam.gemini_model})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {exam.is_published ? (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={unpublishMutation.isPending}
              className="cursor-pointer"
            >
              <GlobeLock className="mr-2 h-4 w-4" />
              Hủy xuất bản
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              <Globe className="mr-2 h-4 w-4" />
              Xuất bản
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <Separator />

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="cursor-pointer">
            Tổng quan
          </TabsTrigger>
          {exam.exam_data?.sql_part && (
            <TabsTrigger value="sql" className="cursor-pointer">
              <Database className="mr-2 h-4 w-4" />
              Phần SQL
            </TabsTrigger>
          )}
          {exam.exam_data?.testing_part && (
            <TabsTrigger value="testing" className="cursor-pointer">
              <TestTube className="mr-2 h-4 w-4" />
              Phần Testing
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Loại đề</p>
                    <p className="font-medium text-slate-900">
                      {examTypeLabels[exam.exam_type]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Thời gian</p>
                    <p className="font-medium text-slate-900">{exam.duration} phút</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Điểm đạt</p>
                    <p className="font-medium text-slate-900">{exam.passing_score}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Câu hỏi SQL</p>
                    <p className="font-medium text-slate-900">
                      {exam.exam_data?.sql_part?.questions?.length ?? 0} câu
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {exam.settings && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium">Cài đặt</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <dt className="text-sm text-slate-500">Cho phép xem lại</dt>
                    <dd className="font-medium text-slate-900">
                      {exam.settings.allow_review ? "Có" : "Không"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Hiện đáp án mẫu</dt>
                    <dd className="font-medium text-slate-900">
                      {exam.settings.show_sample_solution ? "Có" : "Không"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Số lần làm tối đa</dt>
                    <dd className="font-medium text-slate-900">
                      {exam.settings.max_attempts ?? "Không giới hạn"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SQL Tab */}
        {exam.exam_data?.sql_part && (
          <TabsContent value="sql" className="space-y-6">
            {/* ERD Diagram */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Sơ đồ ERD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MermaidRenderer chart={exam.exam_data.sql_part.mermaid_code} />
              </CardContent>
            </Card>

            {/* SQL Questions */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Câu hỏi SQL ({exam.exam_data.sql_part.questions.length} câu)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exam.exam_data.sql_part.questions.map((question, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-slate-900 whitespace-pre-wrap">{question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Testing Tab */}
        {exam.exam_data?.testing_part && (
          <TabsContent value="testing" className="space-y-6">
            {/* Scenario */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Kịch bản kiểm thử
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-900 whitespace-pre-wrap">
                  {exam.exam_data.testing_part.scenario}
                </p>
              </CardContent>
            </Card>

            {/* Rules Table */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Bảng quy tắc
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Điều kiện</TableHead>
                      <TableHead className="font-semibold">Kết quả</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exam.exam_data.testing_part.rules_table.map((rule, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-slate-900">
                          {rule.condition}
                        </TableCell>
                        <TableCell className="text-slate-900">
                          {rule.result}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Question */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Câu hỏi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-900 whitespace-pre-wrap">
                  {exam.exam_data.testing_part.question}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
