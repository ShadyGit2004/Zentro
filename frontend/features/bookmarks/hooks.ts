import type { InfiniteData } from "@tanstack/react-query";
import type { FeedResponse } from "@/features/feed/types";
import type { BookmarkedPostsResponse } from "./types";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { bookmarkPost, unbookmarkPost, getBookmarkedPosts } from "./api";

const updateBookmarkState = (
  oldData: InfiniteData<any> | undefined,
  postId: string,
  isBookmarked: boolean
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((post: any) =>
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
      // Feed
      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        ["feed"],
        (oldData) => updateBookmarkState(oldData, postId, true)
      );

      // All cached profile-post queries
      queryClient.setQueriesData<InfiniteData<any>>(
        { queryKey: ["user-posts"] },
        (oldData) => updateBookmarkState(oldData, postId, true)
      );

      // New bookmark must appear in bookmarks page.
      queryClient.invalidateQueries({
        queryKey: ["bookmarks"],
      });

      // Hashtag posts
      queryClient.setQueriesData<InfiniteData<any>>(
        { queryKey: ["hashtag-posts"] },
        (oldData) => updateBookmarkState(oldData, postId, true)
      );
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
        (oldData) => updateBookmarkState(oldData, postId, false)
      );

      // Profile posts
      queryClient.setQueriesData<InfiniteData<any>>(
        { queryKey: ["user-posts"] },
        (oldData) => updateBookmarkState(oldData, postId, false)
      );

      // Bookmark page
      queryClient.setQueryData<InfiniteData<BookmarkedPostsResponse>>(
        ["bookmarks"],
        (oldData) => removePostFromBookmarks(oldData, postId)
      );

      // Hashtag posts
      queryClient.setQueriesData<InfiniteData<any>>(
        { queryKey: ["hashtag-posts"] },
        (oldData) => updateBookmarkState(oldData, postId, false)
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
