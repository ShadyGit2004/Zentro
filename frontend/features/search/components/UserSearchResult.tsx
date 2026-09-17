import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SearchUser } from "../types";

interface UserSearchResultProps {
  user: SearchUser;
}

export default function UserSearchResult({ user }: UserSearchResultProps) {
  const initials = user.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/profile/${user._id}`}
      className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-muted"
    >
      <Avatar>
        <AvatarImage src={user?.profileImage?.url ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p className="truncate font-medium">{user.displayName}</p>

        <p className="truncate text-sm text-muted-foreground">
          @{user.username}
        </p>
      </div>
    </Link>
  );
}
