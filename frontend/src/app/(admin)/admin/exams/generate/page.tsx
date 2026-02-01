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
  Clock,
  Target,
  BookOpen,
  Zap,
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
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="animate-fade-in-down mb-8">
        <Button
          variant="ghost"
          asChild
          className="-ml-2 mb-4 cursor-pointer text-muted-foreground transition-all duration-200 hover:text-foreground"
        >
          <Link href="/admin/exams">
            <ArrowLeft className="mr-2 size-4" />
            Quay lại
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Sinh đề thi tự động
            </h1>
            <p className="mt-1 text-muted-foreground">
              Sử dụng AI để tạo đề thi CNTT tự động
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="animate-fade-in-up overflow-hidden border-0 shadow-lg">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 font-heading">
            <Zap className="size-5 text-primary" />
            Cấu hình đề thi
          </CardTitle>
          <CardDescription>
            Điền thông tin để AI sinh đề thi phù hợp
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Exam Type */}
            <div className="space-y-2">
              <Label htmlFor="exam_type" className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                Loại đề thi
              </Label>
              <Select
                value={examType}
                onValueChange={(value) =>
                  setValue("exam_type", value as ExamType)
                }
              >
                <SelectTrigger className="cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/20">
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
                <p className="text-sm text-destructive">
                  {errors.exam_type.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Thời gian làm bài (phút)
              </Label>
              <Input
                id="duration"
                type="number"
                min={30}
                max={240}
                {...register("duration", { valueAsNumber: true })}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Từ 30 đến 240 phút
              </p>
              {errors.duration && (
                <p className="text-sm text-destructive">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Passing Score */}
            <div className="space-y-2">
              <Label
                htmlFor="passing_score"
                className="flex items-center gap-2"
              >
                <Target className="size-4 text-muted-foreground" />
                Điểm đạt (%)
              </Label>
              <Input
                id="passing_score"
                type="number"
                min={0}
                max={100}
                {...register("passing_score", { valueAsNumber: true })}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Phần trăm điểm tối thiểu để đạt
              </p>
              {errors.passing_score && (
                <p className="text-sm text-destructive">
                  {errors.passing_score.message}
                </p>
              )}
            </div>

            {/* Subject (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Môn học / Chủ đề{" "}
                <span className="text-muted-foreground">(tùy chọn)</span>
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="VD: Quản lý cơ sở dữ liệu, E-commerce..."
                {...register("subject")}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Error Alert */}
            {error && !isGenerating && (
              <Alert variant="destructive" className="animate-fade-in-scale">
                <XCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isGenerating}
              className="glow-effect w-full cursor-pointer bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.01] hover:bg-primary/90"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                  Đang sinh đề...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
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
          className="animate-fade-in-scale overflow-hidden border-0 p-0 shadow-2xl sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          {/* Top accent */}
          <div
            className={`h-1.5 ${
              isCompleted
                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                : isFailed
                  ? "bg-gradient-to-r from-red-400 to-orange-500"
                  : "bg-gradient-to-r from-primary via-accent to-primary"
            }`}
          />

          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 font-heading text-xl">
                {isCompleted ? (
                  <>
                    <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="size-5 text-green-600" />
                    </div>
                    Sinh đề thành công!
                  </>
                ) : isFailed ? (
                  <>
                    <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                      <XCircle className="size-5 text-red-600" />
                    </div>
                    Sinh đề thất bại
                  </>
                ) : (
                  <>
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="size-5 animate-pulse text-primary" />
                    </div>
                    Đang sinh đề thi...
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="pt-2">
                {isCompleted
                  ? "Đang chuyển đến trang xem đề thi..."
                  : isFailed
                    ? error || "Đã xảy ra lỗi khi sinh đề"
                    : "AI đang tạo đề thi cho bạn. Vui lòng đợi trong giây lát."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <Progress
                value={isCompleted ? 100 : isFailed ? 0 : progress}
                className="h-3"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isCompleted
                    ? "Hoàn tất!"
                    : isFailed
                      ? "Thất bại"
                      : getProgressText(progress)}
                </span>
                <span className="font-semibold text-foreground">
                  {isCompleted ? 100 : isFailed ? 0 : progress}%
                </span>
              </div>
            </div>

            {isGenerating && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={reset}
                  className="cursor-pointer transition-all duration-200 hover:border-destructive/50 hover:text-destructive"
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
                  className="flex-1 cursor-pointer transition-all duration-200"
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    reset();
                    handleSubmit(onSubmit)();
                  }}
                  className="flex-1 cursor-pointer bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Thử lại
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
