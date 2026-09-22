export interface FeedUser {
  _id: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: {
    url: string;
    publicId?: string;
  } | null;
}

export interface FeedPost {
  _id: string;
  content?: string;
  media?: {
    url: string;
    publicId: string;
  };
  author: FeedUser;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
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