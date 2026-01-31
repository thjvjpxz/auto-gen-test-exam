"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useExamGeneration } from "@/hooks/exam";
import type { ExamGenerateFormData, ExamType } from "@/types";
import Link from "next/link";

const generateExamSchema = z.object({
  exam_type: z.enum(["sql_testing", "sql_only", "testing_only"]),
  duration: z
    .number()
    .min(30, "Thời gian tối thiểu 30 phút")
    .max(240, "Thời gian tối đa 240 phút"),
  passing_score: z
    .number()
    .min(0, "Điểm đạt tối thiểu 0%")
    .max(100, "Điểm đạt tối đa 100%"),
  subject: z.string().optional(),
});

type FormData = z.infer<typeof generateExamSchema>;

function getProgressText(progress: number): string {
  if (progress < 10) return "Đang khởi tạo...";
  if (progress < 30) return "Đang kết nối AI...";
  if (progress < 60) return "Đang sinh nội dung đề thi...";
  if (progress < 90) return "Đang hoàn thiện câu hỏi...";
  return "Đang lưu vào hệ thống...";
}

export default function GenerateExamPage() {
  const router = useRouter();
  const {
    isGenerating,
    progress,
    error,
    examId,
    isCompleted,
    isFailed,
    startGeneration,
    reset,
  } = useExamGeneration();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(generateExamSchema),
    defaultValues: {
      exam_type: "sql_testing",
      duration: 90,
      passing_score: 60,
      subject: "",
    },
  });

  const examType = watch("exam_type");

  const onSubmit = async (data: FormData) => {
    const formData: ExamGenerateFormData = {
      exam_type: data.exam_type as ExamType,
      duration: data.duration,
      passing_score: data.passing_score,
      subject: data.subject || undefined,
    };
    await startGeneration(formData);
  };

  useEffect(() => {
    if (isCompleted && examId) {
      const timer = setTimeout(() => {
        router.push(`/admin/exams/${examId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, examId, router]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          asChild
          className="mb-4 -ml-2 text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <Link href="/admin/exams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
        <h1 className="text-3xl font-heading font-bold text-slate-900">
          Sinh đề thi tự động
        </h1>
        <p className="mt-2 text-slate-600">
          Sử dụng AI để tạo đề thi CNTT (SQL và Kiểm thử phần mềm) tự động
        </p>
      </div>

      {/* Form */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Cấu hình đề thi
          </CardTitle>
          <CardDescription>
            Điền thông tin để AI sinh đề thi phù hợp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Exam Type */}
            <div className="space-y-2">
              <Label htmlFor="exam_type">Loại đề thi</Label>
              <Select
                value={examType}
                onValueChange={(value) =>
                  setValue("exam_type", value as ExamType)
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn loại đề thi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sql_testing" className="cursor-pointer">
                    SQL + Kiểm thử (Đầy đủ)
                  </SelectItem>
                  <SelectItem value="sql_only" className="cursor-pointer">
                    Chỉ SQL
                  </SelectItem>
                  <SelectItem value="testing_only" className="cursor-pointer">
                    Chỉ Kiểm thử
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.exam_type && (
                <p className="text-sm text-red-600">
                  {errors.exam_type.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Thời gian làm bài (phút)</Label>
              <Input
                id="duration"
                type="number"
                min={30}
                max={240}
                {...register("duration", { valueAsNumber: true })}
                className="w-full"
              />
              <p className="text-xs text-slate-500">Từ 30 đến 240 phút</p>
              {errors.duration && (
                <p className="text-sm text-red-600">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Passing Score */}
            <div className="space-y-2">
              <Label htmlFor="passing_score">Điểm đạt (%)</Label>
              <Input
                id="passing_score"
                type="number"
                min={0}
                max={100}
                {...register("passing_score", { valueAsNumber: true })}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Phần trăm điểm tối thiểu để đạt
              </p>
              {errors.passing_score && (
                <p className="text-sm text-red-600">
                  {errors.passing_score.message}
                </p>
              )}
            </div>

            {/* Subject (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Môn học / Chủ đề{" "}
                <span className="text-slate-400">(tùy chọn)</span>
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="VD: Quản lý cơ sở dữ liệu, E-commerce..."
                {...register("subject")}
                className="w-full"
              />
            </div>

            {/* Error Alert */}
            {error && !isGenerating && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-primary hover:brightness-95 text-primary-foreground cursor-pointer transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang sinh đề...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sinh đề thi
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress Modal */}
      <Dialog
        open={isGenerating || isCompleted || isFailed}
        onOpenChange={() => {}}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Sinh đề thành công!
                </>
              ) : isFailed ? (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Sinh đề thất bại
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                  Đang sinh đề thi...
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isCompleted
                ? "Đang chuyển đến trang xem đề thi..."
                : isFailed
                  ? error || "Đã xảy ra lỗi khi sinh đề"
                  : "AI đang tạo đề thi cho bạn. Vui lòng đợi trong giây lát."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Progress
              value={isCompleted ? 100 : isFailed ? 0 : progress}
              className="h-2"
            />
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                {isCompleted
                  ? "Hoàn tất!"
                  : isFailed
                    ? "Thất bại"
                    : getProgressText(progress)}
              </span>
              <span className="font-medium text-slate-900">
                {isCompleted ? 100 : isFailed ? 0 : progress}%
              </span>
            </div>
          </div>

          {isGenerating && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={reset}
                className="cursor-pointer"
              >
                Hủy bỏ
              </Button>
            </div>
          )}

          {isFailed && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={reset}
                className="flex-1 cursor-pointer"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  reset();
                  handleSubmit(onSubmit)();
                }}
                className="flex-1 bg-primary hover:brightness-95 text-primary-foreground cursor-pointer transition-all"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
