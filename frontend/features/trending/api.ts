import api from "@/lib/axios";
import type { TrendingResponse } from "./types";

export const getTrendingHashtags = async (
  limit = 10
): Promise<TrendingResponse> => {
  const response = await api.get<TrendingResponse>("/trending", {
    params: { limit },
  });

  return response.data;
};