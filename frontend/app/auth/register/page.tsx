import Link from "next/link";
import { ArrowRight } from "lucide-react";

import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            Zentro
          </Link>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Join Zentro and start sharing what matters.
          </p>
        </div>

        <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          <RegisterForm />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
              <ArrowRight className="ml-1 inline size-3.5" />
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By creating an account, you agree to use Zentro responsibly.
        </p>
      </div>
    </main>
  );
};
