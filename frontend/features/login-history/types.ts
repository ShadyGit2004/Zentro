export interface LoginHistoryItem {
  id: string;
  browser: string;
  os: string;
  device: string;
  ipAddress: string;
  loginAt: string;
  lastUsedAt: string;
  revokedAt: string | null;
  expiresAt: string;
  status: "active" | "revoked";
}

export interface LoginHistoryResponse {
  success: boolean;
  data: LoginHistoryItem[];
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
