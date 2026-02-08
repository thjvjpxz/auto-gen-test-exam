"use client";

import { AlertTriangle, Clock, FileText, Play, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeInScale, springItem } from "@/lib/motion";

interface ExamConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictData: {
    message: string;
    existing_attempt_id: number;
    existing_exam_id: number;
    existing_exam_title: string;
    started_at: string;
    duration: number;
    time_remaining_seconds: number;
  } | null;
  onContinueExisting: () => void;
  onForceSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Dialog hiển thị khi user cố gắng bắt đầu đề thi mới
 * trong khi đang có attempt IN_PROGRESS cho đề khác.
 */
export function ExamConflictDialog({
  open,
  onOpenChange,
  conflictData,
  onContinueExisting,
  onForceSubmit,
  isSubmitting = false,
}: ExamConflictDialogProps) {
  if (!conflictData) return null;

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} phút ${secs} giây`;
    }
    return `${secs} giây`;
  };

  const handleContinue = () => {
    onOpenChange(false);
    onContinueExisting();
  };

  const handleForceSubmit = () => {
    onForceSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <DialogHeader>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="size-8 text-amber-600 dark:text-amber-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              Bạn đang làm bài thi khác
            </DialogTitle>
            <DialogDescription className="text-center">
              {conflictData.message}
            </DialogDescription>
          </DialogHeader>

          <motion.div
            variants={springItem}
            className="space-y-3 rounded-lg border bg-muted/30 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {conflictData.existing_exam_title}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0">
                Đang làm
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="size-4" />
                <span>
                  Còn lại:{" "}
                  {formatTimeRemaining(conflictData.time_remaining_seconds)}
                </span>
              </div>
            </div>

            {conflictData.time_remaining_seconds <= 0 && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                <XCircle className="mt-0.5 size-4 shrink-0" />
                <p>Thời gian làm bài đã hết. Bài thi sẽ được tự động nộp.</p>
              </div>
            )}
          </motion.div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleContinue}
              className="w-full cursor-pointer bg-primary transition-all duration-200 hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              <Play className="mr-2 size-4" />
              Tiếp tục làm bài cũ
            </Button>
            <Button
              onClick={handleForceSubmit}
              variant="outline"
              className="w-full cursor-pointer border-destructive/30 text-destructive transition-all duration-200 hover:scale-[1.02] hover:border-destructive hover:bg-destructive/10"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang nộp bài...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 size-4" />
                  Nộp bài cũ và làm đề mới
                </>
              )}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
