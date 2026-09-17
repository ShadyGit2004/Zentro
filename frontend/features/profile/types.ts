export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: {
    url: string;
    publicId: string;
  } | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  postsCount: number;
  createdAt: string;
}

export interface GetUserProfileResponse {
  success: boolean;
  data: UserProfile;
}

export interface UpdateProfilePayload {
  username?: string;
  displayName?: string;
  bio?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  data: {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    profileImage: {
      url: string;
      publicId: string;
    } | null;
    updatedAt: string;
  };
}

export interface UpdateProfileImageResponse {
  success: boolean;
  data: {
    profileImage: {
      url: string;
      publicId: string;
    };
  };
}

export interface ProfileListUser {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: {
    url: string;
    publicId: string;
  } | null;
}

export interface ProfileListPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface ProfileListResponse {
  success: boolean;
  data: ProfileListUser[];
  pagination: ProfileListPagination;
}