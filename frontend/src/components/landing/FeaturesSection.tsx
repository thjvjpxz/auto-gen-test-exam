import { Brain, Clock, FileText, BarChart3 } from "lucide-react";

const FEATURES = [
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
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tính năng nổi bật
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Mọi thứ bạn cần để tổ chức thi trực tuyến hiệu quả và chuyên nghiệp
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group cursor-pointer rounded-lg border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
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
