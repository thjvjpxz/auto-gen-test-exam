"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useAuthStore } from "@/stores/auth";

export function CTASection() {
  const [sectionRef, isRevealed] = useScrollReveal<HTMLElement>({
    threshold: 0.2,
    rootMargin: "0px 0px -80px 0px",
  });
  const { user, isAuthenticated } = useAuthStore();

  return (
    <section id="about" ref={sectionRef} className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div
          className={`relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-8 text-center transition-all duration-700 ease-out sm:p-12 ${
            isRevealed ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Decorative corner accents */}
          <div className="absolute -right-12 -top-12 size-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 size-32 rounded-full bg-accent/10 blur-3xl" />

          {/* Content */}
          <div className="relative z-10">
            <h2
              className={`mb-4 font-heading text-3xl font-bold tracking-tight text-foreground transition-all duration-700 ease-out sm:text-4xl ${
                isRevealed
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: isRevealed ? "200ms" : "0ms" }}
            >
              {isAuthenticated
                ? `Chào mừng, ${user?.name}!`
                : "Sẵn sàng bắt đầu?"}
            </h2>

            <p
              className={`mx-auto mb-8 max-w-xl text-lg text-muted-foreground transition-all duration-700 ease-out ${
                isRevealed
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: isRevealed ? "300ms" : "0ms" }}
            >
              {isAuthenticated
                ? "Khám phá các đề thi có sẵn và thử thách bản thân với hệ thống chấm điểm AI thông minh."
                : "Đăng ký tài khoản miễn phí ngay hôm nay để trải nghiệm hệ thống thi trực tuyến hiện đại và thông minh."}
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col items-center justify-center gap-4 transition-all duration-700 ease-out sm:flex-row ${
                isRevealed
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: isRevealed ? "400ms" : "0ms" }}
            >
              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    className="glow-effect group min-w-[200px] bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90"
                    asChild
                  >
                    <Link href="/exams">
                      <BookOpen className="mr-2 size-4" />
                      Xem danh sách đề thi
                      <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="hover-lift min-w-[200px]"
                    asChild
                  >
                    <Link href="/profile">
                      <User className="mr-2 size-4" />
                      Xem hồ sơ của tôi
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="glow-effect group min-w-[200px] bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90"
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
                    className="hover-lift min-w-[200px]"
                    asChild
                  >
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust text */}
            <p
              className={`mt-6 text-sm text-muted-foreground transition-all duration-700 ease-out ${
                isRevealed
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: isRevealed ? "500ms" : "0ms" }}
            >
              {isAuthenticated
                ? "Hệ thống AI sẽ chấm điểm và đưa ra nhận xét chi tiết cho bạn"
                : "Không cần thẻ tín dụng • Bắt đầu ngay trong 30 giây"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
