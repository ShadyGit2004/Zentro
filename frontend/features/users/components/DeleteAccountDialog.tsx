"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { clearAuth } = useAuth();

  const mutation = useDeleteAccount();

  const handleDelete = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        onOpenChange(false);

        toast.success("Account deleted successfully.");

        router.replace("/auth/login");
      },

      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Unable to delete account."));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          This action cannot be undone. Your account and associated data will be
          permanently deleted.
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={handleDelete}
          >
            {mutation.isPending ? "Deleting..." : "Delete account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
