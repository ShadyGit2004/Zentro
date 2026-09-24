"use client";

import Link from "next/link";
import { Hash } from "lucide-react";

import { useTrendingHashtags } from "../hooks";
import { getApiErrorMessage } from "@/lib/api-error";

const TrendingHashtags = () => {
  const { data, isLoading, isError, error } = useTrendingHashtags(10);

  if (isLoading) {
    return (
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-4 text-base font-semibold">Trending</h2>

        {/* Desktop loading */}
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Mobile loading */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-1 text-base font-semibold">Trending</h2>

        <p className="text-sm text-muted-foreground">
          {getApiErrorMessage(error, "Unable to load trending hashtags.")}
        </p>
      </section>
    );
  }

  const hashtags = data?.data ?? [];

  if (hashtags.length === 0) {
    return (
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-1 text-base font-semibold">Trending</h2>

        <p className="text-sm text-muted-foreground">
          No trending hashtags right now.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="mb-4 text-base font-semibold">Trending</h2>

      {/* Desktop */}
      <div className="hidden space-y-1 lg:block">
        {hashtags.map((hashtag) => (
          <Link
            key={hashtag._id}
            href={`/hashtags/${encodeURIComponent(hashtag.name)}`}
            className="block rounded-lg px-2 py-3 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />

              <span className="truncate font-medium">#{hashtag.name}</span>
            </div>

            <p className="ml-6 text-xs text-muted-foreground">
              {hashtag.recentPostsCount}{" "}
              {hashtag.recentPostsCount === 1 ? "post" : "posts"} in the last
              24h
            </p>
          </Link>
        ))}
      </div>

      {/* Mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:hidden">
        {hashtags.map((hashtag) => (
          <Link
            key={hashtag._id}
            href={`/hashtags/${encodeURIComponent(hashtag.name)}`}
            className="flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <span>#{hashtag.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TrendingHashtags;
