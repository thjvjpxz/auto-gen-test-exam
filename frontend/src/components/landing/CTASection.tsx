import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section id="about" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            Đăng ký tài khoản miễn phí ngay hôm nay để trải nghiệm hệ thống thi
            trực tuyến hiện đại và thông minh.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="min-w-[200px] bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <Link href="/register">
                Đăng ký miễn phí
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px]"
              asChild
            >
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Không cần thẻ tín dụng • Bắt đầu ngay trong 30 giây
          </p>
        </div>
      </div>
    </section>
  );
}
