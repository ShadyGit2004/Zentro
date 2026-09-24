import api from "@/lib/axios";
import type { HashtagPostsResponse, HashtagSearchResult } from "./types";

export const getHashtagPosts = async (
  hashtag: string,
  limit = 20,
  cursor?: string
): Promise<HashtagPostsResponse> => {
  const params = new URLSearchParams();

  params.set("limit", String(limit));

  if (cursor) {
    params.set("cursor", cursor);
  }

  const response = await api.get(
    `/hashtags/${encodeURIComponent(hashtag)}/posts?${params.toString()}`
  );

  return response.data.data;
};


export const searchHashtags = async (
  query: string,
  limit = 20
): Promise<HashtagSearchResult[]> => {
  const response = await api.get("/hashtags/search", {
    params: {
      q: query,
      limit,
    },
  });

  return response.data.data;
};