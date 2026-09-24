import type { FeedPost } from "@/features/feed/types";

export interface Hashtag {
  _id: string;
  name: string;
  postsCount: number;
}

export interface HashtagPostsPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface HashtagPostsResponse {
  hashtag: Hashtag;
  data: FeedPost[];
  pagination: HashtagPostsPagination;
}

export interface HashtagSearchResult {
  _id: string;
  name: string;
  postsCount: number;
}