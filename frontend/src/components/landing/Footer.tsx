"use client";

import { BookOpen, Github, Mail, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { springItem, defaultViewport } from "@/lib/motion";

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

/**
 * Footer component with fade-in animation using Framer Motion.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card px-6 py-12">
      <motion.div
        className="mx-auto max-w-6xl"
        variants={springItem}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="group flex items-center gap-2 text-lg font-semibold text-foreground">
              <BookOpen className="size-5 text-primary transition-transform duration-200 group-hover:scale-110" />
              <span>IT Exam System</span>
            </div>

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

          <div className="h-px w-full bg-border" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} IT Exam System. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Made with ❤️ in Vietnam
            </p>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
