import api from "@/lib/axios";
import type {
  CreateCommentPayload,
  CreateCommentResponse,
  DeleteCommentResponse,
  GetCommentsResponse,
} from "./types";

export const getComments = async (
  postId: string,
  limit = 20,
  cursor?: string
): Promise<GetCommentsResponse> => {
  const response = await api.get<GetCommentsResponse>(
    `/posts/${postId}/comments`,
    {
      params: {
        limit,
        ...(cursor && { cursor }),
      },
    }
  );

  return response.data;
};

export const createComment = async (
  postId: string,
  payload: CreateCommentPayload
): Promise<CreateCommentResponse> => {
  const response = await api.post<CreateCommentResponse>(
    `/posts/${postId}/comments`,
    payload
  );

  return response.data;
};

export const deleteComment = async (
  postId: string,
  commentId: string
): Promise<DeleteCommentResponse> => {
  const response = await api.delete<DeleteCommentResponse>(
    `/posts/${postId}/comments/${commentId}`
  );

  return response.data;
};