"use client";

import { useRouter } from "next/navigation";
import { FileText, Clock, Play, CheckCircle } from "lucide-react";
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
      <div className="text-center py-12">
        <p className="text-red-600">
          Đã có lỗi xảy ra khi tải danh sách bài thi.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 cursor-pointer"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bài thi</h1>
        <p className="text-muted-foreground mt-1">
          Chọn một bài thi để bắt đầu làm
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : publishedExams.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Chưa có bài thi nào</h3>
            <p className="text-muted-foreground mt-1">
              Hiện tại không có bài thi nào được công bố.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedExams.map((exam: ExamListItem) => (
            <ExamCard
              key={exam.id}
              exam={exam}
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
  getExamTypeBadge: (type: string) => string;
  onStart: () => void;
}

function ExamCard({ exam, getExamTypeBadge, onStart }: ExamCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{exam.title}</h3>
          <Badge variant="secondary" className="shrink-0">
            {getExamTypeBadge(exam.exam_type)}
          </Badge>
        </div>
        {exam.subject && (
          <p className="text-sm text-muted-foreground">{exam.subject}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{exam.duration} phút</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>Đạt: {exam.passing_score}%</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onStart} className="w-full cursor-pointer">
          <Play className="h-4 w-4 mr-2" />
          Bắt đầu thi
        </Button>
      </CardFooter>
    </Card>
  );
}
