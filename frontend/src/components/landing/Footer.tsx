import { BookOpen } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <BookOpen className="size-5 text-primary" />
            <span>IT Exam System</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="#features"
              className="cursor-pointer text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Tính năng
            </a>
            <a
              href="#how-it-works"
              className="cursor-pointer text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Cách hoạt động
            </a>
            <a
              href="#about"
              className="cursor-pointer text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Giới thiệu
            </a>
          </nav>

          <p className="text-sm text-muted-foreground">
            © {currentYear} IT Exam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
