import axios from "axios";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
) => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    return error.response.data?.error?.message ?? fallback;
  }

  return fallback;
};