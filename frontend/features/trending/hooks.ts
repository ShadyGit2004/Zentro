import { useQuery } from "@tanstack/react-query";
import { getTrendingHashtags } from "./api";

export const useTrendingHashtags = (limit = 10) => {
  return useQuery({
    queryKey: ["trending-hashtags", limit],
    queryFn: () => getTrendingHashtags(limit),
    staleTime: 5 * 60 * 1000,
  });
};
