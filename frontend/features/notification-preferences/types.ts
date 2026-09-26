export interface NotificationPreferences {
  browserEnabled: boolean;
  keywords: string[];
}

export interface UpdateNotificationPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
}
