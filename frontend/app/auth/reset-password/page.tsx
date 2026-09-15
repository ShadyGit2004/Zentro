"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-muted/40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
