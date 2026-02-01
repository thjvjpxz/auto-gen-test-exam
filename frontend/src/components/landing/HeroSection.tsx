import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-24">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Nền tảng thi trắc nghiệm thông minh
          </span>
        </div>

        <h1 className="mb-6 font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Hệ Thống Thi
          <br />
          <span className="text-primary">CNTT Online</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Nền tảng thi trắc nghiệm và tự luận với AI tự động sinh đề và chấm
          điểm. Tiết kiệm thời gian, nâng cao chất lượng đào tạo.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="min-w-[180px] bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <Link href="/register">
              Đăng ký miễn phí
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="min-w-[180px]" asChild>
            <Link href="/login">Đăng nhập</Link>
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-accent" />
            <span>AI chấm điểm tự động</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-accent" />
            <span>Ngân hàng câu hỏi đa dạng</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-accent" />
            <span>Báo cáo chi tiết</span>
          </div>
        </div>
      </div>
    </section>
  );
}
