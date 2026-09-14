import axios from "axios";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? fallback;
  }

  return fallback;
};