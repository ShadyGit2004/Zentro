"use client";

import { Settings, UserRound, Shield, Trash2, Languages, Bell, CreditCard } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import NotificationPreferences from "@/features/notification-preferences/components/BrowserNotificationSettings";
import EditProfileForm from "@/features/users/components/EditProfileForm";
import ChangePasswordDialog from "@/features/users/components/ChangePasswordDialog";
import DeleteAccountDialog from "@/features/users/components/DeleteAccountDialog";
import LoginHistory from "@/features/login-history/components/LoginHistory";
import AppShell from "@/components/layout/AppShell";
import { useCurrentUser } from "@/features/users/hooks";
import SettingSkeleton from "./SettingsSkeleton";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/api-error";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { data: currentUser, isLoading, isError, error } = useCurrentUser();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) {
    return <SettingSkeleton />;
  }

  return (
    <AppShell>
      {isError || !currentUser ? (
        <div className="rounded-2xl border p-5">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(error, t("unableToLoad"))}
          </p>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 shrink-0" />
              <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          {/* Language */}
          <section className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 shrink-0" />
                <h2 className="text-sm font-semibold">{t("language")}</h2>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {t("languageDesc")}
              </p>
            </div>

            <div className="rounded-2xl border p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t("appLanguage")}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("appLanguageDesc")}
                  </p>
                </div>

                <div className="w-full sm:w-auto">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </section>

          {/* Profile */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 shrink-0" />
              <h2 className="text-sm font-semibold">{t("profile")}</h2>
            </div>

            <div className="rounded-2xl border p-4 sm:p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  {/* Profile Image */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border bg-muted">
                    {currentUser?.profileImage?.url ? (
                      <img
                        src={currentUser.profileImage.url}
                        alt={currentUser.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold">
                        {currentUser?.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div>
                      <p className="truncate font-semibold">
                        {currentUser?.displayName}
                      </p>

                      <p className="break-all text-sm text-muted-foreground">
                        @{currentUser?.username}
                      </p>
                    </div>

                    {currentUser?.bio && (
                      <p className="max-w-xl break-words text-sm text-muted-foreground">
                        {currentUser.bio}
                      </p>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {t("email")}
                      </p>

                      <p className="break-all text-sm">{currentUser?.email}</p>

                      {currentUser?.emailVerifiedAt && (
                        <p className="mt-1 text-xs text-green-600">
                          {t("emailVerified")}
                        </p>
                      )}
                    </div>

                    {currentUser && (
                      <p className="text-xs text-muted-foreground">
                        {t("joined")}{" "}
                        {new Date(currentUser.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => setIsEditOpen(true)}
                >
                  {t("editProfile")}
                </Button>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="mt-6 space-y-3 sm:mt-8">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 shrink-0" />
              <h2 className="text-sm font-semibold">{t("security")}</h2>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t("changePassword")}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("changePasswordDesc")}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => setIsPasswordOpen(true)}
                >
                  {t("changePassword")}
                </Button>
              </div>
            </div>

            {/* Login History */}
            <div className="min-w-0 overflow-hidden">
              <LoginHistory />
            </div>
          </section>

          {/* Notifications */}
          <section className="mt-6 space-y-3 sm:mt-8">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 shrink-0" />
                <h2 className="text-sm font-semibold">{t("notifications")}</h2>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {t("notificationsDesc")}
              </p>
            </div>

            {currentUser && (
              <div className="min-w-0 overflow-hidden">
                <NotificationPreferences
                  preferences={currentUser.notificationPreferences}
                />
              </div>
            )}
          </section>

          {/* Subscription */}
          <section className="mt-8 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0" />
                <h2 className="text-sm font-semibold">{t("subscription")}</h2>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {t("subscriptionDesc")}
              </p>
            </div>

            <div className="rounded-2xl border p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{t("subscription")}</h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("manageSubscriptionDesc")}
                  </p>
                </div>

                <Link
                  href="/settings/subscription"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {t("manageSubscription")}
                </Link>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="mt-6 space-y-3 sm:mt-8">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 shrink-0 text-destructive" />

              <h2 className="text-sm font-semibold text-destructive">
                {t("dangerZone")}
              </h2>
            </div>

            <div className="rounded-2xl border border-destructive/30 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t("deleteAccount")}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("deleteAccountDesc")}
                  </p>
                </div>

                <Button
                  variant="destructive"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  {t("deleteAccount")}
                </Button>
              </div>
            </div>
          </section>

          {/* Dialogs */}
          {currentUser && (
            <EditProfileForm
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              userId={currentUser.id}
              profile={{
                id: currentUser.id,
                username: currentUser.username,
                displayName: currentUser.displayName,
                bio: currentUser.bio,
                profileImage: currentUser.profileImage,
              }}
            />
          )}

          <ChangePasswordDialog
            open={isPasswordOpen}
            onOpenChange={setIsPasswordOpen}
          />

          <DeleteAccountDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        </div>
      )}
    </AppShell>
  );
}
