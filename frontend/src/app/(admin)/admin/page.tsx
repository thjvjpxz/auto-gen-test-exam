"use client";

import Link from "next/link";
import {
  FileText,
  TrendingUp,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExams } from "@/hooks/exam";
import { useAdminStats } from "@/hooks/admin";

export default function AdminDashboard() {
  const { data: examsData, isLoading: examsLoading } = useExams({ limit: 5 });
  const { data: statsData, isLoading: statsLoading } = useAdminStats();

  const isLoading = examsLoading || statsLoading;

  const stats = [
    {
      title: "Tổng đề thi",
      value: statsData?.total_exams ?? 0,
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: "Đã xuất bản",
      value: statsData?.published_exams ?? 0,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      title: "Người dùng",
      value: statsData?.total_users ?? 0,
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: "Lượt làm bài",
      value: statsData?.total_attempts ?? 0,
      icon: ClipboardList,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-in-down flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tổng quan về hệ thống quản lý đề thi
          </p>
        </div>
        <Button
          asChild
          className="glow-effect cursor-pointer bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90"
        >
          <Link href="/admin/exams/generate">
            <Sparkles className="mr-2 size-4" />
            Sinh đề mới
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="group overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Top gradient bar */}
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent
                className={`bg-gradient-to-br ${stat.bgGradient} p-6`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex size-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className="size-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    {isLoading ? (
                      <Skeleton className="mt-1 h-9 w-16" />
                    ) : (
                      <p className="font-heading text-3xl font-bold text-foreground">
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
      <Card className="animate-fade-in-up overflow-hidden border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <FileText className="size-5 text-primary" />
            Đề thi gần đây
          </CardTitle>
          <Button
            variant="ghost"
            asChild
            className="cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <Link href="/admin/exams">
              Xem tất cả
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0 divide-y">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="size-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : examsData?.items?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <FileText className="size-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  Chưa có đề thi nào
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bắt đầu bằng cách sinh đề thi đầu tiên
                </p>
              </div>
              <Button
                asChild
                className="mt-2 cursor-pointer bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02]"
              >
                <Link href="/admin/exams/generate">
                  <Sparkles className="mr-2 size-4" />
                  Sinh đề đầu tiên
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {examsData?.items?.map((exam, index) => (
                <Link
                  key={exam.id}
                  href={`/admin/exams/${exam.id}`}
                  className="group flex items-center gap-4 p-4 transition-all duration-200 hover:bg-muted/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 transition-all duration-200 group-hover:from-primary/20 group-hover:to-accent/20">
                    <FileText className="size-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                      {exam.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exam.exam_type === "sql_testing"
                        ? "SQL + Testing"
                        : exam.exam_type === "sql_only"
                          ? "Chỉ SQL"
                          : "Chỉ Testing"}{" "}
                      • {exam.duration} phút
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                      exam.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
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
