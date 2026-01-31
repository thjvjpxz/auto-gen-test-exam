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
  return (
    <section id="how-it-works" className="bg-muted/50 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cách hoạt động
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Chỉ với 3 bước đơn giản để bắt đầu tổ chức thi trực tuyến
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-border md:block" />

          <div className="space-y-12">
            {STEPS.map((step, index) => (
              <div key={step.number} className="relative flex gap-6 md:gap-12">
                <div className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-primary bg-card font-heading text-xl font-bold text-primary">
                  {step.number}
                </div>

                <div className="flex-1 pt-2">
                  <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
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
