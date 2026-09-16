import api from "@/lib/axios";
import type {
  CreatePostPayload,
  CreatePostResponse,
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