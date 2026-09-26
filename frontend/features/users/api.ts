import api from "@/lib/axios";
import type { CurrentUser } from "./types";

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get<{ success: boolean; data: CurrentUser }>(
    "/users/me"
  );

  return response.data.data;
};
