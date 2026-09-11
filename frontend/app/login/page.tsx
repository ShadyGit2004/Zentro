"use client";

import { signInWithGoogle } from "@/features/auth/api";

export default function googleLogin(){
    const handleGoogleLogin = async () => {
      try {
        const result = await signInWithGoogle();

        console.log("Google login successful:", result);
        console.log("Firebase user:", result.firebaseUser);
        console.log("Firebase ID token:", result.idToken);

        // Store access token according to your existing
        // authentication strategy.
        // Then redirect to /home.
      } catch (error) {
        console.error("Google login failed:", error);
      }
    };
    return (
      <main className="flex min-h-screen items-center justify-center">
        <button
          onClick={handleGoogleLogin}
          className="rounded-md border px-5 py-3"
        >
          Continue with Google
        </button>
      </main>
    );
}