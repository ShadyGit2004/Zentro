import { useInfiniteQuery } from "@tanstack/react-query";

import { searchPosts, searchUsers } from "./api";

export const useSearchUsers = (
  query: string,
  enabled: boolean
) => {
  return useInfiniteQuery({
    queryKey: ["search-users", query],

    queryFn: ({ pageParam }) =>
      searchUsers(query, 20, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor
        : undefined,

    enabled: enabled && query.length >= 2,
  });
};


export const useSearchPosts = (
  query: string,
  enabled: boolean
) => {
  return useInfiniteQuery({
    queryKey: ["search-posts", query],

    queryFn: ({ pageParam }) =>
      searchPosts(query, 20, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor
        : undefined,

    enabled: enabled && query.length >= 2,
  });
};