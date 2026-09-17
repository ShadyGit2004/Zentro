import api from "@/lib/axios";
import type { GetUserProfileResponse, UpdateProfilePayload, UpdateProfileResponse } from "./types";

export const getUserProfile = async (
  userId: string
): Promise<GetUserProfileResponse> => {
  const response = await api.get<GetUserProfileResponse>(
    `/users/${userId}`
  );

  return response.data;
};

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> => {
  const response = await api.patch<UpdateProfileResponse>(
    "/users/me",
    payload
  );

  return response.data;
};

