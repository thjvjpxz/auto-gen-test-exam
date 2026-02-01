"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  Play,
  CheckCircle,
  BookOpen,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useExams } from "@/hooks/exam";
import type { ExamListItem } from "@/types";

/**
 * User exam list page - shows published exams available to take.
 */
export default function ExamsPage() {
  const router = useRouter();
  const { data: examsData, isLoading, error } = useExams();

  const publishedExams =
    examsData?.items?.filter((exam) => exam.is_published) ?? [];

  const handleStartExam = (examId: number) => {
    router.push(`/exams/${examId}/take`);
  };

  const getExamTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      sql_testing: "SQL + Testing",
      sql_only: "SQL",
      testing_only: "Testing",
    };
    return typeLabels[type] || type;
  };

  if (error) {
    return (
      <div className="animate-fade-in-up py-12 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-6">
          <FileText className="mx-auto mb-4 size-12 text-destructive/60" />
          <p className="mb-4 text-destructive">
            Đã có lỗi xảy ra khi tải danh sách bài thi.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bài thi</h1>
            <p className="mt-0.5 text-muted-foreground">
              Chọn một bài thi để bắt đầu làm
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : publishedExams.length === 0 ? (
        <Card className="animate-fade-in-scale py-16 text-center">
          <CardContent>
            <div className="animate-float mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
              <Search className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium">Chưa có bài thi nào</h3>
            <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
              Hiện tại không có bài thi nào được công bố. Vui lòng quay lại sau.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publishedExams.map((exam: ExamListItem, index: number) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              index={index}
              getExamTypeBadge={getExamTypeBadge}
              onStart={() => handleStartExam(exam.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExamCardProps {
  exam: ExamListItem;
  index: number;
  getExamTypeBadge: (type: string) => string;
  onStart: () => void;
}

function ExamCard({ exam, index, getExamTypeBadge, onStart }: ExamCardProps) {
  return (
    <Card
      className="hover-lift group flex cursor-pointer flex-col overflow-hidden border-2 transition-all duration-300 hover:border-primary/30"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Card top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold transition-colors duration-200 group-hover:text-primary">
            {exam.title}
          </h3>
          <Badge
            variant="secondary"
            className="shrink-0 transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary"
          >
            {getExamTypeBadge(exam.exam_type)}
          </Badge>
        </div>
        {exam.subject && (
          <p className="mt-1 text-sm text-muted-foreground">{exam.subject}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 transition-colors duration-200 group-hover:text-foreground">
            <Clock className="size-4" />
            <span>{exam.duration} phút</span>
          </div>
          <div className="flex items-center gap-1.5 transition-colors duration-200 group-hover:text-foreground">
            <CheckCircle className="size-4" />
            <span>Đạt: {exam.passing_score}%</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={onStart}
          className="glow-effect w-full cursor-pointer bg-primary transition-all duration-200 hover:scale-[1.01]"
        >
          <Play className="mr-2 size-4" />
          Bắt đầu thi
        </Button>
      </CardFooter>
    </Card>
  );
}
