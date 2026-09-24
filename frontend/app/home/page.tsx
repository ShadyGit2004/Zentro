"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/features/auth/AuthProvider";

import Feed from "@/features/feed/components/Feed";
import CreatePost from "@/features/posts/components/CreatePost";
import TrendingHashtags from "@/features/trending/components/TrendingHashtags";

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
      <div className="mx-auto max-w-7xl">
        {/* Mobile Trending */}
        <div className="mb-6 lg:hidden">
          <TrendingHashtags />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main feed */}
          <section className="min-w-0 pb-24 md:pb-6">
            <div className="border-b px-4 py-6 md:px-6">
              <h1 className="text-2xl font-bold tracking-tight">Home</h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Welcome back, {user.displayName}.
              </p>
            </div>

            <CreatePost />
            <Feed />
          </section>

          {/* Desktop Trending */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <TrendingHashtags />
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
