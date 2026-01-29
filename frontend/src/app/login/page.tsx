"use client";

import { useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Mail } from "lucide-react";
import { Lock } from "lucide-react";
import { GraduationCap } from "lucide-react";
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
} from "@/components/ui/form";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/auth";
import {
  extractErrorMessage,
  extractValidationErrors,
  setFormValidationErrors,
} from "@/lib/errors";
import { env } from "@/config/env";

const FORM_DEFAULT_VALUES: LoginFormData = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const loginMutation = useLogin();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  });

  const formRef = useRef(form);
  formRef.current = form;

  const onSubmit = useCallback(
    (data: LoginFormData) => {
      loginMutation.mutate(data, {
        onError: (error) => {
          setFormValidationErrors(formRef.current, error);
        },
      });
    },
    [loginMutation],
  );

  const errorMessage = useMemo(() => {
    if (!loginMutation.error) return null;
    const validationErrors = extractValidationErrors(loginMutation.error);
    if (validationErrors && validationErrors.length > 0) {
      return null;
    }
    return extractErrorMessage(
      loginMutation.error,
      "Đăng nhập thất bại. Vui lòng thử lại.",
    );
  }, [loginMutation.error]);

  const isPending = loginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Đăng nhập vào hệ thống
            </CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {errorMessage ? (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    {errorMessage}
                  </div>
                ) : null}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            className="pl-9"
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
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-9"
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
                  className="w-full"
                  disabled={isPending}
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline transition-colors cursor-pointer"
              >
                Đăng ký ngay
              </Link>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              {env.APP_NAME}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
