import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type { InfiniteData } from "@tanstack/react-query";
import type { FeedResponse } from "@/features/feed/types";
import type { BookmarkedPostsResponse } from "@/features/bookmarks/types";

import {
  createPost,
  deletePost,
  getUserPosts,
  likePost,
  unlikePost,
  updatePost,
  repostPost,
  unrepostPost,
} from "./api";

import type { UpdatePostPayload } from "./types";

const updatePostInInfiniteQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  updater: (post: any) => any
) => {
  queryClient.setQueriesData<InfiniteData<any>>(
    { queryKey: ["user-posts"] },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((post: any) =>
            post._id === postId ? updater(post) : post
          ),
        })),
      };
    }
  );
};

const removePostFromInfiniteQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string
) => {
  queryClient.setQueriesData<InfiniteData<any>>(
    { queryKey: ["user-posts"] },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.filter((post: any) => post._id !== postId),
        })),
      };
    }
  );
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

const removePostFromHashtagQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string
) => {
  queryClient.setQueriesData<InfiniteData<any>>(
    { queryKey: ["hashtag-posts"] },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.filter((post: any) => post._id !== postId),
        })),
      };
    }
  );
};

/* ----------------------------------------
   LIKE / UNLIKE CACHE HELPERS
----------------------------------------- */

const updatePostLikeState = (
  oldData: InfiniteData<any> | undefined,
  postId: string,
  isLiked: boolean
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((post: any) => {
        if (post._id !== postId) {
          return post;
        }

        return {
          ...post,
          isLiked,
          likesCount: Math.max(0, post.likesCount + (isLiked ? 1 : -1)),
        };
      }),
    })),
  };
};

const updateLikeInAllPostCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  isLiked: boolean
) => {
  // Feed
  queryClient.setQueryData<InfiniteData<FeedResponse>>(["feed"], (oldData) =>
    updatePostLikeState(oldData, postId, isLiked)
  );

  // Profile posts
  updatePostInInfiniteQueries(queryClient, postId, (post) => ({
    ...post,
    isLiked,
    likesCount: Math.max(0, post.likesCount + (isLiked ? 1 : -1)),
  }));

  // Bookmarked posts
  queryClient.setQueryData<InfiniteData<BookmarkedPostsResponse>>(
    ["bookmarks"],
    (oldData) => updatePostLikeState(oldData, postId, isLiked)
  );

  // Hashtag posts
  queryClient.setQueriesData<InfiniteData<any>>(
    { queryKey: ["hashtag-posts"] },
    (oldData) => updatePostLikeState(oldData, postId, isLiked)
  );
};

/* ----------------------------------------
  Comment Count CACHE HELPERS
----------------------------------------- */
const updatePostCommentCount = (
  oldData: InfiniteData<any> | undefined,
  postId: string,
  change: number
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((post: any) =>
        post._id === postId
          ? {
              ...post,
              commentsCount: Math.max(0, post.commentsCount + change),
            }
          : post
      ),
    })),
  };
};

export const updateCommentCountInAllPostCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  change: number
) => {
  queryClient.setQueryData<InfiniteData<FeedResponse>>(["feed"], (oldData) =>
    updatePostCommentCount(oldData, postId, change)
  );

  updatePostInInfiniteQueries(queryClient, postId, (post) => ({
    ...post,
    commentsCount: Math.max(0, post.commentsCount + change),
  }));

  queryClient.setQueryData<InfiniteData<BookmarkedPostsResponse>>(
    ["bookmarks"],
    (oldData) => updatePostCommentCount(oldData, postId, change)
  );

  // Hashtag posts
  queryClient.setQueriesData<InfiniteData<any>>(
    { queryKey: ["hashtag-posts"] },
    (oldData) => updatePostCommentCount(oldData, postId, change)
  );
};

/* ----------------------------------------
   CREATE
----------------------------------------- */

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

/* ----------------------------------------
   UPDATE
----------------------------------------- */

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

    onSuccess: (response, variables) => {
      const updatedPost = response.data?.post;

      if (!updatedPost) {
        queryClient.invalidateQueries({
          queryKey: ["feed"],
        });

        queryClient.invalidateQueries({
          queryKey: ["user-posts"],
        });

        queryClient.invalidateQueries({
          queryKey: ["bookmarks"],
        });

        queryClient.invalidateQueries({
          queryKey: ["hashtag-posts"],
        });

        return;
      }

      const updateCachedPost = (post: any) => ({
        ...post,
        content: updatedPost.content,
        media: updatedPost.media,
        updatedAt: updatedPost.updatedAt,
      });

      // Feed
      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        ["feed"],
        (oldData) =>
          oldData
            ? {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  data: page.data.map((post) =>
                    post._id === variables.postId
                      ? updateCachedPost(post)
                      : post
                  ),
                })),
              }
            : oldData
      );

      // Profile / User Posts
      updatePostInInfiniteQueries(
        queryClient,
        variables.postId,
        updateCachedPost
      );

      // Bookmarks
      queryClient.setQueryData<InfiniteData<BookmarkedPostsResponse>>(
        ["bookmarks"],
        (oldData) =>
          oldData
            ? {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  data: page.data.map((post) =>
                    post._id === variables.postId
                      ? updateCachedPost(post)
                      : post
                  ),
                })),
              }
            : oldData
      );
    },
  });
};

/* ----------------------------------------
   DELETE
----------------------------------------- */

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

      removePostFromInfiniteQueries(queryClient, postId);

      removePostFromHashtagQueries(queryClient, postId);
    },
  });
};

/* ----------------------------------------
   LIKE
----------------------------------------- */

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likePost,

    onSuccess: (_, postId) => {
      updateLikeInAllPostCaches(queryClient, postId, true);
    },
  });
};

/* ----------------------------------------
   UNLIKE
----------------------------------------- */

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlikePost,

    onSuccess: (_, postId) => {
      updateLikeInAllPostCaches(queryClient, postId, false);
    },
  });
};

/* ----------------------------------------
   USER POSTS
----------------------------------------- */

export const useUserPosts = (userId: string, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["user-posts", userId],

    queryFn: ({ pageParam }) => getUserPosts(userId, 20, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor ?? undefined
        : undefined,

    enabled: Boolean(userId) && enabled,
  });
};

/* ----------------------------------------
   USER REPOSTS
----------------------------------------- */

const updatePostRepostState = (
  oldData: InfiniteData<any> | undefined,
  postId: string,
  isReposted: boolean
) => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((post: any) => {
        if (post._id !== postId) {
          return post;
        }

        return {
          ...post,
          isReposted,
          repostsCount: Math.max(0, (post.repostsCount ?? 0) + (isReposted ? 1 : -1)),
        };
      }),
    })),
  };
};

const updateRepostInAllPostCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  isReposted: boolean
) => {
  // Feed
  queryClient.setQueryData<InfiniteData<FeedResponse>>(["feed"], (oldData) =>
    updatePostRepostState(oldData, postId, isReposted)
  );

  // Profile / User Posts
  updatePostInInfiniteQueries(queryClient, postId, (post) => ({
    ...post,
    isReposted,
    repostsCount: Math.max(0, (post.repostsCount ?? 0) + (isReposted ? 1 : -1)),
  }));

  // Bookmarks
  queryClient.setQueryData<InfiniteData<BookmarkedPostsResponse>>(
    ["bookmarks"],
    (oldData) => updatePostRepostState(oldData, postId, isReposted)
  );

  // Hashtag posts
  queryClient.setQueriesData<InfiniteData<any>>(
    { queryKey: ["hashtag-posts"] },
    (oldData) => updatePostRepostState(oldData, postId, isReposted)
  );
};

export const useRepostPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repostPost,

    onSuccess: (_, postId) => {
      updateRepostInAllPostCaches(queryClient, postId, true);
    },
  });
};

export const useUnrepostPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unrepostPost,

    onSuccess: (_, postId) => {
      updateRepostInAllPostCaches(queryClient, postId, false);
    },
  });
};
