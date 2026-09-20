import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./api";

import type { NotificationsResponse } from "./types";

export const useNotifications = (enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["notifications"],

    queryFn: ({ pageParam }) => getNotifications(20, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor
        : undefined,

    enabled,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),

    onSuccess: (response) => {
      const updatedNotification = response.data;

        queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
        });

      queryClient.setQueryData(
        ["notifications"],
        (oldData: {
          pages: NotificationsResponse[];
          pageParams: (string | undefined)[];
        } | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,

            pages: oldData.pages.map((page) => {
              const notificationExists = page.data.some(
                (notification) =>
                  notification._id === updatedNotification._id
              );

              if (!notificationExists) {
                return page;
              }

              const wasUnread = page.data.some(
                (notification) =>
                  notification._id === updatedNotification._id &&
                  !notification.isRead
              );

              return {
                ...page,

                data: page.data.map((notification) =>
                  notification._id === updatedNotification._id
                    ? {
                        ...notification,
                        isRead: true,
                      }
                    : notification
                ),

                unreadCount: wasUnread
                  ? Math.max(page.unreadCount - 1, 0)
                  : page.unreadCount,
              };
            }),
          };
        }
      );
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,

    onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: ["notifications", "unread-count"],
        });
  queryClient.setQueryData(
    ["notifications"],
    (oldData: {
      pages: NotificationsResponse[];
      pageParams: (string | undefined)[];
    } | undefined) => {
      if (!oldData) {
        return oldData;
      }

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((notification) => ({
            ...notification,
            isRead: true,
          })),
          unreadCount: 0,
        })),
      };
    }
  );
},
  });
};

export const useUnreadNotificationsCount = (enabled = true) => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getNotifications(1),
    select: (response) => response.unreadCount,
    enabled,
  });
};
