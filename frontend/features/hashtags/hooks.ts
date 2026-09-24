import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getHashtagPosts, searchHashtags } from "./api";

export const useHashtagPosts = (hashtag: string) => {
  return useInfiniteQuery({
    queryKey: ["hashtag-posts", hashtag],

    queryFn: ({ pageParam }) => getHashtagPosts(hashtag, 20, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor ?? undefined
        : undefined,

    enabled: Boolean(hashtag),
  });
};

// existing useHashtagPosts stays as it is

export const useSearchHashtags = (query: string) => {
  const search = query.trim().replace(/^#/, "");

  return useQuery({
    queryKey: ["hashtag-search", search],
    queryFn: () => searchHashtags(search, 20),
    enabled: search.length > 0,
  });
};
