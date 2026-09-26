import { useInfiniteQuery } from "@tanstack/react-query";
import { getLoginHistory } from "./api";

export const useLoginHistory = (enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["login-history"],
    queryFn: ({ pageParam }) => getLoginHistory(pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor
        : undefined,

    enabled,
  });
};
