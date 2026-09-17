export type NotificationType = "like" | "comment" | "follow";

export interface NotificationActor {
  _id: string;
  username: string;
  displayName: string;
  profileImage: {
    url : string | null;
    publicId : string | null;
  }
}

export interface NotificationPost {
  _id: string;
  content: string;
  media?: {
    url: string;
    publicId: string;
  };
}

export interface NotificationComment {
  _id: string;
  content: string;
}

export interface Notification {
  _id: string;
  actor: NotificationActor;
  type: NotificationType;
  post?: NotificationPost;
  comment?: NotificationComment;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: NotificationPagination;
  unreadCount: number;
}

export interface MarkNotificationAsReadResponse {
  success: boolean;
  data: Notification;
}

export interface MarkAllNotificationsAsReadResponse {
  success: boolean;
  data: {
    message: string;
  };
}