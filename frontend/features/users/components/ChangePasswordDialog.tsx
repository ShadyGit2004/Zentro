"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useUpdatePassword } from "../../profile/hooks";
import { updatePasswordSchema } from "../../profile/schema";
import type { UpdatePasswordFormData } from "../../profile/schema";

import { getApiErrorMessage } from "@/lib/api-error";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const t = useTranslations("changePassword");
  const tCommon = useTranslations("common");
  const mutation = useUpdatePassword();

  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: UpdatePasswordFormData) => {
    try {
      await mutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success(t("updated"));

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("unableToUpdate")));
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset();
    }

    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t("currentPassword")}</label>

            <Input
              type="password"
              placeholder={t("currentPasswordPlaceholder")}
              {...form.register("currentPassword")}
            />

            {form.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("newPassword")}</label>

            <Input
              type="password"
              placeholder={t("newPasswordPlaceholder")}
              {...form.register("newPassword")}
            />

            {form.formState.errors.newPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("confirmNewPassword")}</label>

            <Input
              type="password"
              placeholder={t("confirmNewPasswordPlaceholder")}
              {...form.register("confirmPassword")}
            />

            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              {tCommon("cancel")}
            </Button>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("updating") : t("updatePassword")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
