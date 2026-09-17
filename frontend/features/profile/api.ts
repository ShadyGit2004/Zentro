import api from "@/lib/axios";
import type { GetUserProfileResponse, UpdateProfileImageResponse, UpdateProfilePayload, UpdateProfileResponse } from "./types";

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

export const updateProfileImage = async (
  file: File
): Promise<UpdateProfileImageResponse> => {
  const formData = new FormData();

  formData.append("profileImage", file);

  const response = await api.patch<UpdateProfileImageResponse>(
    "/users/me/profile-image",
    formData
  );

  return response.data;
};