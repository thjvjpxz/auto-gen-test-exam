"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

export function HeroSection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge with shimmer effect */}
        <div className="animate-fade-in-up animation-delay-100 mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
          <Sparkles className="size-4 animate-float text-primary" />
          <span className="text-sm font-medium text-primary">
            Nền tảng thi trắc nghiệm thông minh
          </span>
        </div>

        {/* Main Heading with cascade animation */}
        <h1 className="animate-fade-in-up animation-delay-200 mb-6 font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Hệ Thống Thi
          <br />
          <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            CNTT Online
          </span>
        </h1>

        {/* Subheading */}
        <p className="animate-fade-in-up animation-delay-300 mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Nền tảng thi trắc nghiệm và tự luận với AI tự động sinh đề và chấm
          điểm. Tiết kiệm thời gian, nâng cao chất lượng đào tạo.
        </p>

        {/* CTA Buttons - Different based on auth state */}
        <div className="animate-fade-in-up animation-delay-400 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isAuthenticated ? (
            <Button
              size="lg"
              className="glow-effect min-w-[180px] bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90"
              asChild
            >
              <Link href="/exams">
                <BookOpen className="mr-2 size-4" />
                Làm bài thi ngay
                <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                className="glow-effect min-w-[180px] bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90"
                asChild
              >
                <Link href="/register">
                  Đăng ký miễn phí
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="hover-lift min-w-[180px]"
                asChild
              >
                <Link href="/login">Đăng nhập</Link>
              </Button>
            </>
          )}
        </div>

        {/* Feature badges */}
        <div className="animate-fade-in-up animation-delay-500 mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
          {[
            "AI chấm điểm tự động",
            "Ngân hàng câu hỏi đa dạng",
            "Báo cáo chi tiết",
          ].map((feature, index) => (
            <div
              key={feature}
              className="flex items-center gap-2 transition-colors duration-200 hover:text-foreground"
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              <div className="size-2 rounded-full bg-accent" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute -bottom-32 left-1/4 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-32 right-1/4 size-64 rounded-full bg-accent/10 blur-3xl" />
    </section>
  );
}
