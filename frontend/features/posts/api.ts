import api from "@/lib/axios";
import type {
  CreatePostPayload,
  CreatePostResponse,
  UpdatePostPayload,
  UpdatePostResponse,
  UserPostsResponse,
} from "./types";

export const createPost = async (
  payload: CreatePostPayload
): Promise<CreatePostResponse> => {
  const formData = new FormData();

  if(!payload.content?.trim() && !payload.image){
    throw new Error("Content or image must contain to create post")
  }

  if(payload.content){
    formData.append("content", payload.content);
  }

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await api.post<CreatePostResponse>("/posts", formData);

  return response.data;
};

export const updatePost = async (
  postId: string,
  payload: UpdatePostPayload
): Promise<UpdatePostResponse> => {
  const formData = new FormData();

  if(!payload.content?.trim() && !payload.image){
    throw new Error("Content or image must contain to update post")
  }

  if (payload.content !== undefined) {
    formData.append("content", payload.content);
  }

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await api.patch<UpdatePostResponse>(
    `/posts/${postId}`,
    formData
  );

  return response.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await api.delete(`/posts/${postId}`);
};

export const likePost = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};

export const unlikePost = async (postId: string) => {
  const response = await api.delete(`/posts/${postId}/like`);
  return response.data;
};

export const getUserPosts = async (
  userId: string,
  limit = 20,
  cursor?: string
): Promise<UserPostsResponse> => {
  const response = await api.get<UserPostsResponse>(`/posts/user/${userId}`, {
    params: {
      limit,
      ...(cursor ? { cursor } : {}),
    },
  });

  return response.data;
};

export const repostPost = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/repost`);
  return response.data;
};

export const unrepostPost = async (postId: string) => {
  const response = await api.delete(`/posts/${postId}/repost`);
  return response.data;
};
