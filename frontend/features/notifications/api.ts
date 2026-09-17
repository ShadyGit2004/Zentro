import api from "@/lib/axios";

import type {
  MarkAllNotificationsAsReadResponse,
  MarkNotificationAsReadResponse,
  NotificationsResponse,
} from "./types";

export const getNotifications = async (
  limit = 20,
  cursor?: string
): Promise<NotificationsResponse> => {
  const response = await api.get<NotificationsResponse>(
    "/notifications",
    {
      params: {
        limit,
        ...(cursor && { cursor }),
      },
    }
  );

  return response.data;
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<MarkNotificationAsReadResponse> => {
  const response =
    await api.patch<MarkNotificationAsReadResponse>(
      `/notifications/${notificationId}/read`
    );

  return response.data;
};

export const markAllNotificationsAsRead =
  async (): Promise<MarkAllNotificationsAsReadResponse> => {
    const response =
      await api.patch<MarkAllNotificationsAsReadResponse>(
        "/notifications/read-all"
      );

    return response.data;
  };