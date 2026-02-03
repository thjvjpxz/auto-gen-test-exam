"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import {
  staggerContainer,
  springItem,
  fadeInScale,
  defaultViewport,
} from "@/lib/motion";

/**
 * Call-to-action section with animated content using Framer Motion.
 */
export function CTASection() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <section id="about" className="px-6 py-24">
      <motion.div
        className="mx-auto max-w-4xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
      >
        <motion.div
          variants={fadeInScale}
          className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-8 text-center sm:p-12"
        >
          <div className="absolute -right-12 -top-12 size-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 size-32 rounded-full bg-accent/10 blur-3xl" />

          <motion.div
            className="relative z-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={springItem}
              className="mb-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {isAuthenticated
                ? `Chào mừng, ${user?.name}!`
                : "Sẵn sàng bắt đầu?"}
            </motion.h2>

            <motion.p
              variants={springItem}
              className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground"
            >
              {isAuthenticated
                ? "Khám phá các đề thi có sẵn và thử thách bản thân với hệ thống chấm điểm AI thông minh."
                : "Đăng ký tài khoản miễn phí ngay hôm nay để trải nghiệm hệ thống thi trực tuyến hiện đại và thông minh."}
            </motion.p>

            <motion.div
              variants={springItem}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
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
            </motion.div>

            <motion.p
              variants={springItem}
              className="mt-6 text-sm text-muted-foreground"
            >
              {isAuthenticated
                ? "Hệ thống AI sẽ chấm điểm và đưa ra nhận xét chi tiết cho bạn"
                : "Không cần thẻ tín dụng • Bắt đầu ngay trong 30 giây"}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
