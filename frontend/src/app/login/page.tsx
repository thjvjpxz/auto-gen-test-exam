"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Mail,
  Lock,
  GraduationCap,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
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
import {
  staggerContainer,
  springItem,
  fadeInDown,
  fadeInScale,
  blobFloat,
  blobFloatAlt,
  shakeAnimation,
} from "@/lib/motion";

const FORM_DEFAULT_VALUES: LoginFormData = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const formControls = useAnimation();
  const loginMutation = useLogin();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  });

  const onSubmit = useCallback(
    (data: LoginFormData) => {
      const trimmedData = {
        ...data,
        email: data.email.trim(),
      };
      loginMutation.mutate(trimmedData, {
        onError: (error) => {
          setFormValidationErrors(form, error);
        },
      });
    },
    [loginMutation, form],
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

  useEffect(() => {
    if (errorMessage || loginMutation.error) {
      formControls.start("shake");
    }
  }, [errorMessage, loginMutation.error, formControls]);

  const isPending = loginMutation.isPending;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl"
        variants={blobFloat}
        animate="animate"
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-accent/10 blur-3xl"
        variants={blobFloatAlt}
        animate="animate"
      />
      <motion.div
        className="pointer-events-none absolute left-1/4 top-1/3 size-64 rounded-full bg-primary/5 blur-3xl"
        variants={blobFloatAlt}
        animate="animate"
        style={{ animationDelay: "2s" }}
      />

      <motion.div variants={fadeInDown} initial="hidden" animate="visible">
        <Link
          href="/"
          className="group absolute left-4 top-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Về trang chủ
        </Link>
      </motion.div>

      <motion.div
        className="w-full max-w-md"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={{ ...springItem, ...shakeAnimation }}
          animate={formControls}
        >
          <Card className="relative overflow-hidden border-2 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-accent" />

            <CardHeader className="space-y-1 pt-8 text-center">
              <motion.div
                variants={fadeInScale}
                className="mb-4 flex justify-center"
              >
                <motion.div
                  className="group relative rounded-full bg-primary/10 p-3 transition-all duration-300 hover:scale-105 hover:bg-primary/20"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <GraduationCap className="size-8 text-primary transition-transform duration-300" />
                  <motion.div
                    className="absolute -right-1 -top-1"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="size-4 text-accent" />
                  </motion.div>
                </motion.div>
              </motion.div>
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
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
                      role="alert"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <AlertCircle className="size-4" />
                      </motion.div>
                      {errorMessage}
                    </motion.div>
                  ) : null}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel
                          className={`transition-colors duration-200 ${emailFocused ? "text-primary" : ""}`}
                        >
                          Email
                        </FormLabel>
                        <div className="group relative">
                          <motion.div
                            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
                            animate={{
                              scale: emailFocused ? 1.1 : 1,
                              color: emailFocused
                                ? "hsl(var(--primary))"
                                : "hsl(var(--muted-foreground))",
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <Mail className="size-4" />
                          </motion.div>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                              disabled={isPending}
                              autoFocus
                              {...field}
                              onFocus={() => setEmailFocused(true)}
                              onBlur={() => {
                                field.onBlur();
                                setEmailFocused(false);
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel
                          className={`transition-colors duration-200 ${passwordFocused ? "text-primary" : ""}`}
                        >
                          Mật khẩu
                        </FormLabel>
                        <div className="group relative">
                          <motion.div
                            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
                            animate={{
                              scale: passwordFocused ? 1.1 : 1,
                              color: passwordFocused
                                ? "hsl(var(--primary))"
                                : "hsl(var(--muted-foreground))",
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <Lock className="size-4" />
                          </motion.div>
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-9 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                              disabled={isPending}
                              {...field}
                              onFocus={() => setPasswordFocused(true)}
                              onBlur={() => {
                                field.onBlur();
                                setPasswordFocused(false);
                              }}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground transition-all duration-200 hover:scale-110 hover:text-foreground"
                            tabIndex={-1}
                            aria-label={
                              showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="submit"
                      className="glow-effect w-full transition-all duration-200"
                      disabled={isPending}
                      size="lg"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        "Đăng nhập"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-8">
              <div className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="cursor-pointer font-medium text-primary transition-all duration-200 hover:text-primary/80 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </div>
              <div className="text-center text-xs text-muted-foreground/60">
                {env.APP_NAME}
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          variants={springItem}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <motion.div
            className="flex items-center gap-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <ShieldCheck className="size-3.5 text-accent" />
            <span>Bảo mật SSL</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <div className="size-1.5 animate-pulse rounded-full bg-green-500" />
            <span>An toàn 100%</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
