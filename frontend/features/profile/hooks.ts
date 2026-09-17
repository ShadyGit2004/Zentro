
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updateProfile
} from "./api";

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: Boolean(userId),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};
