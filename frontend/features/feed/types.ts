export interface FeedUser {
  _id: string;
  username: string;
  displayName: string;
  profileImage?: {
    publicId: string;
    url: string;
  };
}

export interface FeedPost {
  _id: string;
  content: string;
  media?: {
    url: string;
    publicId: string;
  };
  author: FeedUser;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface FeedResponse {
  success: boolean;
  data: FeedPost[];
  pagination: FeedPagination;
}