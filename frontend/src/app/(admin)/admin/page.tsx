"use client";

import Link from "next/link";
import { FileText, PlusCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExams } from "@/hooks/exam";

export default function AdminDashboard() {
  const { data: examsData, isLoading } = useExams({ limit: 5 });

  const stats = [
    {
      title: "Tổng đề thi",
      value: examsData?.total ?? 0,
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Đã xuất bản",
      value: examsData?.items?.filter((e) => e.is_published).length ?? 0,
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Bản nháp",
      value: examsData?.items?.filter((e) => !e.is_published).length ?? 0,
      icon: FileText,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-600">
            Tổng quan về hệ thống quản lý đề thi
          </p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700 cursor-pointer">
          <Link href="/admin/exams/generate">
            <PlusCircle className="mr-2 h-4 w-4" />
            Sinh đề mới
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-heading font-bold text-slate-900">
                        {stat.value}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Exams */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-lg">
            Đề thi gần đây
          </CardTitle>
          <Button variant="outline" asChild className="cursor-pointer">
            <Link href="/admin/exams">Xem tất cả</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : examsData?.items?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-slate-500">Chưa có đề thi nào</p>
              <Button asChild className="mt-4 cursor-pointer">
                <Link href="/admin/exams/generate">Sinh đề đầu tiên</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {examsData?.items?.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/admin/exams/${exam.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {exam.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {exam.exam_type === "sql_testing"
                        ? "SQL + Testing"
                        : exam.exam_type === "sql_only"
                        ? "Chỉ SQL"
                        : "Chỉ Testing"}{" "}
                      • {exam.duration} phút
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      exam.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {exam.is_published ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
