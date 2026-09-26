import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getKeywordNotificationPosts,
  updateNotificationPreferences,
} from "./api";
import { useAuth } from "../auth/AuthProvider";

export const useUpdateNotificationPreferences = () => {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: updateNotificationPreferences,

    onSuccess: (response) => {
      updateUser({
        notificationPreferences: response.data,
      });
    },
  });
};

export const useKeywordNotificationPosts = (enabled: boolean) => {
  return useQuery({
    queryKey: ["keyword-notification-posts"],

    queryFn: () => getKeywordNotificationPosts(20),

    enabled,

    refetchInterval: 30_000,

    refetchIntervalInBackground: true,

    refetchOnWindowFocus: true,

    staleTime: 0,
  });
};
