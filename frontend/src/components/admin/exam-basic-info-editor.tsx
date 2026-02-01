"use client";

import { useState } from "react";
import { Pencil, Save, X, Clock, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUpdateExam } from "@/hooks/exam";
import type { ExamUpdateData } from "@/types";
import { toast } from "sonner";

interface ExamBasicInfoEditorProps {
  examId: number;
  title: string;
  subject: string | null;
  duration: number;
  passingScore: number;
}

/**
 * Inline editor for basic exam info (title, subject, duration, passing_score).
 */
export function ExamBasicInfoEditor({
  examId,
  title,
  subject,
  duration,
  passingScore,
}: ExamBasicInfoEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState<ExamUpdateData>({
    title,
    subject: subject ?? "",
    duration,
    passing_score: passingScore,
  });

  const updateMutation = useUpdateExam();

  const handleSave = async () => {
    // Validate
    if (!localData.title?.trim()) {
      toast.error("Tiêu đề không được để trống");
      return;
    }
    if (
      localData.duration &&
      (localData.duration < 30 || localData.duration > 240)
    ) {
      toast.error("Thời gian phải từ 30-240 phút");
      return;
    }
    if (
      localData.passing_score !== undefined &&
      (localData.passing_score < 0 || localData.passing_score > 100)
    ) {
      toast.error("Điểm đạt phải từ 0-100%");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        examId,
        data: {
          title: localData.title,
          subject: localData.subject || undefined,
          duration: localData.duration,
          passing_score: localData.passing_score,
        },
      });
      toast.success("Đã lưu thay đổi");
      setIsEditing(false);
    } catch {
      toast.error("Không thể lưu thay đổi");
    }
  };

  const handleCancel = () => {
    setLocalData({
      title,
      subject: subject ?? "",
      duration,
      passing_score: passingScore,
    });
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Pencil className="size-4 text-primary" />
            Thông tin cơ bản
          </CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer transition-all duration-200 hover:border-primary/50"
            >
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="cursor-pointer"
              >
                <X className="mr-1.5 size-3.5" />
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="cursor-pointer bg-primary text-primary-foreground"
              >
                <Save className="mr-1.5 size-3.5" />
                {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Title */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BookOpen className="size-4 text-muted-foreground" />
              Tiêu đề
            </Label>
            {isEditing ? (
              <Input
                value={localData.title ?? ""}
                onChange={(e) =>
                  setLocalData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nhập tiêu đề đề thi"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="rounded-lg bg-muted/30 px-3 py-2 text-foreground">
                {title}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Chủ đề / Môn học
            </Label>
            {isEditing ? (
              <Input
                value={localData.subject ?? ""}
                onChange={(e) =>
                  setLocalData((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="VD: Quản lý CSDL, E-commerce..."
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="rounded-lg bg-muted/30 px-3 py-2 text-foreground">
                {subject || "—"}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="size-4 text-muted-foreground" />
              Thời gian làm bài (phút)
            </Label>
            {isEditing ? (
              <Input
                type="number"
                min={30}
                max={240}
                value={localData.duration ?? 90}
                onChange={(e) =>
                  setLocalData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value, 10) || 90,
                  }))
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="rounded-lg bg-muted/30 px-3 py-2 text-foreground">
                {duration} phút
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Từ 30 đến 240 phút
              </p>
            )}
          </div>

          {/* Passing Score */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Target className="size-4 text-muted-foreground" />
              Điểm đạt (%)
            </Label>
            {isEditing ? (
              <Input
                type="number"
                min={0}
                max={100}
                value={localData.passing_score ?? 60}
                onChange={(e) =>
                  setLocalData((prev) => ({
                    ...prev,
                    passing_score: parseInt(e.target.value, 10) || 60,
                  }))
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="rounded-lg bg-muted/30 px-3 py-2 text-foreground">
                {passingScore}%
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">Từ 0% đến 100%</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
