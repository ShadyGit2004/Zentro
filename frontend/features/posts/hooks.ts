import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { InfiniteData } from "@tanstack/react-query";
import type { FeedResponse } from "@/features/feed/types";
import type { BookmarkedPostsResponse } from "@/features/bookmarks/types";


import { createPost, deletePost, likePost, unlikePost, updatePost } from "./api";
import { UpdatePostPayload } from "./types";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      payload,
    }: {
      postId: string;
      payload: UpdatePostPayload;
    }) => updatePost(postId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};

const removePostFromFeed = (
  oldData: InfiniteData<FeedResponse> | undefined,
  postId: string
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.filter((post) => post._id !== postId),
    })),
  };
};

const removePostFromBookmarks = (
  oldData: InfiniteData<BookmarkedPostsResponse> | undefined,
  postId: string
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.filter((post) => post._id !== postId),
    })),
  };
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    onSuccess: (_, postId) => {
      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        ["feed"],
        (oldData) => removePostFromFeed(oldData, postId)
      );

      queryClient.setQueryData<InfiniteData<BookmarkedPostsResponse>>(
        ["bookmarks"],
        (oldData) => removePostFromBookmarks(oldData, postId)
      );
    },
  });
};

export const useLikePost = () => {
  return useMutation({
    mutationFn: likePost,
  });
};

export const useUnlikePost = () => {
  return useMutation({
    mutationFn: unlikePost,
  });
};