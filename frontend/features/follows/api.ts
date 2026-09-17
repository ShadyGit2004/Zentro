import api from "@/lib/axios";
import type { FollowResponse } from "./types";
import { ProfileListResponse } from "../profile/types";

export const followUser = async (
  userId: string
): Promise<FollowResponse> => {
  const response = await api.post<FollowResponse>(
    `/users/${userId}/follow`
  );

  return response.data;
};

export const unfollowUser = async (
  userId: string
): Promise<FollowResponse> => {
  const response = await api.delete<FollowResponse>(
    `/users/${userId}/follow`
  );

  return response.data;
};

export const getFollowers = async (
  userId: string,
  limit = 20,
  cursor?: string
): Promise<ProfileListResponse> => {
  const response = await api.get<ProfileListResponse>(
    `/users/${userId}/followers`,
    {
      params: {
        limit,
        ...(cursor && { cursor }),
      },
    }
  );

  return response.data;
};

export const getFollowing = async (
  userId: string,
  limit = 20,
  cursor?: string
): Promise<ProfileListResponse> => {
  const response = await api.get<ProfileListResponse>(
    `/users/${userId}/following`,
    {
      params: {
        limit,
        ...(cursor && { cursor }),
      },
    }
  );

  return response.data;
};