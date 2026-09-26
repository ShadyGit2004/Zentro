"use client";

import { Settings, UserRound, Shield, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import SubscriptionPlans from "@/features/payment/components/SubscriptionPlans";
import BrowserKeywordNotificationWatcher from "@/features/notification-preferences/components/BrowserKeywordNotificationWatcher";
import NotificationPreferences from "@/features/notification-preferences/components/BrowserNotificationSettings";
import EditProfileForm from "@/features/users/components/EditProfileForm";
import ChangePasswordDialog from "@/features/users/components/ChangePasswordDialog";
import DeleteAccountDialog from "@/features/users/components/DeleteAccountDialog";
import LoginHistory from "@/features/login-history/components/LoginHistory";
import AppShell from "@/components/layout/AppShell";
import { useCurrentUser } from "@/features/users/hooks";

export default function SettingsPage() {
  const { data: currentUser } = useCurrentUser();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <AppShell>
      {currentUser && (
        <BrowserKeywordNotificationWatcher
          preferences={currentUser.notificationPreferences}
        />
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 shrink-0" />

          <h1 className="text-xl font-bold sm:text-2xl">Settings</h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, security, and notification preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 shrink-0" />

          <h2 className="text-sm font-semibold">Profile</h2>
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
                  <p className="text-xs text-muted-foreground">Email</p>

                  <p className="break-all text-sm">{currentUser?.email}</p>

                  {currentUser?.emailVerifiedAt && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Email verified
                    </p>
                  )}
                </div>

                {currentUser && (
                  <p className="text-xs text-muted-foreground">
                    Joined{" "}
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
              Edit profile
            </Button>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mt-6 space-y-3 sm:mt-8">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 shrink-0" />

          <h2 className="text-sm font-semibold">Security</h2>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">Change password</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Update your account password.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => setIsPasswordOpen(true)}
            >
              Change password
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
          <h2 className="text-sm font-semibold">Notifications</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Manage your browser notification preferences.
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
          <h2 className="text-sm font-semibold">Subscription</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Choose a plan that fits your needs.
          </p>
        </div>

        <SubscriptionPlans />
      </section>

      {/* Danger Zone */}
      <section className="mt-6 space-y-3 sm:mt-8">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 shrink-0 text-destructive" />

          <h2 className="text-sm font-semibold text-destructive">
            Danger Zone
          </h2>
        </div>

        <div className="rounded-2xl border border-destructive/30 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">Delete account</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Permanently delete your account and associated data.
              </p>
            </div>

            <Button
              variant="destructive"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete account
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

      <DeleteAccountDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
    </AppShell>
  );
}
