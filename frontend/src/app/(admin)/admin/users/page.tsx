"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Shield,
  User,
  MoreHorizontal,
  Eye,
  UserCog,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAdminUsers,
  useUpdateAdminUser,
  useDeleteAdminUser,
} from "@/hooks/admin";
import type { UserListOut } from "@/services/admin";
import { toast } from "sonner";
import { fadeInDown } from "@/lib/motion";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [editingUser, setEditingUser] = useState<UserListOut | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserListOut | null>(null);

  const limit = 10;
  const { data, isLoading, refetch } = useAdminUsers({
    skip: page * limit,
    limit,
    search: search || undefined,
    role: roleFilter !== "all" ? (roleFilter as "user" | "admin") : undefined,
  });

  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();

  const handleRoleChange = async (newRole: "user" | "admin") => {
    if (!editingUser) return;
    try {
      await updateMutation.mutateAsync({
        userId: editingUser.id,
        data: { role: newRole },
      });
      toast.success("Đã cập nhật vai trò");
      setEditingUser(null);
      refetch();
    } catch {
      toast.error("Không thể cập nhật vai trò");
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteMutation.mutateAsync(deletingUser.id);
      toast.success("Đã xóa người dùng");
      setDeletingUser(null);
      refetch();
    } catch {
      toast.error("Không thể xóa người dùng");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInDown} initial="hidden" animate="visible">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Quản lý người dùng
        </h1>
        <p className="mt-1 text-muted-foreground">
          Xem và quản lý tài khoản người dùng trong hệ thống
        </p>
      </motion.div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Users className="size-5 text-primary" />
            Danh sách người dùng
            {data && (
              <Badge variant="secondary" className="ml-2">
                {data.total}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead>Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="text-center">Số bài thi</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="size-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Không tìm thấy người dùng
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((user) => (
                  <TableRow key={user.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                          <User className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className={user.role === "admin" ? "bg-primary" : ""}
                      >
                        {user.role === "admin" ? (
                          <>
                            <Shield className="mr-1 size-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="mr-1 size-3" />
                            User
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {user.exam_count}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>
                              <Eye className="mr-2 size-4" />
                              Xem chi tiết
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingUser(user)}
                          >
                            <UserCog className="mr-2 size-4" />
                            Đổi vai trò
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingUser(user)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Xóa người dùng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {page * limit + 1} -{" "}
                {Math.min((page + 1) * limit, data.total)} / {data.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= data.total}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi vai trò người dùng</DialogTitle>
            <DialogDescription>
              Thay đổi vai trò cho <strong>{editingUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex gap-4">
              <Button
                variant={editingUser?.role === "user" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleRoleChange("user")}
                disabled={updateMutation.isPending}
              >
                <User className="mr-2 size-4" />
                User
              </Button>
              <Button
                variant={editingUser?.role === "admin" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleRoleChange("admin")}
                disabled={updateMutation.isPending}
              >
                <Shield className="mr-2 size-4" />
                Admin
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingUser}
        onOpenChange={() => setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa <strong>{deletingUser?.name}</strong>? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
