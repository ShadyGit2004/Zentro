import api from "@/lib/axios";

import type {
  CreatePaymentOrderInput,
  CreatePaymentOrderResponse,
  CurrentSubscription,
  PaymentHistoryResponse,
  VerifyPaymentInput,
  VerifyPaymentResponse,
} from "./types";

export const createPaymentOrder = async (
  data: CreatePaymentOrderInput
): Promise<CreatePaymentOrderResponse> => {
  const response = await api.post<CreatePaymentOrderResponse>(
    "/payments/create-order",
    data
  );

  return response.data;
};

export const verifyPayment = async (
  data: VerifyPaymentInput
): Promise<VerifyPaymentResponse> => {
  const response = await api.post<VerifyPaymentResponse>(
    "/payments/verify",
    data
  );

  return response.data;
};

export const getCurrentSubscription =
  async (): Promise<CurrentSubscription> => {
    const response = await api.get<{
      success: boolean;
      data: CurrentSubscription;
    }>("/payments/subscription");

    return response.data.data;
  };

export const getPaymentHistory = async (
  limit: number = 10,
  cursor?: string
): Promise<PaymentHistoryResponse> => {
  const response = await api.get<PaymentHistoryResponse>("/payments/history", {
    params: {
      limit,
      ...(cursor ? { cursor } : {}),
    },
  });

  return response.data;
};
