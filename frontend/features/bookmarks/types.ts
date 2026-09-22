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

export interface BookmarkedPost {
  _id: string;
  content?: string;
  media?: {
    url: string;
    publicId: string;
  };
  author: {
    _id: string;
    username: string;
    displayName: string;
    bio?: string;
    profileImage?: {
      url: string;
      publicId?: string;
    } | null;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  isBookmarked: true;
};


export interface BookmarksPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface BookmarkedPostsResponse {
  success: boolean;
  data: BookmarkedPost[];
  pagination: BookmarksPagination;
}



