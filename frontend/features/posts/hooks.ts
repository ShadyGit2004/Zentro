import { useMutation, useQueryClient } from "@tanstack/react-query";

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


export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
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