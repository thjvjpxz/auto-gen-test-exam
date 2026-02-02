"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  List,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  X,
  Users,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: { title: string; href: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Đề thi",
    href: "/admin/exams",
    icon: FileText,
    children: [
      { title: "Danh sách", href: "/admin/exams", icon: List },
      { title: "Sinh đề mới", href: "/admin/exams/generate", icon: Sparkles },
    ],
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Bài làm",
    href: "/admin/attempts",
    icon: ClipboardList,
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function AdminSidebar({
  isCollapsed,
  onToggle,
  isMobile = false,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (isMobile) {
      onToggle();
    }
  };

  return (
    <aside
      className={cn(
        "h-screen border-r border-border bg-background transition-all duration-300",
        isMobile ? "w-64" : "fixed left-0 top-0 z-40",
        !isMobile && (isCollapsed ? "w-[68px]" : "w-64"),
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-3">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 transition-all duration-300",
              isCollapsed && !isMobile && "justify-center",
            )}
            onClick={handleNavClick}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md transition-transform duration-200 hover:scale-105">
              <GraduationCap className="size-5 text-white" />
            </div>
            {(!isCollapsed || isMobile) && (
              <span className="animate-fade-in font-heading text-lg font-bold text-foreground">
                ExamGen
              </span>
            )}
          </Link>

          {/* Desktop collapse button */}
          {!isMobile && !isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="size-8 cursor-pointer transition-all duration-200 hover:bg-muted"
              aria-label="Thu gọn sidebar"
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}

          {/* Mobile close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="size-8 cursor-pointer transition-all duration-200 hover:bg-muted"
              aria-label="Đóng menu"
            >
              <X className="size-5" />
            </Button>
          )}
        </div>

        {/* Collapsed toggle button (desktop only) */}
        {!isMobile && isCollapsed && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="size-8 cursor-pointer transition-all duration-200 hover:bg-muted"
              aria-label="Mở rộng sidebar"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              item.children?.some((child) => pathname === child.href);

            const navLinkContent = (
              <Link
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && !isMobile && "justify-center px-2",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                {(!isCollapsed || isMobile) && <span>{item.title}</span>}
              </Link>
            );

            return (
              <div key={item.href}>
                {isCollapsed && !isMobile ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{navLinkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  navLinkContent
                )}

                {/* Children */}
                {(!isCollapsed || isMobile) && item.children && isActive && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/20 pl-4">
                    {item.children.map((child, childIndex) => {
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={handleNavClick}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
                            pathname === child.href
                              ? "bg-primary/5 font-medium text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                          style={{
                            animationDelay: `${childIndex * 50 + 100}ms`,
                          }}
                        >
                          <ChildIcon className="size-4" />
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          {!isCollapsed || isMobile ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 py-2">
              <div className="size-1.5 rounded-full bg-accent" />
              <p className="text-xs font-medium text-muted-foreground">
                Auto Gen Test Exam v1.0
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="size-2 rounded-full bg-accent" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
