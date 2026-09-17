import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { followUser, unfollowUser, getFollowers,  getFollowing, } from "./api";

export const useFollowUser = () => {
  return useMutation({
    mutationFn: followUser,
  });
};

export const useUnfollowUser = () => {
  return useMutation({
    mutationFn: unfollowUser,
  });
};

export const useFollowers = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ["followers", userId],
    queryFn: ({ pageParam }) =>
      getFollowers(userId, 20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor
        : undefined,
    enabled: Boolean(userId),
  });
};

export const useFollowing = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ["following", userId],
    queryFn: ({ pageParam }) =>
      getFollowing(userId, 20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor
        : undefined,
    enabled: Boolean(userId),
  });
};