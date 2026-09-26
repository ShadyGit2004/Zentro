export interface CurrentUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: {
    url: string;
    publicId?: string;
  };
  authProviders: ("password" | "google")[];
  emailVerifiedAt?: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "deleted";
  createdAt: string;
  notificationPreferences: {
    browserEnabled: boolean;
    keywords: string[];
  };
}
