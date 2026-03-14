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
  Lightbulb,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  useExam,
  usePublishExam,
  useUnpublishExam,
  useDeleteExam,
  useRegenerateHints,
} from "@/hooks/exam";
import { MermaidRenderer } from "@/components/exam/mermaid-renderer";
import { ExamSettingsEditor } from "@/components/admin/exam-settings-editor";
import { ExamBasicInfoEditor } from "@/components/admin/exam-basic-info-editor";
import { HintCatalogPreview } from "@/components/admin/hint-catalog-preview";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ExamType } from "@/types";
import { fadeInDown, springItem } from "@/lib/motion";

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
  const { regenerate: regenerateHints, isRegenerating } = useRegenerateHints();

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
    if (
      !confirm(
        "Bạn có chắc muốn xóa đề thi này? Hành động này không thể hoàn tác.",
      )
    )
      return;
    try {
      await deleteMutation.mutateAsync(examId);
      toast.success("Đã xóa đề thi");
      router.push("/admin/exams");
    } catch {
      toast.error("Không thể xóa đề thi");
    }
  };

  const handleRegenerateHints = async () => {
    if (
      !confirm(
        "Gen lại toàn bộ hints cho đề thi này?\n\nHints đã mua bởi sinh viên sẽ KHÔNG bị thay đổi. Chỉ các lần mua hints SAU mới dùng nội dung mới.",
      )
    )
      return;
    try {
      await regenerateHints(examId);
      toast.success("Đã gen lại hints thành công!");
    } catch {
      toast.error("Không thể gen lại hints");
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
        <div className="space-y-3">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Không tìm thấy đề thi
          </h2>
          <p className="mt-1 text-muted-foreground">
            Đề thi này không tồn tại hoặc đã bị xóa
          </p>
        </div>
        <Button asChild className="mt-2 cursor-pointer">
          <Link href="/admin/exams">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div variants={fadeInDown} initial="hidden" animate="visible">
        <Button
          variant="ghost"
          asChild
          className="-ml-2 cursor-pointer text-muted-foreground transition-all duration-200 hover:text-foreground"
        >
          <Link href="/admin/exams">
            <ArrowLeft className="mr-2 size-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              {exam.title}
            </h1>
            <Badge
              className={
                exam.is_published
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-muted text-muted-foreground hover:bg-muted"
              }
            >
              {exam.is_published ? "Đã xuất bản" : "Bản nháp"}
            </Badge>
          </div>
          {exam.subject && (
            <p className="text-lg text-muted-foreground">{exam.subject}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
              <FileText className="size-4" />
              {examTypeLabels[exam.exam_type]}
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
              <Clock className="size-4" />
              {exam.duration} phút
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
              <Target className="size-4" />
              Điểm đạt: {exam.passing_score}%
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
              <Calendar className="size-4" />
              {formatDate(exam.created_at)}
            </span>
            {exam.ai_generated && (
              <span className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary">
                <Sparkles className="size-4" />
                AI Generated ({exam.gemini_model})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerateHints}
            disabled={isRegenerating}
            className="cursor-pointer transition-all duration-200 hover:border-primary/50 hover:text-primary"
          >
            <RefreshCw
              className={`mr-2 size-4 ${isRegenerating ? "animate-spin" : ""}`}
            />
            {isRegenerating ? "Đang gen..." : "Gen lại Hints"}
          </Button>
          {exam.is_published ? (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={unpublishMutation.isPending}
              className="cursor-pointer transition-all duration-200 hover:border-amber-500/50 hover:text-amber-600"
            >
              <GlobeLock className="mr-2 size-4" />
              Hủy xuất bản
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="glow-effect cursor-pointer bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90"
            >
              <Globe className="mr-2 size-4" />
              Xuất bản
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="cursor-pointer transition-all duration-200 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Xóa
          </Button>
        </div>
      </motion.div>

      <Separator />

      {/* Content Tabs */}
      <motion.div variants={springItem} initial="hidden" animate="visible">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start bg-muted/50">
            <TabsTrigger
              value="overview"
              className="cursor-pointer data-[state=active]:bg-background"
            >
              Tổng quan
            </TabsTrigger>
            {exam.exam_data?.sql_part && (
              <TabsTrigger
                value="sql"
                className="cursor-pointer data-[state=active]:bg-background"
              >
                <Database className="mr-2 size-4" />
                Phần SQL
              </TabsTrigger>
            )}
            {exam.exam_data?.testing_part && (
              <TabsTrigger
                value="testing"
                className="cursor-pointer data-[state=active]:bg-background"
              >
                <TestTube className="mr-2 size-4" />
                Phần Testing
              </TabsTrigger>
            )}
            {exam.exam_data?.hints_catalog && (
              <TabsTrigger
                value="hints"
                className="cursor-pointer data-[state=active]:bg-background"
              >
                <Lightbulb className="mr-2 size-4" />
                Gợi ý (Hints)
              </TabsTrigger>
            )}
            {exam.exam_data?.model_answers && (
              <TabsTrigger
                value="answers"
                className="cursor-pointer data-[state=active]:bg-background"
              >
                <BookOpen className="mr-2 size-4" />
                Đáp án mẫu
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Basic Info Editor */}
            <ExamBasicInfoEditor
              examId={examId}
              title={exam.title}
              subject={exam.subject}
              duration={exam.duration}
              passingScore={exam.passing_score}
            />

            {/* Exam Settings Editor */}
            <ExamSettingsEditor examId={examId} settings={exam.settings} />
          </TabsContent>

          {/* SQL Tab */}
          {exam.exam_data?.sql_part && (
            <TabsContent value="sql" className="space-y-6">
              {/* ERD Diagram */}
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <Database className="size-4 text-primary" />
                    Sơ đồ ERD
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <MermaidRenderer
                    chart={
                      exam.exam_data.sql_part.mermaid_code ??
                      exam.exam_data.sql_part.erd_diagram ??
                      ""
                    }
                  />
                </CardContent>
              </Card>

              {/* SQL Questions */}
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base font-medium">
                    Câu hỏi SQL (
                    {exam.exam_data.sql_part.questions?.length ?? 0} câu)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {(exam.exam_data.sql_part.questions ?? []).map(
                      (question, index) => (
                        <div
                          key={index}
                          className="group rounded-lg border bg-muted/30 p-4 transition-all duration-200 hover:bg-muted/50"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-medium text-white shadow-sm">
                              {index + 1}
                            </span>
                            <p className="whitespace-pre-wrap text-foreground">
                              {question}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Testing Tab */}
          {exam.exam_data?.testing_part && (
            <TabsContent value="testing" className="space-y-6">
              {/* Scenario */}
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <TestTube className="size-4 text-primary" />
                    Kịch bản kiểm thử
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                    {exam.exam_data.testing_part.scenario}
                  </p>
                </CardContent>
              </Card>

              {/* Rules Table */}
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base font-medium">
                    Bảng quy tắc
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold text-foreground">
                          Điều kiện
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Kết quả
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(exam.exam_data.testing_part.rules_table ?? []).map(
                        (rule, index) => (
                          <TableRow
                            key={index}
                            className="transition-colors duration-150 hover:bg-muted/50"
                          >
                            <TableCell className="text-foreground">
                              {rule.condition}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {rule.result}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Question */}
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base font-medium">
                    Câu hỏi
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="whitespace-pre-wrap text-foreground">
                    {exam.exam_data.testing_part.question}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Hints Tab */}
          {exam.exam_data?.hints_catalog && (
            <TabsContent value="hints" className="space-y-6">
              <HintCatalogPreview hintsCatalog={exam.exam_data.hints_catalog} />
            </TabsContent>
          )}

          {/* Model Answers Tab */}
          {exam.exam_data?.model_answers && (
            <TabsContent value="answers" className="space-y-6">
              {/* SQL Model Answers */}
              {exam.exam_data.model_answers.sql_part && (
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      <Database className="size-4 text-primary" />
                      Đáp án SQL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {exam.exam_data.model_answers.sql_part
                      .question_1_answer && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                          Câu 1
                        </h4>
                        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
                          <code>
                            {
                              exam.exam_data.model_answers.sql_part
                                .question_1_answer
                            }
                          </code>
                        </pre>
                      </div>
                    )}
                    {exam.exam_data.model_answers.sql_part
                      .question_2_answer && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                          Câu 2
                        </h4>
                        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
                          <code>
                            {
                              exam.exam_data.model_answers.sql_part
                                .question_2_answer
                            }
                          </code>
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Testing Model Answers */}
              {exam.exam_data.model_answers.testing_part && (
                <div className="space-y-6">
                  {/* Technique & Reasoning */}
                  <Card className="overflow-hidden border-0 shadow-sm">
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <TestTube className="size-4 text-primary" />
                        Kỹ thuật kiểm thử kỳ vọng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                          {
                            exam.exam_data.model_answers.testing_part
                              .expected_technique
                          }
                        </Badge>
                      </div>
                      {exam.exam_data.model_answers.testing_part
                        .technique_reasoning && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {
                            exam.exam_data.model_answers.testing_part
                              .technique_reasoning
                          }
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Equivalence Classes */}
                  {exam.exam_data.model_answers.testing_part
                    .equivalence_classes && (
                    <Card className="overflow-hidden border-0 shadow-sm">
                      <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="text-base font-medium">
                          Lớp tương đương / Giá trị biên
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          {exam.exam_data.model_answers.testing_part.equivalence_classes.map(
                            (ec, index) => (
                              <div
                                key={index}
                                className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm text-foreground"
                              >
                                {ec}
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Expected Test Cases */}
                  {exam.exam_data.model_answers.testing_part
                    .expected_test_cases && (
                    <Card className="overflow-hidden border-0 shadow-sm">
                      <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="text-base font-medium">
                          Test Cases mẫu (
                          {
                            exam.exam_data.model_answers.testing_part
                              .expected_test_cases.length
                          }
                          )
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableHead className="w-[70px] font-semibold text-foreground">
                                TC_ID
                              </TableHead>
                              <TableHead className="font-semibold text-foreground">
                                Mô tả
                              </TableHead>
                              <TableHead className="font-semibold text-foreground">
                                Input
                              </TableHead>
                              <TableHead className="font-semibold text-foreground">
                                Expected Output
                              </TableHead>
                              <TableHead className="w-[100px] font-semibold text-foreground">
                                Loại
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {exam.exam_data.model_answers.testing_part.expected_test_cases.map(
                              (tc) => (
                                <TableRow
                                  key={tc.tc_id}
                                  className="transition-colors duration-150 hover:bg-muted/50"
                                >
                                  <TableCell className="font-mono text-xs">
                                    {tc.tc_id}
                                  </TableCell>
                                  <TableCell className="text-foreground">
                                    {tc.description}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs text-foreground">
                                    {tc.input}
                                  </TableCell>
                                  <TableCell className="text-foreground">
                                    {tc.expected_output}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        tc.type === "Valid"
                                          ? "border-green-200 bg-green-50 text-green-700"
                                          : tc.type === "Boundary"
                                            ? "border-amber-200 bg-amber-50 text-amber-700"
                                            : "border-red-200 bg-red-50 text-red-700"
                                      }
                                    >
                                      {tc.type}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Coverage Requirements */}
                  {exam.exam_data.model_answers.testing_part
                    .coverage_requirements && (
                    <Card className="overflow-hidden border-0 shadow-sm">
                      <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="text-base font-medium">
                          Yêu cầu Coverage
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex gap-4">
                          <div className="rounded-lg border bg-green-50 px-4 py-2 text-center">
                            <p className="text-2xl font-bold text-green-700">
                              {
                                exam.exam_data.model_answers.testing_part
                                  .coverage_requirements.min_valid_cases
                              }
                            </p>
                            <p className="text-xs text-green-600">Min Valid</p>
                          </div>
                          <div className="rounded-lg border bg-red-50 px-4 py-2 text-center">
                            <p className="text-2xl font-bold text-red-700">
                              {
                                exam.exam_data.model_answers.testing_part
                                  .coverage_requirements.min_invalid_cases
                              }
                            </p>
                            <p className="text-xs text-red-600">Min Invalid</p>
                          </div>
                          <div className="rounded-lg border bg-amber-50 px-4 py-2 text-center">
                            <p className="text-2xl font-bold text-amber-700">
                              {
                                exam.exam_data.model_answers.testing_part
                                  .coverage_requirements.min_boundary_cases
                              }
                            </p>
                            <p className="text-xs text-amber-600">
                              Min Boundary
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
}
