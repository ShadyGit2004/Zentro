import { FeedPost } from "../feed/types";

export interface CreatePostPayload {
  content?: string;
  image?: File;
  audio?: File;
}

export interface CreatePostResponse {
  success: boolean;
  data: {
    post: {
      _id: string;
      content: string;
      media?: {
        type?: "image" | "audio";
        url: string;
        publicId: string;
      };
      author: {
        _id: string;
        username: string;
        displayName: string;
        profileImage?: {
          url: string;
          publicId?: string;
        } | null;
      };
      repostsCount: number;
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
  audio?: File;
}

export interface UpdatePostResponse {
  success: boolean;
  data: {
    post: {
      _id: string;
      content: string;
      media?: {
        type?: "image" | "audio";
        url: string;
        publicId: string;
      };
      author: {
        _id: string;
        username: string;
        displayName: string;
        profileImage?: {
          url: string;
          publicId?: string;
        } | null;
      };
      repostsCount: number;
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

export interface TranslatePostResponse {
  success: boolean;
  data: {
    postId: string;
    targetLanguage: string;
    translatedText: string;
  };
}