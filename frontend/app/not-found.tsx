"use client";

import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>

        <p className="text-sm font-medium text-muted-foreground">{t("error404")}</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {t("pageNotFound")}
        </h1>

        <p className="mt-3 text-muted-foreground">
          {t("pageNotFoundDesc")}
        </p>

        <Link
          href="/home"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          {t("goToHome")}
        </Link>
      </div>
    </main>
  );
}
