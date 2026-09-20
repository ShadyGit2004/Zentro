import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type { InfiniteData } from "@tanstack/react-query";

import { followUser, unfollowUser, getFollowers, getFollowing } from "./api";

import type { ProfileListResponse } from "../profile/types";

import { useAuth } from "@/features/auth/AuthProvider";

/* ----------------------------------------
   TARGET PROFILE CACHE
----------------------------------------- */

const updateTargetProfileFollowState = (
  oldData: any,
  isFollowing: boolean,
  followersCountChange: number
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    data: {
      ...oldData.data,

      isFollowing,

      followersCount: Math.max(
        0,
        oldData.data.followersCount + followersCountChange
      ),
    },
  };
};

/* ----------------------------------------
   CURRENT USER PROFILE CACHE
----------------------------------------- */

const updateCurrentUserFollowingCount = (
  oldData: any,
  followingCountChange: number
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    data: {
      ...oldData.data,

      followingCount: Math.max(
        0,
        oldData.data.followingCount + followingCountChange
      ),
    },
  };
};

/* ----------------------------------------
   FOLLOWERS / FOLLOWING LIST CACHE
----------------------------------------- */

const updateFollowStateInList = (
  oldData: InfiniteData<ProfileListResponse> | undefined,
  userId: string,
  isFollowing: boolean
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,

    pages: oldData.pages.map((page) => ({
      ...page,

      data: page.data.map((user) =>
        user._id === userId
          ? {
              ...user,
              isFollowing,
            }
          : user
      ),
    })),
  };
};

/* ----------------------------------------
   FOLLOW USER
----------------------------------------- */

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  const { user } = useAuth();

  return useMutation({
    mutationFn: followUser,

    onSuccess: (_, targetUserId) => {
      /*
       * 1. Target user's profile
       *
       * Example:
       * Rahul followersCount: 10 → 11
       * Rahul isFollowing: false → true
       */
      queryClient.setQueryData(["profile", targetUserId], (oldData: any) =>
        updateTargetProfileFollowState(oldData, true, 1)
      );

      /*
       * 2. Current user's own profile
       *
       * Example:
       * Your followingCount: 5 → 6
       */
      if (user?.id) {
        queryClient.setQueryData(["profile", user.id], (oldData: any) =>
          updateCurrentUserFollowingCount(oldData, 1)
        );
      }

      /*
       * 3. Followers lists
       *
       * If target user exists in a cached
       * followers list, update only that row.
       */
      queryClient.setQueriesData<InfiniteData<ProfileListResponse>>(
        {
          queryKey: ["followers"],
        },
        (oldData) => updateFollowStateInList(oldData, targetUserId, true)
      );

      /*
       * 4. Following lists
       *
       * If target user exists in a cached
       * following list, update only that row.
       */
      queryClient.setQueriesData<InfiniteData<ProfileListResponse>>(
        {
          queryKey: ["following"],
        },
        (oldData) => updateFollowStateInList(oldData, targetUserId, true)
      );
    },
  });
};

/* ----------------------------------------
   UNFOLLOW USER
----------------------------------------- */

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  const { user } = useAuth();

  return useMutation({
    mutationFn: unfollowUser,

    onSuccess: (_, targetUserId) => {
      /*
       * 1. Target user's profile
       *
       * Example:
       * Rahul followersCount: 11 → 10
       * Rahul isFollowing: true → false
       */
      queryClient.setQueryData(["profile", targetUserId], (oldData: any) =>
        updateTargetProfileFollowState(oldData, false, -1)
      );

      /*
       * 2. Current user's own profile
       *
       * Example:
       * Your followingCount: 6 → 5
       */
      if (user?.id) {
        queryClient.setQueryData(["profile", user.id], (oldData: any) =>
          updateCurrentUserFollowingCount(oldData, -1)
        );
      }

      /*
       * 3. Followers lists
       */
      queryClient.setQueriesData<InfiniteData<ProfileListResponse>>(
        {
          queryKey: ["followers"],
        },
        (oldData) => updateFollowStateInList(oldData, targetUserId, false)
      );

      /*
       * 4. Following lists
       */
      queryClient.setQueriesData<InfiniteData<ProfileListResponse>>(
        {
          queryKey: ["following"],
        },
        (oldData) => updateFollowStateInList(oldData, targetUserId, false)
      );
    },
  });
};

/* ----------------------------------------
   FOLLOWERS
----------------------------------------- */

export const useFollowers = (userId: string, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["followers", userId],

    queryFn: ({ pageParam }) => getFollowers(userId, 20, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor ?? undefined
        : undefined,

    enabled: Boolean(userId) && enabled,
  });
};

/* ----------------------------------------
   FOLLOWING
----------------------------------------- */

export const useFollowing = (userId: string, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["following", userId],

    queryFn: ({ pageParam }) => getFollowing(userId, 20, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor ?? undefined
        : undefined,

    enabled: Boolean(userId) && enabled,
  });
};