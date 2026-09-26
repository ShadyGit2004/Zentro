import api from "@/lib/axios";
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesResponse,
} from "./types";

import type { FeedResponse } from "@/features/feed/types";

export const updateNotificationPreferences = async (
  data: NotificationPreferences
): Promise<UpdateNotificationPreferencesResponse> => {
  const response = await api.patch<UpdateNotificationPreferencesResponse>(
    "/users/me/notification-preferences",
    data
  );

  return response.data;
};

export const getKeywordNotificationPosts = async (
  limit: number = 20
): Promise<FeedResponse> => {
  const response = await api.get<FeedResponse>("/feed", {
    params: {
      limit,
    },
  });

  return response.data;
};
