import type { InfiniteData } from "@tanstack/react-query";
import type { FeedResponse } from "@/features/feed/types";
import type { BookmarkedPostsResponse } from "./types";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { bookmarkPost, unbookmarkPost, getBookmarkedPosts } from "./api";

const updateFeedBookmarkState = (
  oldData: InfiniteData<FeedResponse> | undefined,
  postId: string,
  isBookmarked: boolean
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((post) =>
        post._id === postId ? { ...post, isBookmarked } : post
      ),
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

export const useBookmarkPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookmarkPost,

    onSuccess: (_, postId) => {
      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        ["feed"],
        (oldData) => updateFeedBookmarkState(oldData, postId, true)
      );

      // Bookmark list needs refetch because
      // a new post has to be added to the list.
      queryClient.invalidateQueries({
        queryKey: ["bookmarks"],
      });
    },
  });
};

export const useUnbookmarkPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unbookmarkPost,

    onSuccess: (_, postId) => {
      // Feed
      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        ["feed"],
        (oldData) => updateFeedBookmarkState(oldData, postId, false)
      );

      // Bookmarks page
      queryClient.setQueryData<InfiniteData<BookmarkedPostsResponse>>(
        ["bookmarks"],
        (oldData) => removePostFromBookmarks(oldData, postId)
      );
    },
  });
};

export const useBookmarkedPosts = () => {
  return useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: ({ pageParam }) => getBookmarkedPosts(20, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor ?? undefined
        : undefined,
  });
};
