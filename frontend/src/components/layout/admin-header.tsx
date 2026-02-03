"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Menu,
  BookOpen,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { fadeInDown } from "@/lib/motion";

interface AdminHeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function AdminHeader({ onMenuClick, showMenuButton }: AdminHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <motion.header
      variants={fadeInDown}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur-md"
    >
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="cursor-pointer transition-all duration-200 hover:scale-105 lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="size-5" />
          </Button>
        )}
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold text-foreground transition-colors duration-200 hover:text-primary"
        >
          <BookOpen className="size-6 text-primary transition-transform duration-200 group-hover:scale-110" />
          <span className="hidden sm:inline">IT Exam</span>
        </Link>
        <span className="hidden text-muted-foreground sm:inline">|</span>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="size-4 text-primary" />
          <span className="font-medium text-foreground">Quản trị</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                <User className="size-4 text-primary" />
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {user?.name || user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-muted-foreground text-xs truncate">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="size-4" />
                Trang chủ
              </Link>
            </DropdownMenuItem>
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
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <LayoutDashboard className="size-4" />
                Quản trị
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="size-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
