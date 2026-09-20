import { FeedPost } from "../feed/types";

export interface CreatePostPayload {
  content?: string;
  image?: File;
}

export interface CreatePostResponse {
  success: boolean;
  data: {
    post: {
      _id: string;
      content: string;
      media?: {
        url: string;
        publicId: string;
      };
      author: {
        _id: string;
        username: string;
        displayName: string;
        profileImage?: string;
      };
      likesCount: number;
      commentsCount: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface UpdatePostPayload {
  content?: string;
  image?: File;
}

export interface UpdatePostResponse {
  success: boolean;
  data: {
    post: {
      _id: string;
      content: string;
      media?: {
        url: string;
        publicId: string;
      };
      author: {
        _id: string;
        username: string;
        displayName: string;
        profileImage?: string;
      };
      likesCount: number;
      commentsCount: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface UserPostsPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface UserPostsResponse {
  success: boolean;
  data: FeedPost[];
  pagination: UserPostsPagination;
}