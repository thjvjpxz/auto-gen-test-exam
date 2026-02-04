"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  User as UserIcon,
  FileText,
  BookOpen,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/hooks/auth";

interface UserLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for user-facing pages with simple header.
 */
export default function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isAdmin = user?.role === "admin";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-lg font-semibold text-foreground transition-colors duration-200 hover:text-primary"
          >
            <BookOpen className="size-6 text-primary transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden sm:inline">IT Exam</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/exams">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                <FileText className="size-4 mr-2" />
                <span className="hidden sm:inline">Bài thi</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10"
                >
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                    <UserIcon className="size-4 text-primary" />
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
                    <UserIcon className="size-4" />
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
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="size-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
