import { FeedPost } from "../feed/types";

export interface BookmarkResponse {
  success: boolean;
  data: {
    id: string;
    postId: string;
    createdAt: string;
  };
}

export interface UnbookmarkResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface BookmarksPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface BookmarkedPostsResponse {
  success: boolean;
  data: FeedPost[];
  pagination: BookmarksPagination;
}



