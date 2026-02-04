"use client";

import { motion } from "framer-motion";
import { staggerContainer, springItem, defaultViewport } from "@/lib/motion";

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

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

/**
 * How It Works section with timeline animation using Framer Motion.
 */
export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/50 px-6 py-24">
      <motion.div
        className="mx-auto max-w-4xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
      >
        <motion.div variants={springItem} className="mb-16 text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cách hoạt động
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Chỉ với 3 bước đơn giản để bắt đầu tổ chức thi trực tuyến
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            variants={lineVariants}
            className="absolute left-8 top-0 hidden h-full w-px origin-top bg-gradient-to-b from-primary via-primary/50 to-transparent md:block"
          />

          <div className="space-y-12">
            {STEPS.map((step) => (
              <motion.div
                key={step.number}
                variants={springItem}
                className="relative flex gap-6 md:gap-12"
              >
                <div className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-primary bg-card font-heading text-xl font-bold text-primary shadow-lg">
                  {step.number}
                </div>

                <div className="flex-1 pt-2">
                  <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
