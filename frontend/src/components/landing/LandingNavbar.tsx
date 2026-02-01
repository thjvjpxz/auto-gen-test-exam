"use client";

import Link from "next/link";
import { BookOpen, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "#features", label: "Tính năng" },
  { href: "#how-it-works", label: "Cách hoạt động" },
  { href: "#about", label: "Giới thiệu" },
];

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isAdmin = user?.role === "admin";

  return (
    <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl animate-fade-in-down">
      <nav
        className={`flex items-center justify-between rounded-lg border px-6 py-3 backdrop-blur-md transition-all duration-300 ${
          isScrolled
            ? "border-border bg-card/95 shadow-lg"
            : "border-border/50 bg-card/80"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold text-foreground transition-colors duration-200 hover:text-primary"
        >
          <BookOpen className="size-6 text-primary transition-transform duration-200 group-hover:scale-110" />
          <span className="hidden sm:inline">IT Exam</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className="relative cursor-pointer text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {link.label}
              {/* Underline animation on hover */}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA buttons or User menu */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 transition-all duration-200 hover:bg-primary/10"
                >
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                    <User className="size-4 text-primary" />
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/exams" className="flex items-center gap-2">
                    <BookOpen className="size-4" />
                    Danh sách đề thi
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="size-4" />
                    Hồ sơ của tôi
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <LayoutDashboard className="size-4" />
                      Quản trị
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 size-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="transition-all duration-200 hover:bg-primary/10"
                asChild
              >
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button
                size="sm"
                className="transition-all duration-200 hover:scale-[1.02]"
                asChild
              >
                <Link href="/register">Bắt đầu ngay</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="cursor-pointer p-2 transition-transform duration-200 active:scale-95 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className="relative block size-5">
            <Menu
              className={`absolute inset-0 size-5 text-foreground transition-all duration-200 ${
                isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
              }`}
            />
            <X
              className={`absolute inset-0 size-5 text-foreground transition-all duration-200 ${
                isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu with slide-in animation */}
      <div
        id="mobile-menu"
        className={`mt-2 overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 ease-out md:hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                className={`cursor-pointer py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground ${
                  isMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 h-px bg-border" />
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 py-2 text-sm font-medium text-foreground">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                    <User className="size-3 text-primary" />
                  </div>
                  {user.name}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  asChild
                >
                  <Link href="/exams">Danh sách đề thi</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  asChild
                >
                  <Link href="/profile">Hồ sơ của tôi</Link>
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    asChild
                  >
                    <Link href="/admin">Quản trị</Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-red-600 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 size-4" />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  asChild
                >
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Bắt đầu ngay</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
