import api from "@/lib/axios";

import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase";
import { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "./types";

export const registerUser = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(
    "/auth/register",
    payload
  );

  return response.data;
};

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    payload,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(firebaseAuth, googleProvider);

  const firebaseIdToken = await result.user.getIdToken();

  const response = await api.post(
    "/auth/google",
    {
      idToken: firebaseIdToken,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};