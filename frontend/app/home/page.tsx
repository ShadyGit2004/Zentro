"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/features/auth/AuthProvider";

import Feed from "@/features/feed/components/Feed";

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
      <section className="mx-auto max-w-3xl pb-24 md:pb-6">
        <div className="border-b px-4 py-6 md:px-6">
          <h1 className="text-2xl font-bold tracking-tight">Home</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.displayName}.
          </p>
        </div>

        <Feed />
      </section>
    </AppShell>
  );
}
