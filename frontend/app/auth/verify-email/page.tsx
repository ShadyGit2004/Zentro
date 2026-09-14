"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/axios";

function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "checking" | "success" | "error" | "waiting"
  >("checking");

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("waiting");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await api.post("/auth/verify-email", {
          token,
        });

        setStatus("success");
        setMessage(
          response.data?.data?.message ||
            "Your email has been verified successfully."
        );
      } catch (error: unknown) {
        setStatus("error");

        const apiError = error as {
          response?: {
            data?: {
              error?: {
                message?: string;
              };
            };
          };
        };

        setMessage(
          apiError.response?.data?.error?.message ||
            "Email verification failed. The link may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="flex flex-col items-center px-6 py-10 text-center">
          {status === "checking" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Verifying your email
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "waiting" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Mail className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Check your email
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                We&apos;ve sent a verification link to
              </p>

              {email && <p className="mt-1 font-medium">{email}</p>}

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Open your inbox and click the verification link to verify your
                account.
              </p>

              <p className="mt-4 text-xs text-muted-foreground">
                Didn&apos;t receive it? Check your spam or junk folder.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Email verified
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {message}
              </p>

              <Button
                className="mt-6 w-full"
                onClick={() => router.push("/auth/login")}
              >
                Continue to login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CircleAlert className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Verification failed
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {message}
              </p>

              <Button
                className="mt-6 w-full"
                onClick={() => router.push("/auth/login")}
              >
                Go to login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-muted/40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </main>
      }
    >
      <VerifyEmail />
    </Suspense>
  );
}