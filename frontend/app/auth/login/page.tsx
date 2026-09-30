import Link from "next/link";
import { getTranslations } from "next-intl/server";

import LoginForm from "./LoginForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default async function LoginPage() {
  const t = await getTranslations("auth");
  const tLogin = await getTranslations("login");

  return (
    <AuthLayout
      children={
        <>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href="/auth/register"
              className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              {t("createAccount")}
            </Link>
          </p>{" "}
        </>
      }
      heroHeading={tLogin("welcomeBack")}
      heroPara={tLogin("signInToContinue")}
    />
  );
}
