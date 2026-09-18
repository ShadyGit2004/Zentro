import api from "@/lib/axios";
import type {
  BookmarkResponse,
  UnbookmarkResponse,
  BookmarkedPostsResponse,
} from "./types";

export const bookmarkPost = async (
  postId: string
): Promise<BookmarkResponse> => {
  const response = await api.post<BookmarkResponse>(
    `/posts/${postId}/bookmark`
  );

  return response.data;
};

export const unbookmarkPost = async (
  postId: string
): Promise<UnbookmarkResponse> => {
  const response = await api.delete<UnbookmarkResponse>(
    `/posts/${postId}/bookmark`
  );

  return response.data;
};

export const getBookmarkedPosts = async (
  limit = 20,
  cursor?: string
): Promise<BookmarkedPostsResponse> => {
  const response = await api.get<BookmarkedPostsResponse>(
    "/users/me/bookmarks",
    {
      params: {
        limit,
        ...(cursor ? { cursor } : {}),
      },
    }
  );

  return response.data;
};
