"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFollowers, useFollowing } from "@/features/follows/hooks";
import type { ProfileListUser } from "../types";
import Link from "next/link";

interface ProfileListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  type: "followers" | "following";
}


const UserRow = ({ user }: { user: ProfileListUser }) => {
    
  const initials = user?.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (    
    <div className="flex items-center gap-3 rounded-lg p-2">
     <Link 
      href={`/profile/${user._id}`}
      className="group flex items-center gap-3">
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

      {/* <div>
        <button>Follow</button>
        <button>Unfollow</button>
      </div> */}
    </div>
  );
};

const ProfileListDialog = ({
  open,
  onOpenChange,
  userId,
  type,
}: ProfileListDialogProps) => {
    
  const followersQuery = useFollowers(userId);
  const followingQuery = useFollowing(userId);

  const query = type === "followers" ? followersQuery : followingQuery;

  const users = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-1 overflow-y-auto">
          {query.isLoading && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading...
            </p>
          )}

          {!query.isLoading && query.isError && (
            <p className="py-8 text-center text-sm text-destructive">
              Failed to load users.
            </p>
          )}

          {!query.isLoading && !query.isError && users.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {type === "followers"
                ? "No followers yet."
                : "Not following anyone yet."}
            </p>
          )}

          {users.map((user) => (
            <UserRow key={user._id} user={user} />
          ))}
        </div>

        {query.hasNextPage && (
          <Button
            variant="outline"
            className="w-full"
            disabled={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileListDialog;
