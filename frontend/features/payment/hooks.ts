import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import {
  createPaymentOrder,
  getCurrentSubscription,
  getPaymentHistory,
  verifyPayment,
} from "./api";

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: createPaymentOrder,
  });
};

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: verifyPayment,
  });
};

export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: ["current-subscription"],
    queryFn: getCurrentSubscription,
    staleTime: 60 * 1000,
  });
};

export const usePaymentHistory = () => {
  return useInfiniteQuery({
    queryKey: ["payment-history"],
    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) => {
      return getPaymentHistory(10, pageParam);
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage.data.pagination.hasNextPage) {
        return undefined;
      }

      return lastPage.data.pagination.nextCursor ?? undefined;
    },

    staleTime: 60 * 1000,
  });
};
