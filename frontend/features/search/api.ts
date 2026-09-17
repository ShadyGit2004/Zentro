import api from "@/lib/axios";
import type {
  SearchPostsResponse,
  SearchUsersResponse,
} from "./types";

export const searchUsers = async (
  query: string,
  limit = 20,
  cursor?: string
): Promise<SearchUsersResponse> => {
  const response = await api.get<SearchUsersResponse>("/users/search", {
    params: {
      q: query,
      limit,
      ...(cursor && { cursor }),
    },
  });

  return response.data;
};

export const searchPosts = async (
  query: string,
  limit = 20,
  cursor?: string
): Promise<SearchPostsResponse> => {
  const response = await api.get<SearchPostsResponse>("/posts/search", {
    params: {
      q: query,
      limit,
      ...(cursor && { cursor }),
    },
  });

  return response.data;
};