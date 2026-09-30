import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import RegisterForm from "./RegisterForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default async function RegisterPage() {
  const t = await getTranslations("auth");
  const tReg = await getTranslations("register");

  return (
    <AuthLayout
      children={
        <>
          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <RegisterForm />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/auth/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {t("signInLink")}
                <ArrowRight className="ml-1 inline size-3.5" />
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t("agreeToTerms")}
          </p>
        </>
      }
      heroHeading={tReg("createYourAccount")}
      heroPara={tReg("joinZentro")}
    />
  );
}
