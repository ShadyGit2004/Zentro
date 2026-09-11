import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(firebaseAuth, googleProvider);

  const firebaseIdToken = await result.user.getIdToken();

  const response = await axios.post(
    `${API_URL}/auth/google`,
    {
      idToken: firebaseIdToken,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};