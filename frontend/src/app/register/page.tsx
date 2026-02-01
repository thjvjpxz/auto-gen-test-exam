"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Mail,
  Lock,
  User,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/auth";
import {
  extractErrorMessage,
  extractValidationErrors,
  setFormValidationErrors,
} from "@/lib/errors";
import { env } from "@/config/env";

const FORM_DEFAULT_VALUES: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const BENEFITS = [
  "Truy cập ngân hàng đề thi đa dạng",
  "Nhận kết quả và phân tích chi tiết",
  "Theo dõi tiến độ học tập",
];

export default function RegisterPage() {
  const registerMutation = useRegister();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  });

  const onSubmit = useCallback(
    (data: RegisterFormData) => {
      registerMutation.mutate(data, {
        onError: (error) => {
          setFormValidationErrors(form, error);
        },
      });
    },
    [registerMutation, form],
  );

  const errorMessage = useMemo(() => {
    if (!registerMutation.error) return null;
    const validationErrors = extractValidationErrors(registerMutation.error);
    if (validationErrors && validationErrors.length > 0) {
      return null;
    }
    return extractErrorMessage(
      registerMutation.error,
      "Đăng ký thất bại. Vui lòng thử lại.",
    );
  }, [registerMutation.error]);

  const isPending = registerMutation.isPending;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 p-4 py-8">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-accent/10 blur-3xl" />

      {/* Back to home link */}
      <Link
        href="/"
        className="animate-fade-in-down group absolute left-4 top-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
        Về trang chủ
      </Link>

      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="relative overflow-hidden border-2 shadow-lg transition-shadow duration-300 hover:shadow-xl">
          {/* Subtle top gradient accent */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-accent via-primary/80 to-primary" />

          <CardHeader className="space-y-1 pt-8 text-center">
            {/* Animated logo */}
            <div className="animate-fade-in-scale animation-delay-200 mb-4 flex justify-center">
              <div className="group rounded-full bg-accent/10 p-3 transition-all duration-300 hover:bg-accent/20 hover:scale-105">
                <GraduationCap className="size-8 text-accent transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
            <CardTitle className="animate-fade-in-up animation-delay-300 text-2xl font-bold">
              Tạo tài khoản mới
            </CardTitle>
            <CardDescription className="animate-fade-in-up animation-delay-400">
              Điền thông tin để đăng ký tài khoản
            </CardDescription>
          </CardHeader>

          <CardContent className="animate-fade-in-up animation-delay-500">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {errorMessage ? (
                  <div
                    className="animate-fade-in-scale rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                ) : null}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <div className="group relative">
                          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                          <Input
                            type="text"
                            placeholder="Nguyễn Văn A"
                            className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            disabled={isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="group relative">
                          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            disabled={isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <div className="group relative">
                          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            disabled={isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Tối thiểu 8 ký tự, bao gồm cả chữ và số
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <div className="group relative">
                          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            disabled={isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="glow-effect w-full bg-accent text-accent-foreground transition-all duration-200 hover:scale-[1.01] hover:bg-accent/90"
                  disabled={isPending}
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="animate-fade-in-up animation-delay-600 flex flex-col space-y-4 pb-8">
            <div className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="cursor-pointer font-medium text-primary transition-all duration-200 hover:text-primary/80 hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground/60">
              {env.APP_NAME}
            </div>
          </CardFooter>
        </Card>

        {/* Benefits list */}
        <div className="animate-fade-in-up animation-delay-700 mt-6 space-y-2">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              style={{ animationDelay: `${700 + index * 100}ms` }}
            >
              <CheckCircle2 className="size-4 shrink-0 text-accent" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
