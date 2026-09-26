import api from "@/lib/axios";

import type {
  CreatePaymentOrderInput,
  CreatePaymentOrderResponse,
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
