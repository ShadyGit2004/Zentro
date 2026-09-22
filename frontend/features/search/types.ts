// USERS
export interface SearchUser {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage?: {
    url: string;
    publicId?: string;
  } | null;
}

export interface SearchPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface SearchUsersResponse {
  success: boolean;
  data: SearchUser[];
  pagination: SearchPagination;
}


// POSTS

export interface SearchPostAuthor {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: {
    url : string | null;
    publicId : string | null;
  }
}

export interface SearchPost {
  _id: string;
  content: string;
  author: SearchPostAuthor;
  media?: {
    url: string;
    publicId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SearchPostsResponse {
  success: boolean;
  data: SearchPost[];
  pagination: SearchPagination;
}