"use client";

import { useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/features/auth/schemas";

import { forgotPassword } from "@/features/auth/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";

export default function ForgotPasswordForm() {
  const t = useTranslations("forgotPassword");
  const tAuth = useTranslations("auth");

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      setServerError("");
      setSuccess(false);

      const res = await forgotPassword(data);
      toast.success(res.data.message || t("checkEmailDesc"));
      setSuccess(true);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t("checkEmailDesc")));
      setServerError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border bg-background p-6 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <h2 className="text-lg font-semibold">{t("checkEmail")}</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("checkEmailDesc")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border bg-background p-6 shadow-sm"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="email">{tAuth("email")}</Label>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            className="pl-9"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>

        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
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
            {tAuth("sendingResetLink")}
          </>
        ) : (
          tAuth("sendResetLink")
        )}
      </Button>
    </form>
  );
}
