"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  FileText,
  Award,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Trash2,
  UserCog,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useAdminUserDetail,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useAdjustUserCoins,
} from "@/hooks/admin";
import { toast } from "sonner";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const userId = parseInt(id, 10);
  const router = useRouter();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const { data: user, isLoading, refetch } = useAdminUserDetail(userId);
  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();

  const handleRoleChange = async (newRole: "user" | "admin") => {
    try {
      await updateMutation.mutateAsync({
        userId,
        data: { role: newRole },
      });
      toast.success("Đã cập nhật vai trò");
      setRoleDialogOpen(false);
      refetch();
    } catch {
      toast.error("Không thể cập nhật vai trò");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(userId);
      toast.success("Đã xóa người dùng");
      router.push("/admin/users");
    } catch {
      toast.error("Không thể xóa người dùng");
    }
  };

  const [coinDialogOpen, setCoinDialogOpen] = useState(false);
  const [coinAmount, setCoinAmount] = useState<string>("");
  const [coinReason, setCoinReason] = useState("");
  const adjustCoinMutation = useAdjustUserCoins();

  const handleCoinAdjustment = async () => {
    const amount = parseInt(coinAmount, 10);

    if (isNaN(amount) || amount === 0) {
      toast.error("Số lượng coin không hợp lệ");
      return;
    }

    if (amount < -10000 || amount > 10000) {
      toast.error("Số lượng phải trong khoảng -10,000 đến 10,000");
      return;
    }

    if (!coinReason.trim() || coinReason.trim().length < 3) {
      toast.error("Lý do phải có ít nhất 3 ký tự");
      return;
    }

    try {
      await adjustCoinMutation.mutateAsync({
        userId,
        data: {
          amount,
          reason: coinReason.trim(),
        },
      });
      toast.success(
        `Đã ${amount > 0 ? "cộng" : "trừ"} ${Math.abs(amount)} coin`,
      );
      setCoinDialogOpen(false);
      setCoinAmount("");
      setCoinReason("");
      refetch();
    } catch {
      toast.error("Không thể điều chỉnh coin");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="size-16 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium">Không tìm thấy người dùng</p>
        <Button asChild className="mt-4">
          <Link href="/admin/users">Quay lại</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserCog className="mr-2 size-4" />
                Đổi vai trò
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Đổi vai trò người dùng</DialogTitle>
                <DialogDescription>
                  Thay đổi vai trò cho <strong>{user.name}</strong>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex gap-4">
                  <Button
                    variant={user.role === "user" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleRoleChange("user")}
                    disabled={updateMutation.isPending}
                  >
                    <User className="mr-2 size-4" />
                    User
                  </Button>
                  <Button
                    variant={user.role === "admin" ? "default" : "outline"}
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
                <Button
                  variant="outline"
                  onClick={() => setRoleDialogOpen(false)}
                >
                  Hủy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 size-4" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa người dùng?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn xóa <strong>{user.name}</strong>? Hành động
                  này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100">
              <Mail className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-purple-100">
              <Shield className="size-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vai trò</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? "Admin" : "User"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-green-100">
              <Calendar className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tham gia</p>
              <p className="font-medium">{formatDate(user.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-orange-100">
              <FileText className="size-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số bài thi</p>
              <p className="text-2xl font-bold">{user.total_exams_taken}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-100">
                  <Coins className="size-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số dư Coin</p>
                  <p className="text-2xl font-bold">{user.coin_balance}</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => setCoinDialogOpen(true)}
            >
              <Coins className="mr-2 size-4" />
              Điều chỉnh
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <TrendingUp className="size-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Điểm trung bình</p>
              <p className="text-3xl font-bold">
                {user.average_score !== null
                  ? `${user.average_score.toFixed(1)}%`
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <Award className="size-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tỷ lệ đạt</p>
              <p className="text-3xl font-bold">
                {user.pass_rate !== null
                  ? `${user.pass_rate.toFixed(1)}%`
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <FileText className="size-5 text-primary" />
            Lịch sử làm bài
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {user.recent_attempts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <FileText className="size-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Chưa có lịch sử làm bài</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead>Đề thi</TableHead>
                  <TableHead className="text-center">Điểm</TableHead>
                  <TableHead className="text-center">Kết quả</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.recent_attempts.map((attempt) => (
                  <TableRow key={attempt.attempt_id}>
                    <TableCell>
                      <Link
                        href={`/exams/${attempt.exam_id}/result/${attempt.attempt_id}?from=/admin/users/${userId}`}
                        className="font-medium hover:text-primary"
                      >
                        {attempt.exam_title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">
                        {attempt.score.toFixed(1)} /{" "}
                        {attempt.max_score.toFixed(1)}
                      </span>
                      {attempt.percentage !== null && (
                        <span className="ml-1 text-sm text-muted-foreground">
                          ({attempt.percentage.toFixed(0)}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {attempt.passed ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="mr-1 size-3" />
                          Đạt
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <XCircle className="mr-1 size-3" />
                          Không đạt
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(attempt.submitted_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Coin Adjustment Dialog */}
      <Dialog open={coinDialogOpen} onOpenChange={setCoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh Coin</DialogTitle>
            <DialogDescription>
              Thay đổi số dư coin cho <strong>{user.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coin-amount">
                Số lượng (+ để cộng, - để trừ)
              </Label>
              <Input
                id="coin-amount"
                type="number"
                placeholder="Ví dụ: 100 hoặc -50"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                min="-10000"
                max="10000"
              />
              <p className="text-xs text-muted-foreground">
                Giới hạn: -10,000 đến 10,000
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coin-reason">Lý do</Label>
              <Textarea
                id="coin-reason"
                placeholder="Ví dụ: Bù đắp lỗi hệ thống, thưởng sự kiện..."
                value={coinReason}
                onChange={(e) => setCoinReason(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {coinReason.length}/200 ký tự
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Số dư hiện tại:</span>
                <span className="font-semibold">{user.coin_balance}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Số dư sau điều chỉnh:
                </span>
                <span className="font-bold text-primary">
                  {coinAmount && !isNaN(parseInt(coinAmount, 10))
                    ? user.coin_balance + parseInt(coinAmount, 10)
                    : user.coin_balance}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCoinDialogOpen(false);
                setCoinAmount("");
                setCoinReason("");
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCoinAdjustment}
              disabled={adjustCoinMutation.isPending}
            >
              {adjustCoinMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
