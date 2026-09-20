import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  deleteComment,
  getComments,
} from "./api";
import { updateCommentCountInAllPostCaches } from "@/features/posts/hooks";

export const useComments = (postId: string) => {
  return useInfiniteQuery({
    queryKey: ["comments", postId],
    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) =>
      getComments(postId, 20, pageParam),

    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasNextPage) {
        return undefined;
      }

      return lastPage.pagination.nextCursor ?? undefined;
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      createComment(postId, { content }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });

      updateCommentCountInAllPostCaches(queryClient, variables.postId, 1);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) => deleteComment(postId, commentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });

      updateCommentCountInAllPostCaches(queryClient, variables.postId, -1);
    },
  });
};