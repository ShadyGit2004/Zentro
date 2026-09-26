import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteAccount,
  getUserProfile,
  updatePassword,
  updateProfile,
  updateProfileImage,
} from "./api";

import type {
  GetUserProfileResponse,
  UpdateProfileImageResponse,
  UpdateProfileResponse,
} from "./types";

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: Boolean(userId),
  });
};

export const useUpdateProfile = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: (response: UpdateProfileResponse) => {
      const updatedProfile = response.data;

      // 1. Update profile cache
      queryClient.setQueryData<GetUserProfileResponse>(
        ["profile", userId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              ...updatedProfile,

              // Don't overwrite the latest image with null/old value.
              profileImage:
                updatedProfile.profileImage ?? oldData.data.profileImage,
            },
          };
        }
      );

      // 2. Update followers/following cached user data
      const updateUserInLists = (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((user: any) =>
              user._id === userId
                ? {
                    ...user,
                    username: updatedProfile.username,
                    displayName: updatedProfile.displayName,
                  }
                : user
            ),
          })),
        };
      };

      queryClient.setQueriesData(
        { queryKey: ["followers"] },
        updateUserInLists
      );

      queryClient.setQueriesData(
        { queryKey: ["following"] },
        updateUserInLists
      );

      // 3. Update text information in cached posts.
      // Profile image is intentionally NOT touched here.
      const updateAuthorInPosts = (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: any) =>
              post.author?._id === userId
                ? {
                    ...post,
                    author: {
                      ...post.author,
                      username: updatedProfile.username,
                      displayName: updatedProfile.displayName,
                    },
                  }
                : post
            ),
          })),
        };
      };

      queryClient.setQueryData(["feed"], updateAuthorInPosts);

      queryClient.setQueryData(["user-posts", userId], updateAuthorInPosts);

      queryClient.setQueryData(["bookmarks"], updateAuthorInPosts);

      queryClient.setQueryData(["current-user"], response.data);
    },
  });
};

export const useUpdateProfileImage = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileImage,

    onSuccess: (response: UpdateProfileImageResponse) => {
      const profileImage = response.data.profileImage;

      // 1. Update profile cache
      queryClient.setQueryData<GetUserProfileResponse>(
        ["profile", userId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              profileImage,
            },
          };
        }
      );

      // 2. Update image in cached posts
      const updateImageInPosts = (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: any) =>
              post.author?._id === userId
                ? {
                    ...post,
                    author: {
                      ...post.author,
                      profileImage,
                    },
                  }
                : post
            ),
          })),
        };
      };

      queryClient.setQueryData(["current-user"], response.data);

      queryClient.setQueryData(["feed"], updateImageInPosts);

      queryClient.setQueryData(["user-posts", userId], updateImageInPosts);

      queryClient.setQueryData(["bookmarks"], updateImageInPosts);

      // 3. Update image in followers/following lists
      const updateImageInLists = (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((user: any) =>
              user._id === userId
                ? {
                    ...user,
                    profileImage,
                  }
                : user
            ),
          })),
        };
      };

      queryClient.setQueriesData(
        { queryKey: ["followers"] },
        updateImageInLists
      );

      queryClient.setQueriesData(
        { queryKey: ["following"] },
        updateImageInLists
      );
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: updatePassword,
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteAccount,
  });
};
