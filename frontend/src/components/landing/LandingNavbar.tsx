"use client";

import Link from "next/link";
import { BookOpen, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#features", label: "Tính năng" },
  { href: "#how-it-works", label: "Cách hoạt động" },
  { href: "#about", label: "Giới thiệu" },
];

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl">
      <nav className="flex items-center justify-between rounded-lg border border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-foreground transition-colors duration-200 hover:text-primary"
        >
          <BookOpen className="size-6 text-primary" />
          <span className="hidden sm:inline">IT Exam</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Bắt đầu ngay</Link>
          </Button>
        </div>

        <button
          type="button"
          className="cursor-pointer p-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
        >
          {isMenuOpen ? (
            <X className="size-5 text-foreground" />
          ) : (
            <Menu className="size-5 text-foreground" />
          )}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="mt-2 rounded-lg border border-border bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="cursor-pointer py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 h-px bg-border" />
            <Button variant="ghost" size="sm" className="justify-start" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Bắt đầu ngay</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
