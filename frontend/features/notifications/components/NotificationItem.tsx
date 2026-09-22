import Link from "next/link";
import { Heart, MessageCircle, UserPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { Notification } from "../types";

interface NotificationItemProps {
  notification: Notification;
  onRead: (notification: Notification) => void;
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const { actor, type, isRead } = notification;

  const initials = actor.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const icon =
    type === "like" ? (
      <Heart className="size-4" />
    ) : type === "comment" ? (
      <MessageCircle className="size-4" />
    ) : (
      <UserPlus className="size-4" />
    );

  const message =
    type === "like"
      ? "liked your post"
      : type === "comment"
      ? "commented on your post"
      : "started following you";

  const content = (
    <div
      className={`flex gap-3 rounded-xl p-4 transition relative ${
        isRead ? "bg-background" : "bg-muted/50"
      }`}
    >
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={actor?.profileImage?.url ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6">
          <span className="font-semibold">{actor.displayName}</span>{" "}
          <span className="text-muted-foreground">{message}</span>
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>

      {/* <span className="absolute -top-0.5 -right-1.5">{icon}</span> */}
      <span>{icon}</span>

      {!isRead && (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-primary absolute -top-1.5 -right-1" />
      )}
    </div>
  );

  if (type === "follow") {
    return (
      <div onClick={() => onRead(notification)}>
        <Link href={`/profile/${actor._id}`}>{content}</Link>
      </div>
    );
  }

  // if (notification.post) {
  //   return (
  //     <div onClick={() => onRead(notification)}>{content}</div>
  //   );
  // }

  return <div onClick={() => onRead(notification)}>{content}</div>;
}
