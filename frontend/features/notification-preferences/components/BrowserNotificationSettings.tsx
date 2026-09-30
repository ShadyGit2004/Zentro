"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { useUpdateNotificationPreferences } from "../hooks";
import type { NotificationPreferences } from "../types";

interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
}

const NotificationPreferences = ({
  preferences,
}: NotificationPreferencesProps) => {
  const t = useTranslations("notificationSettings");
  const tCommon = useTranslations("common");
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  const [browserEnabled, setBrowserEnabled] = useState(preferences?.browserEnabled || false);
  const [keywords, setKeywords] = useState<string[]>(preferences?.keywords || []);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    setBrowserEnabled(preferences?.browserEnabled ?? false);
    setKeywords(preferences?.keywords ?? []);
  }, [preferences]);

  const handleBrowserToggle = async (enabled: boolean) => {
    if (enabled) {
      if (!("Notification" in window)) {
        toast.error(t("notSupported"));
        return;
      }

      if (Notification.permission === "denied") {
        toast.error(t("blocked"));
        return;
      }

      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          toast.error(t("permissionDenied"));
          return;
        }
      }
    }

    setBrowserEnabled(enabled);
  };

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();

    if (!keyword) return;

    if (keyword?.length > 50) {
      toast.error(t("keywordTooLong"));
      return;
    }

    if (keywords?.length >= 20) {
      toast.error(t("tooManyKeywords"));
      return;
    }

    if (keywords.includes(keyword)) {
      setKeywordInput("");
      return;
    }

    setKeywords((current) => [...current, keyword]);
    setKeywordInput("");
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords((current) =>
      current.filter((keyword) => keyword !== keywordToRemove)
    );
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(
      {
        browserEnabled,
        keywords,
      },
      {
        onSuccess: (response) => {
          setBrowserEnabled(response.data.browserEnabled);
          setKeywords(response.data.keywords);

          toast.success(t("saved"));
        },
        onError: () => {
          toast.error(t("saveFailed"));
        },
      }
    );
  };

  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg border p-2">
            <Bell className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-medium">{t("browserNotifications")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("browserNotificationsDesc")}
            </p>
          </div>
        </div>

        <Switch
          checked={browserEnabled}
          onCheckedChange={handleBrowserToggle}
          disabled={updatePreferencesMutation.isPending}
        />
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium">{t("keywords")}</p>

        <p className="mt-1 text-xs text-muted-foreground">
          {t("keywordsDesc")}
        </p>

        <div className="mt-3 flex gap-2">
          <Input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddKeyword();
              }
            }}
            placeholder={t("keywordPlaceholder")}
            maxLength={50}
            disabled={keywords?.length >= 20}
          />

          <Button
            type="button"
            variant="outline"
            onClick={handleAddKeyword}
            disabled={!keywordInput.trim() || keywords?.length >= 20}
          >
            {tCommon("add")}
          </Button>
        </div>

        {keywords?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <div
                key={keyword}
                className="flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-xs"
              >
                <span>{keyword}</span>

                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="rounded-full p-0.5 hover:bg-background"
                  aria-label={`Remove ${keyword}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          {t("keywordsCount", { count: keywords?.length })}
        </p>
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={updatePreferencesMutation.isPending}
        >
          {updatePreferencesMutation.isPending ? t("saving") : tCommon("save")}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
