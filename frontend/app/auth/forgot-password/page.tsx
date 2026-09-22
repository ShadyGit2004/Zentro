import Link from "next/link";

import ForgotPasswordForm from "./ForgotPasswordForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  return (  
    <AuthLayout
      children={
        <>
          <ForgotPasswordForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              Back to login
            </Link>
          </p>
        </>
      }
      heroHeading={"Forgot your password?"}
      heroPara={"Enter your email and we'll send you a reset link."}
    />
  );
}
