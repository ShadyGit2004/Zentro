"use client";

import { useEffect, useMemo, useRef } from "react";

import { useKeywordNotificationPosts } from "../hooks";

import type { NotificationPreferences } from "../types";
import type { FeedPost } from "@/features/feed/types";

interface BrowserKeywordNotificationWatcherProps {
  preferences: NotificationPreferences;
}

const BrowserKeywordNotificationWatcher = ({
  preferences,
}: BrowserKeywordNotificationWatcherProps) => {
  const browserEnabled = preferences?.browserEnabled ?? false;
  const keywords = preferences?.keywords ?? [];

  const notificationPermission =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default";

  const notificationsReady =
    browserEnabled && notificationPermission === "granted";

  const { data } = useKeywordNotificationPosts(notificationsReady);

  const initializedRef = useRef(false);
  const notifiedPostIdsRef = useRef<Set<string>>(new Set());

  const normalizedKeywords = useMemo(() => {
    return keywords
      .map((keyword) => keyword.trim().toLowerCase())
      .filter(Boolean);
  }, [keywords]);

  useEffect(() => {
    if (!browserEnabled) {
      initializedRef.current = false;
      notifiedPostIdsRef.current.clear();
      return;
    }

    if (!notificationsReady) {
      return;
    }

    const posts: FeedPost[] = data?.data ?? [];

    if (!posts.length) {
      return;
    }

    /*
     * First successful request establishes the baseline.
     * Existing posts must not trigger notifications.
     */
    if (!initializedRef.current) {
      posts.forEach((post) => {
        notifiedPostIdsRef.current.add(post._id);
      });

      initializedRef.current = true;
      return;
    }

    if (!normalizedKeywords.length) {
      return;
    }

    const newMatchingPosts = posts.filter((post) => {
      if (notifiedPostIdsRef.current.has(post._id)) {
        return false;
      }

      const content = post.content?.trim().toLowerCase();

      if (!content) {
        return false;
      }

      return normalizedKeywords.some((keyword) => content.includes(keyword));
    });

    newMatchingPosts.forEach((post) => {
      notifiedPostIdsRef.current.add(post._id);

      const content = post.content?.trim();

      if (!content) {
        return;
      }

      new Notification("Zentro — Keyword match", {
        body: content,
        tag: `keyword-post-${post._id}`,
      });
    });
  }, [data, browserEnabled, notificationsReady, normalizedKeywords]);

  return null;
};

export default BrowserKeywordNotificationWatcher;
