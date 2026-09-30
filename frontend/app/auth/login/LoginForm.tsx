"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginSchema, LoginFormData } from "@/features/auth/schemas";

import { loginUser, signInWithGoogle } from "@/features/auth/api";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tLogin = useTranslations("login");

  const { setAuth } = useAuth();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setServerError("");

      const res = await loginUser(data);
      toast.success(tLogin("loginSuccess"));
      setAuth(res.data.accessToken, res.data.user);
      router.push("/home");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, tLogin("unableToLogin")));
      setServerError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setServerError("");

      const res = await signInWithGoogle();

      setAuth(res.data.accessToken, res.data.user);
      router.push("/home");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, tLogin("googleSignInFailed")));
      setServerError(getApiErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>

          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={tLogin("emailPlaceholder")}
            aria-invalid={!!errors.email}
            {...register("email")}
          />

          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("password")}</Label>

            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={tLogin("passwordPlaceholder")}
              className="pr-10"
              aria-invalid={!!errors.password}
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || googleLoading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("signingIn")}
            </>
          ) : (
            t("signIn")
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-muted/40 px-3 text-muted-foreground">
            {t("or")}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loading || googleLoading}
        onClick={handleGoogleLogin}
      >
        {googleLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("continueWithGoogle")}
          </>
        ) : (
          <>
            <span className="text-base font-semibold">G</span>
            {t("continueWithGoogle")}
          </>
        )}
      </Button>
    </div>
  );
}
