"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { registerSchema, RegisterFormData } from "@/features/auth/schemas";
import { registerUser, signInWithGoogle } from "@/features/auth/api";
import { getPasswordStrength } from "@/features/auth/password-strength";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tReg = useTranslations("register");

  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const password = watch("password", "");
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setServerError("");

      await registerUser(data);

      toast.success("Account created successfully.");

      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Unable to create your account. Please try again.");
      toast.error(message);
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setGoogleLoading(true);
      setServerError("");

      const res = await signInWithGoogle();

      setAuth(res.data.accessToken, res.data.user);

      toast.success("Account created successfully.");

      router.push("/home");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Google sign-up failed. Please try again.");

      toast.error(message);
      setServerError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">{t("displayName")}</Label>

          <Input
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder={tReg("displayNamePlaceholder")}
            {...register("displayName")}
            aria-invalid={!!errors.displayName}
          />

          {errors.displayName && (
            <p className="text-sm text-destructive">
              {errors.displayName.message}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">{t("username")}</Label>

          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder={tReg("usernamePlaceholder")}
            {...register("username")}
            aria-invalid={!!errors.username}
          />

          {errors.username && (
            <p className="text-sm text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>

          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={tReg("emailPlaceholder")}
            {...register("email")}
            aria-invalid={!!errors.email}
          />

          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={tReg("passwordPlaceholder")}
              {...register("password")}
              aria-invalid={!!errors.password}
              className="pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>

          {password && (
            <p className="text-xs text-muted-foreground">
              {t("passwordStrength")}{" "}
              <span className="font-medium text-foreground">
                {passwordStrength}
              </span>
            </p>
          )}

          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Server Error */}
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            {serverError}
          </div>
        )}

        {/* Email Register */}
        <Button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("creatingAccount")}
            </>
          ) : (
            t("createAccount")
          )}
        </Button>
      </form>

      {/* Divider */}
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

      {/* Google Register */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loading || googleLoading}
        onClick={handleGoogleRegister}
      >
        {googleLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
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
