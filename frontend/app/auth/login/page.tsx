import Link from "next/link";

import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Zentro
          </Link>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
