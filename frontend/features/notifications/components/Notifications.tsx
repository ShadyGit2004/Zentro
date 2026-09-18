"use client";

import NotificationItem from "./NotificationItem";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "../hooks";

export default function Notifications() {

  const notificationsQuery = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();

  const notifications = notificationsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const unreadCount = notificationsQuery.data?.pages[0]?.unreadCount ?? 0;

  const handleRead = (notification: (typeof notifications)[number]) => {
    if (notification.isRead) {
      return;
    }

    markAsReadMutation.mutate(notification._id);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      return;
    }

    markAllMutation.mutate();
  };

  if (notificationsQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading notifications...
        </div>
      </div>
    );
  }

  if (notificationsQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <div className="py-12 text-center text-sm text-destructive">
          Something went wrong while loading notifications.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">     
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">  
          <div>
            <h1 className="text-xl font-semibold">Notifications</h1>

            {unreadCount > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markAllMutation.isPending}
            className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markAllMutation.isPending ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border py-12 text-center">
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onRead={handleRead}
              />
            ))}
          </div>

          {notificationsQuery.hasNextPage && (
            <button
              type="button"
              onClick={() => notificationsQuery.fetchNextPage()}
              disabled={notificationsQuery.isFetchingNextPage}
              className="mt-4 w-full rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {notificationsQuery.isFetchingNextPage
                ? "Loading..."
                : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
