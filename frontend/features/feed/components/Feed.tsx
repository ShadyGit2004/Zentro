"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import PostCard from "@/features/posts/components/PostCard";
import { useFeed } from "../hooks";
import FeedSkeleton from "./FeedSkeleton";
import { getApiErrorMessage } from "@/lib/api-error";

export default function Feed() {
  const t = useTranslations("feed");
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();

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

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          {getApiErrorMessage(error, t("error"))}
        </p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4 text-center">
        <div>
          <h2 className="font-semibold">{t("noPosts")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noPostsDesc")}
          </p>

        </div>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {hasNextPage && (
        <>
          <div ref={loadMoreRef} className="h-10" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
