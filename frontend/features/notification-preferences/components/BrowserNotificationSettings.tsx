"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

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
        toast.error("Browser notifications are not supported.");
        return;
      }

      if (Notification.permission === "denied") {
        toast.error(
          "Notifications are blocked. Allow them from your browser settings."
        );
        return;
      }

      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          toast.error("Notification permission was not granted.");
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
      toast.error("Keyword cannot exceed 50 characters.");
      return;
    }

    if (keywords?.length >= 20) {
      toast.error("You can add up to 20 keywords.");
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

          toast.success("Notification preferences updated.");
        },
        onError: () => {
          toast.error("Failed to update notification preferences.");
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
            <p className="text-sm font-medium">Browser notifications</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Get notified when posts match your selected keywords.
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
        <p className="text-sm font-medium">Keywords</p>

        <p className="mt-1 text-xs text-muted-foreground">
          Add words you want to receive notifications for.
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
            placeholder="e.g. cricket"
            maxLength={50}
            disabled={keywords?.length >= 20}
          />

          <Button
            type="button"
            variant="outline"
            onClick={handleAddKeyword}
            disabled={!keywordInput.trim() || keywords?.length >= 20}
          >
            Add
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
          {keywords?.length}/20 keywords
        </p>
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={updatePreferencesMutation.isPending}
        >
          {updatePreferencesMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
