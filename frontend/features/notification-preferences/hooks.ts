import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getKeywordNotificationPosts,
  updateNotificationPreferences,
} from "./api";

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,

    onSuccess: (response) => {
      queryClient.setQueryData(["current-user"], (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,
          notificationPreferences: response.data,
        };
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
