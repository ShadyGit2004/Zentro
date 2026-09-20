"use client";

import { useEffect, useRef } from "react";
import { Bookmark as BookmarkIcon } from "lucide-react";

import PostCard from "@/features/posts/components/PostCard";
import { useBookmarkedPosts } from "../hooks";
import BookmarkSkeleton from "./BookmarkSkeleton";
import { getApiErrorMessage } from "@/lib/api-error";

const Bookmark = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBookmarkedPosts();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "300px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <BookmarkSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {getApiErrorMessage(error, "Failed to load your bookmarks.")}
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <BookmarkIcon className="mb-3 h-10 w-10 text-muted-foreground" />

        <h2 className="text-lg font-semibold">No bookmarks yet</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Posts you bookmark will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {hasNextPage && (
        <>
          <div ref={loadMoreRef} className="h-10" />

          {isFetchingNextPage && (
            <div className="py-6">
              <BookmarkSkeleton />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Bookmark;
