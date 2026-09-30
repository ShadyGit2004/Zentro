import Link from "next/link";

import ForgotPasswordForm from "./ForgotPasswordForm";
import AuthLayout from "@/components/auth/AuthLayout";
import { getTranslations } from "next-intl/server";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");
  const tForgot = await getTranslations("forgotPassword"); 
  return (  
    <AuthLayout
      children={
        <>
          <ForgotPasswordForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("rememberPassword")}{" "}
            <Link
              href="/auth/login"
              className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              {t("backToLogin")}
            </Link>
          </p>
        </>
      }
      heroHeading={tForgot("title")}
      heroPara={tForgot("subtitle")}
    />
  );
}
