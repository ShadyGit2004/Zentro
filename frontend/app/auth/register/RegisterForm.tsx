"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { registerSchema, RegisterFormData } from "@/features/auth/schemas";
import { registerUser } from "@/features/auth/api";
import { getPasswordStrength } from "@/features/auth/password-strength";
import { getApiErrorMessage } from "@/lib/api-error";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
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

      const res = await registerUser(data);

      console.log(res);

      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      setServerError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>

        <Input
          id="displayName"
          type="text"
          autoComplete="name"
          placeholder="Rajat Pandey"
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
        <Label htmlFor="username">Username</Label>

        <Input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="rajatpandey"
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
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          aria-invalid={!!errors.email}
        />

        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            {...register("password")}
            aria-invalid={!!errors.password}
            className="pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
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
            Password strength:{" "}
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

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}

        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};
