"use client";

import { useState } from "react";
import { ChevronDown, Monitor, Smartphone, Tablet } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Button } from "@/components/ui/button";

import { useLoginHistory } from "../hooks";
import { getApiErrorMessage } from "@/lib/api-error";

export default function LoginHistory() {
  const t = useTranslations("loginHistory");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);

  const {
    data: loginHistoryData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLoginHistory(open);

  const loginHistory =
    loginHistoryData?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Collapsible className="w-full" open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border p-4 text-left">
        <div>
          <p className="text-sm font-semibold">{t("title")}</p>

          <p className="text-xs text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <ChevronDown
          className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 w-full">
        <section className="rounded-2xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">{t("title")}</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("desc")}
            </p>
          </div>

          <div className="mt-5">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-xl border p-4 text-sm text-destructive">
                {getApiErrorMessage(error, t("unableToLoad"))}
              </div>
            ) : loginHistory.length === 0 ? (
              <div className="rounded-xl border p-6 text-center">
                <p className="text-sm font-medium">{t("noHistory")}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {t("noHistoryDesc")}
                </p>
              </div>
            ) : (
              <div className="divide-y rounded-xl border">
                {loginHistory.map((session) => {
                  const DeviceIcon =
                    session.device === "Mobile"
                      ? Smartphone
                      : session.device === "Tablet"
                      ? Tablet
                      : Monitor;

                  return (
                    <div key={session.id} className="flex gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        <DeviceIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold">
                            {session.browser}
                          </p>

                          <span
                            className={`w-fit rounded-full px-2 py-0.5 text-xs ${
                              session.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {session.status === "active" ? t("active") : t("revoked")}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {session.os} · {session.device}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("ip")}: {session.ipAddress}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("loggedIn")} {new Date(session.loginAt).toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("lastActive")}{" "}
                          {new Date(session.lastUsedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {hasNextPage && (
                  <div className="border-t p-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="w-full text-sm font-medium text-primary disabled:opacity-50"
                    >
                      {isFetchingNextPage ? tCommon("loading") : tCommon("loadMore")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </CollapsibleContent>
    </Collapsible>
  );
}
