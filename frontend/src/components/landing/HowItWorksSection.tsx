"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const STEPS = [
  {
    number: "01",
    title: "Tạo đề thi",
    description:
      "Nhập câu hỏi hoặc để AI tự động sinh đề từ ngân hàng câu hỏi. Cấu hình thời gian và số lượng câu hỏi.",
  },
  {
    number: "02",
    title: "Thí sinh làm bài",
    description:
      "Thí sinh truy cập bài thi qua link hoặc mã đề. Hệ thống giám sát và chống gian lận tự động.",
  },
  {
    number: "03",
    title: "Xem kết quả",
    description:
      "Kết quả được chấm tự động và hiển thị ngay. Giáo viên có báo cáo chi tiết về hiệu suất lớp học.",
  },
];

export function HowItWorksSection() {
  const [sectionRef, isRevealed] = useScrollReveal<HTMLElement>({
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="bg-muted/50 px-6 py-24"
    >
      <div className="mx-auto max-w-4xl">
        {/* Section header */}
        <div
          className={`mb-16 text-center transition-all duration-700 ease-out ${
            isRevealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cách hoạt động
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Chỉ với 3 bước đơn giản để bắt đầu tổ chức thi trực tuyến
          </p>
        </div>

        {/* Timeline with animated steps */}
        <div className="relative">
          {/* Timeline line with growing animation */}
          <div
            className={`absolute left-8 top-0 hidden h-full w-px origin-top bg-gradient-to-b from-primary via-primary/50 to-transparent transition-transform duration-1000 ease-out md:block ${
              isRevealed ? "scale-y-100" : "scale-y-0"
            }`}
          />

          <div className="space-y-12">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                className={`relative flex gap-6 transition-all duration-700 ease-out md:gap-12 ${
                  isRevealed
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-8 opacity-0"
                }`}
                style={{
                  transitionDelay: isRevealed
                    ? `${index * 200 + 300}ms`
                    : "0ms",
                }}
              >
                {/* Step number badge */}
                <div
                  className={`relative z-10 flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-primary bg-card font-heading text-xl font-bold text-primary shadow-lg transition-all duration-500 ${
                    isRevealed ? "scale-100" : "scale-75"
                  }`}
                  style={{
                    transitionDelay: isRevealed
                      ? `${index * 200 + 400}ms`
                      : "0ms",
                  }}
                >
                  {step.number}
                  {/* Pulse ring effect */}
                  <div
                    className={`absolute inset-0 rounded-lg border-2 border-primary transition-all duration-1000 ${
                      isRevealed
                        ? "scale-125 opacity-0"
                        : "scale-100 opacity-100"
                    }`}
                    style={{
                      transitionDelay: isRevealed
                        ? `${index * 200 + 600}ms`
                        : "0ms",
                    }}
                  />
                </div>

                {/* Step content */}
                <div className="flex-1 pt-2">
                  <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
