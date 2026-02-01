"use client";

import { BookOpen, Github, Mail, Linkedin } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const FOOTER_LINKS = [
  { href: "#features", label: "Tính năng" },
  { href: "#how-it-works", label: "Cách hoạt động" },
  { href: "#about", label: "Giới thiệu" },
];

const SOCIAL_LINKS = [
  { href: "https://github.com", icon: Github, label: "GitHub" },
  { href: "mailto:contact@itexam.vn", icon: Mail, label: "Email" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [footerRef, isRevealed] = useScrollReveal<HTMLElement>({
    threshold: 0.2,
    rootMargin: "0px 0px -20px 0px",
  });

  return (
    <footer
      ref={footerRef}
      className="border-t border-border bg-card px-6 py-12"
    >
      <div className="mx-auto max-w-6xl">
        <div
          className={`flex flex-col gap-8 transition-all duration-700 ease-out ${
            isRevealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Main footer content */}
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Logo */}
            <div className="group flex items-center gap-2 text-lg font-semibold text-foreground">
              <BookOpen className="size-5 text-primary transition-transform duration-200 group-hover:scale-110" />
              <span>IT Exam System</span>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="cursor-pointer text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-muted-foreground transition-all duration-200 hover:scale-110 hover:text-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-border" />

          {/* Copyright and additional info */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} IT Exam System. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Made with ❤️ in Vietnam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
