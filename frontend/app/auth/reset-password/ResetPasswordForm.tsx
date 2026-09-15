"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/features/auth/schemas";

import { resetPassword } from "@/features/auth/api";
import { getApiErrorMessage } from "@/lib/api-error";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError("Password reset token is missing or invalid.");
      return;
    }

    try {
      setLoading(true);
      setServerError("");

      const res = await resetPassword({
        token,
        newPassword: data.password,
      });

      console.log(res)

      setSuccess(true);
    } catch (error: unknown) {
      setServerError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-xl border bg-background p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Password updated
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your password has been reset successfully. You can now sign in
              with your new password.
            </p>

            <Button
              className="mt-6 w-full"
              onClick={() => router.push("/auth/login")}
            >
              Continue to login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight">Zentro</span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a new password for your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-xl border bg-background p-6 shadow-sm"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter your new password"
                className="pr-10"
                aria-invalid={!!errors.password}
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>

            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your new password"
                className="pr-10"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((previous) => !previous)}
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
