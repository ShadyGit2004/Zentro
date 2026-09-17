import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SearchPost } from "../types";

interface PostSearchResultProps {
  post: SearchPost;
}

export default function PostSearchResult({ post }: PostSearchResultProps) {
  const initials = post.author.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-xl border p-4">
      <Link
        href={`/profile/${post.author._id}`}
        className="flex items-center gap-3"
      >
        <Avatar className="size-9">
          <AvatarImage src={post.author?.profileImage?.url ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {post.author.displayName}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            @{post.author.username}
          </p>
        </div>
      </Link>

      <p className="mt-3 whitespace-pre-wrap text-sm">{post.content}</p>
    </div>
  );
}
