"use client";

import { useState } from "react";
import { Settings2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUpdateExam } from "@/hooks/exam";
import type { ExamSettings, ExamSettingsUpdate } from "@/types";
import { toast } from "sonner";

interface ExamSettingsEditorProps {
  examId: number;
  settings: ExamSettings | null;
}

/**
 * Inline editor for exam settings (allow_review, show_sample_solution, max_attempts).
 */
export function ExamSettingsEditor({
  examId,
  settings,
}: ExamSettingsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localSettings, setLocalSettings] = useState<ExamSettingsUpdate>({
    allow_review: settings?.allow_review ?? true,
    show_sample_solution: settings?.show_sample_solution ?? false,
    max_attempts: settings?.max_attempts ?? null,
  });

  const updateMutation = useUpdateExam();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        examId,
        data: { settings: localSettings },
      });
      toast.success("Đã lưu cài đặt");
      setIsEditing(false);
    } catch {
      toast.error("Không thể lưu cài đặt");
    }
  };

  const handleCancel = () => {
    setLocalSettings({
      allow_review: settings?.allow_review ?? true,
      show_sample_solution: settings?.show_sample_solution ?? false,
      max_attempts: settings?.max_attempts ?? null,
    });
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Settings2 className="size-4 text-primary" />
            Cài đặt đề thi
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Allow Review */}
          <div className="rounded-lg bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Cho phép xem lại
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Sinh viên xem kết quả sau nộp
                </p>
              </div>
              {isEditing ? (
                <Switch
                  checked={localSettings.allow_review ?? true}
                  onCheckedChange={(checked: boolean) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      allow_review: checked,
                    }))
                  }
                />
              ) : (
                <span
                  className={`text-sm font-medium ${
                    settings?.allow_review
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {settings?.allow_review ? "Có" : "Không"}
                </span>
              )}
            </div>
          </div>

          {/* Show Sample Solution */}
          <div className="rounded-lg bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Hiện đáp án mẫu
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hiển thị đáp án sau khi nộp
                </p>
              </div>
              {isEditing ? (
                <Switch
                  checked={localSettings.show_sample_solution ?? false}
                  onCheckedChange={(checked: boolean) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      show_sample_solution: checked,
                    }))
                  }
                />
              ) : (
                <span
                  className={`text-sm font-medium ${
                    settings?.show_sample_solution
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {settings?.show_sample_solution ? "Có" : "Không"}
                </span>
              )}
            </div>
          </div>

          {/* Max Attempts */}
          <div className="rounded-lg bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Số lần làm tối đa
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Để trống = không giới hạn
                </p>
              </div>
              {isEditing ? (
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="∞"
                  value={localSettings.max_attempts ?? ""}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      max_attempts: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    }))
                  }
                  className="w-20 text-center"
                />
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {settings?.max_attempts ?? "Không giới hạn"}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
