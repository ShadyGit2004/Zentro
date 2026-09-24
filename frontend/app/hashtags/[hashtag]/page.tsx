"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import PostCard from "@/features/posts/components/PostCard";
import { useHashtagPosts } from "@/features/hashtags/hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import AppShell from "@/components/layout/AppShell";
import FeedSkeleton from "@/features/feed/components/FeedSkeleton";

export default function HashtagPage() {
  const params = useParams();

  const hashtag =
    typeof params.hashtag === "string"
      ? decodeURIComponent(params.hashtag).toLowerCase()
      : "";

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHashtagPosts(hashtag);

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const hashtagInfo = data?.pages[0]?.hashtag;

  return (
    <AppShell>
      {isLoading && (
        <>
          <div className="border-b px-4 py-6">
            <div className="h-7 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
          <FeedSkeleton />
        </>
      )}

      {isError && (
        <p className="text-center text-sm text-muted-foreground">
          {getApiErrorMessage(
            error,
            "Unable to load hashtag posts. Please try again."
          )}
        </p>
      )}

      {!isError && (
        <>
          <header className="border-b px-4 py-6">
            <h1 className="text-2xl font-bold">
              #{hashtagInfo?.name ?? hashtag}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {hashtagInfo?.postsCount ?? 0}{" "}
              {hashtagInfo?.postsCount === 1 ? "post" : "posts"}
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No posts found for #{hashtag}.
              </p>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}

              {hasNextPage && (
                <div className="flex justify-center px-4 py-6">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-sm font-medium hover:underline disabled:opacity-50"
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
