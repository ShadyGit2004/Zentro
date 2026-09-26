import { useInfiniteQuery } from "@tanstack/react-query";

import { getFeed } from "./api";

export const useFeed = (enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    enabled,
    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) => getFeed(20, pageParam),

    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasNextPage) {
        return undefined;
      }

      return lastPage.pagination.nextCursor ?? undefined;
    },
  });
};