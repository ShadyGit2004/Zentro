export interface CommentAuthor {
  _id: string;
  username: string;
  displayName: string;
  profileImage?: {
    url: string;
    publicId?: string;
  } | null;
}

export interface Comment {
  _id: string;
  post: string;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface GetCommentsResponse {
  success: boolean;
  data: Comment[];
  pagination: CommentPagination;
}

export interface CreateCommentPayload {
  content: string;
}

export interface CreateCommentResponse {
  success: boolean;
  data: Comment;
}

export interface DeleteCommentResponse {
  success: boolean;
  data: unknown;
}