"use client";

import { Heart, MessageCircle } from "lucide-react";

import type { FeedPost } from "@/features/feed/types";

interface PostCardProps {
  post: FeedPost;
}

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="border-b px-4 py-5">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
          {post.author.profileImage ? (
            <img
              src={post.author.profileImage.url}
              alt={post.author.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold">
              {post.author.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Author */}
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-semibold">{post.author.displayName}</span>

            <span className="text-sm text-muted-foreground">
              @{post.author.username}
            </span>

            <span className="text-sm text-muted-foreground">
              · {formattedDate}
            </span>
          </div>

          {/* Content */}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
            {post.content}
          </p>

          {/* Media */}
          {post.media?.url && (
            <div className="mt-3 overflow-hidden rounded-xl border">
              <img
                src={post.media.url}
                alt="Post media"
                className="max-h-[500px] w-full object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-6 text-muted-foreground">
            <button
              type="button"
              className="flex items-center gap-2 text-sm transition-colors hover:text-foreground"
            >
              <Heart className="h-4 w-4" />
              <span>{post.likesCount}</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 text-sm transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
