"use client";

import {
  Brain,
  Clock,
  FileText,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: "AI Sinh Đề Thông Minh",
    description:
      "Tự động tạo đề thi từ ngân hàng câu hỏi với độ khó phù hợp, đảm bảo công bằng cho mọi thí sinh.",
  },
  {
    icon: Clock,
    title: "Chấm Điểm Tức Thì",
    description:
      "Kết quả thi trắc nghiệm được chấm ngay lập tức. Bài tự luận được AI hỗ trợ đánh giá nhanh chóng.",
  },
  {
    icon: FileText,
    title: "Ngân Hàng Câu Hỏi",
    description:
      "Quản lý câu hỏi theo chủ đề, độ khó và loại câu hỏi. Dễ dàng import/export với nhiều định dạng.",
  },
  {
    icon: BarChart3,
    title: "Phân Tích Chi Tiết",
    description:
      "Báo cáo điểm số, thời gian làm bài và phân tích hiệu suất theo từng chủ đề cho từng thí sinh.",
  },
];

export function FeaturesSection() {
  const [sectionRef, isRevealed] = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  });

  return (
    <section id="features" ref={sectionRef} className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div
          className={`mb-16 text-center transition-all duration-700 ease-out ${
            isRevealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tính năng nổi bật
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Mọi thứ bạn cần để tổ chức thi trực tuyến hiệu quả và chuyên nghiệp
          </p>
        </div>

        {/* Feature cards with staggered animation */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className={`hover-lift group cursor-pointer rounded-lg border border-border bg-card p-6 transition-all duration-500 ease-out hover:border-primary/30 hover:bg-primary/5 ${
                isRevealed
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
              style={{
                transitionDelay: isRevealed ? `${index * 100 + 200}ms` : "0ms",
              }}
            >
              {/* Icon with animated background */}
              <div className="icon-bounce mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-6" />
              </div>

              <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                {feature.title}
              </h3>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
