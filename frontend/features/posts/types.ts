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