import api from "@/lib/axios";
import type { FeedResponse } from "./types";

export const getFeed = async (
  limit: number = 20,
  cursor?: string
): Promise<FeedResponse> => {
  const response = await api.get<FeedResponse>("/feed", {
    params: {
      limit,
      ...(cursor && { cursor }),
    },
  });

  return response.data;
};