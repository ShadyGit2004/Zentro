"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { useDeleteAccount } from "../../profile/hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const t = useTranslations("deleteAccount");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { clearAuth } = useAuth();

  const mutation = useDeleteAccount();

  const handleDelete = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        onOpenChange(false);

        toast.success(t("deleted"));

        router.replace("/auth/login");
      },

      onError: (error) => {
        toast.error(getApiErrorMessage(error, t("unableToDelete")));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {t("desc")}
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            {tCommon("cancel")}
          </Button>

          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={handleDelete}
          >
            {mutation.isPending ? t("deleting") : tCommon("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
