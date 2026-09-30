"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/axios";

import { resendVerification } from "@/features/auth/api";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";
import Link from "next/link";
import ZentroLogo from "@/components/brand/ZentroLogo";

function VerifyEmail() {
  const t = useTranslations("verifyEmail");
  const tAuth = useTranslations("auth");

  const searchParams = useSearchParams();
  const router = useRouter();

  const verificationStartedRef = useRef<string | null>(null);

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "checking" | "success" | "error" | "waiting"
  >("checking");

  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const { user, loading } = useAuth();

  useEffect(() => {      
     if (loading) return;

     if(user?.emailVerifiedAt){
       router.replace("/home");
       return;
     }

    if (!token) {
      setStatus("waiting");
      return;
    }

    if (verificationStartedRef.current === token) {
      return;
    }

    verificationStartedRef.current = token;

    const verifyEmail = async () => {
      try {
        const response = await api.post("/auth/verify-email", {
          token,
        });

        setStatus("success");
        toast.success(t("emailVerified"));

        setMessage(
          response.data?.data?.message ||
            t("emailVerified")
        );
      } catch (error: unknown) {
        setStatus("error");
        toast.error(t("verificationFailed"));

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
            t("verificationFailed")
        );
      }
    };

    verifyEmail();
  }, [token, user?.emailVerifiedAt, loading, router, t]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (!email || resending || cooldown > 0) return;

    try {
      setResending(true);
      setResendMessage("");
      setResendError("");

      const response = await resendVerification({
        email,
      });      
      toast.success(response.data.message || t("checkEmail"));

      setResendMessage(
        response.data?.message || t("checkEmail")
      );

      setCooldown(60);
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            error?: {
              message?: string;
            };
          };
        };
      };

      toast.error(t("verificationFailed"));

      setResendError(
        apiError.response?.data?.error?.message ||
          t("verificationFailed")
      );
    } finally {
      setResending(false);
    }
  };

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
                {t("verifying")}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {t("verifyingDesc")}
              </p>
            </>
          )}

          {status === "waiting" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Mail className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                {t("checkEmail")}
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("checkEmailDesc")}
              </p>

              {email && <p className="mt-1 font-medium">{email}</p>}

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {t("checkEmailInstructions")}
              </p>

              <p className="mt-4 text-xs text-muted-foreground">
                {t("checkSpam")}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                disabled={!email || resending || cooldown > 0}
                onClick={handleResendVerification}
              >
                {resending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {tAuth("resending")}
                  </>
                ) : cooldown > 0 ? (
                  tAuth("resendAvailableIn", { seconds: cooldown })
                ) : (
                  tAuth("resendVerificationEmail")
                )}
              </Button>

              {resendMessage && (
                <p className="mt-3 text-sm text-green-600">{resendMessage}</p>
              )}

              {resendError && (
                <p className="mt-3 text-sm text-destructive">{resendError}</p>
              )}
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                {t("emailVerified")}
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {message}
              </p>

              <Button
                className="mt-6 w-full"
                onClick={() => router.push("/auth/login")}
              >
                {tAuth("continueToLogin")}
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CircleAlert className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                {t("verificationFailed")}
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {message}
              </p>

              <Button
                className="mt-6 w-full"
                onClick={() => router.push("/auth/login")}
              >
                {tAuth("goToLogin")}
              </Button>
            </>
          )}
        </CardContent>
        <Link href="/">
          <div className="mt-1 flex items-center justify-center gap-2">
            <ZentroLogo className="h-9 w-9 text-foreground" />
            <span className="text-2xl font-bold tracking-tight">Zentro</span>
          </div>
        </Link>
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
