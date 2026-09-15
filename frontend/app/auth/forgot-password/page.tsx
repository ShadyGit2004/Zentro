import Link from "next/link";

import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Zentro
          </Link>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
