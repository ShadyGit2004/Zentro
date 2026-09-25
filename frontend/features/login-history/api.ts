import api from "@/lib/axios";
import type { LoginHistoryResponse } from "./types";

export const getLoginHistory = async (
  cursor?: string
): Promise<LoginHistoryResponse> => {
  const response = await api.get<LoginHistoryResponse>(
    "/users/me/login-history",
    {
      params: {
        limit: 20,
        ...(cursor && { cursor }),
      },
    }
  );

  return response.data;
};