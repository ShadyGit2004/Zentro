import Link from "next/link";

import LoginForm from "./LoginForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout
      children={
        <>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              Create account
            </Link>
          </p>{" "}
        </>
      }
      heroHeading={"Welcome back"}
      heroPara={"Sign in to continue to your account"}
    />
  );
}
