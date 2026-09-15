"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/features/auth/AuthProvider";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </main>
    );
  }

  return (
    <AppShell>
      <section>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Home</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.displayName}.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold">Your feed is coming next</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll connect the real Zentro feed here next.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
