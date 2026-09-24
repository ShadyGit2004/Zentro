export interface TrendingHashtag {
  _id: string;
  name: string;
  postsCount: number;
  recentPostsCount: number;
}

export interface TrendingResponse {
  success: boolean;
  data: TrendingHashtag[];
}
