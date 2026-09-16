"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import PostCard from "@/features/posts/components/PostCard";
import { useFeed } from "../hooks";

export default function Feed() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Unable to load your feed. Please try again.
        </p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4 text-center">
        <div>
          <h2 className="font-semibold">Your feed is empty</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Follow people and their posts will appear here.
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
        <div className="flex justify-center px-4 py-6">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}