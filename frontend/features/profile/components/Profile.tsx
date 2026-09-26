"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UserRound, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  useFollowers,
  useFollowing,
  useFollowUser,
  useUnfollowUser,
} from "@/features/follows/hooks";

import { useUserProfile } from "../hooks";
import { useUserPosts } from "@/features/posts/hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";

import ProfileSkeleton from "./ProfileSkeleton";
import PostCard from "@/features/posts/components/PostCard";
import { ProfileListSkeleton, EmptyList } from "./ProfileSkeleton";
import FeedSkeleton from "@/features/feed/components/FeedSkeleton";

interface ProfileProps {
  userId: string;
}

type Tab = "posts" | "followers" | "following";

export default function Profile({ userId }: ProfileProps) { 
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const { data, isLoading, isError, error } = useUserProfile(userId);

  const profile = data?.data;

  const isOwnProfile = user?.id === profile?.id;

  /*
   * Only fetch the active tab.
   *
   * This prevents:
   * profile + posts + followers + following
   * from all fetching simultaneously.
   */
  const { 
    data: postsData,
    isLoading: postsLoading,
    fetchNextPage: fetchNextPosts,
    isError : isPostsError,
    error : postsError,
    hasNextPage: hasMorePosts,
    isFetchingNextPage: fetchingPosts,
  } = useUserPosts(
    userId,
    activeTab === "posts"
  );  

  const {
    data: followersData,
    isLoading: followersLoading,
    isError : isFollowersError,
    error : followersError,
    fetchNextPage: fetchNextFollowers,
    hasNextPage: hasMoreFollowers,
    isFetchingNextPage: fetchingFollowers,
  } = useFollowers(userId, activeTab === "followers");

  const {
    data: followingData,
    isLoading: followingLoading,
    isError: isFollowingError,
    error: followingError,
    fetchNextPage: fetchNextFollowing,
    hasNextPage: hasMoreFollowing,
    isFetchingNextPage: fetchingFollowing,
  } = useFollowing(userId, activeTab === "following");

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollowToggle = async () => {
    if (!profile) return;

    try {
      if (profile.isFollowing) {
        const response = await unfollowMutation.mutateAsync(profile.id);

        toast.success(response.data.message || "Unfollowed successfully.");
      } else {
        const response = await followMutation.mutateAsync(profile.id);

        toast.success(response.data.message || "Following successfully.");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update follow status."));
    }
  };

  const handleRowFollowToggle = async (
    targetUserId: string,
    isFollowing: boolean
  ) => {
    try {
      if (isFollowing) {
        const response = await unfollowMutation.mutateAsync(targetUserId);

        toast.success(response.data.message || "Unfollowed successfully.");
      } else {
        const response = await followMutation.mutateAsync(targetUserId);

        toast.success(response.data.message || "Following successfully.");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update follow status."));
    }
  };

  const posts = postsData?.pages.flatMap((page) => page.data) ?? [];

  const followers = followersData?.pages.flatMap((page) => page.data) ?? [];

  const following = followingData?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="rounded-2xl border p-8 text-center">
          <UserRound className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

          <h2 className="text-lg font-semibold">Profile unavailable</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {getApiErrorMessage(error, "We couldn't load this profile.")}
          </p>
        </div>
      </div>
    );
  }

  const initials = profile.displayName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentImage = profile.profileImage?.url ?? undefined;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Profile Header */}
      <section className="rounded-2xl border p-5">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src={currentImage} alt={profile.displayName} />

              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold">
                  {profile.displayName}
                </h1>

                <p className="text-sm text-muted-foreground">
                  @{profile.username}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!isOwnProfile && (
                  <Button
                    size="sm"
                    variant={profile.isFollowing ? "outline" : "default"}
                    onClick={handleFollowToggle}
                    disabled={
                      followMutation.isPending || unfollowMutation.isPending
                    }
                  >
                    {profile.isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 border-t pt-5">
          <div className="text-center">
            <p className="font-semibold">{profile.postsCount}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>

          <div className="text-center">
            <p className="font-semibold">{profile.followersCount}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>

          <div className="text-center">
            <p className="font-semibold">{profile.followingCount}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-5 grid grid-cols-3 border-b">
        {(
          [
            ["posts", "Posts"],
            ["followers", "Followers"],
            ["following", "Following"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {activeTab === "posts" && (
        <section className="mt-4">
          {isPostsError && (
            <p className="mt-1 text-sm text-muted-foreground">
              {getApiErrorMessage(postsError, "Unable to load posts.")}
            </p>
          )}
          {postsLoading ? (
            <FeedSkeleton />
          ) : posts.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
              <UserRound className="mb-3 h-10 w-10 text-muted-foreground" />
              <h2 className="font-semibold">No posts yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Posts from this profile will appear here.
              </p>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
          {hasMorePosts && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => fetchNextPosts()}
              disabled={fetchingPosts}
            >
              {fetchingPosts ? "Loading..." : "Load more"}
            </Button>
          )}
        </section>
      )}

      {/* Followers */}
      {activeTab === "followers" && (
        <section className="mt-4">
          {isFollowersError && (
            <p className="mt-1 text-sm text-muted-foreground">
              {getApiErrorMessage(followersError, "Unable to load followers.")}
            </p>
          )}
          {followersLoading ? (
            <ProfileListSkeleton />
          ) : followers.length === 0 ? (
            <EmptyList
              icon={<Users className="h-10 w-10" />}
              title="No followers yet"
              description="Followers will appear here."
            />
          ) : (
            <div className="divide-y rounded-xl border">
              {followers.map((follower) => (
                <ProfileListRow
                  key={follower._id}
                  user={follower}
                  currentUserId={user?.id}
                  onFollowToggle={handleRowFollowToggle}
                  isPending={
                    followMutation.isPending || unfollowMutation.isPending
                  }
                />
              ))}
            </div>
          )}

          {hasMoreFollowers && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => fetchNextFollowers()}
              disabled={fetchingFollowers}
            >
              {fetchingFollowers ? "Loading..." : "Load more"}
            </Button>
          )}
        </section>
      )}

      {/* Following */}
      {activeTab === "following" && (
        <section className="mt-4">
          {isFollowingError && (
            <p className="mt-1 text-sm text-muted-foreground">
              {getApiErrorMessage(
                followingError,
                "Unable to load following users."
              )}
            </p>
          )}
          {followingLoading ? (
            <ProfileListSkeleton />
          ) : following.length === 0 ? (
            <EmptyList
              icon={<Users className="h-10 w-10" />}
              title="Not following anyone"
              description="Accounts followed by this user will appear here."
            />
          ) : (
            <div className="divide-y rounded-xl border">
              {following.map((followingUser) => (
                <ProfileListRow
                  key={followingUser._id}
                  user={followingUser}
                  currentUserId={user?.id}
                  onFollowToggle={handleRowFollowToggle}
                  isPending={
                    followMutation.isPending || unfollowMutation.isPending
                  }
                />
              ))}
            </div>
          )}

          {hasMoreFollowing && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => fetchNextFollowing()}
              disabled={fetchingFollowing}
            >
              {fetchingFollowing ? "Loading..." : "Load more"}
            </Button>
          )}
        </section>
      )}
    </div>
  );
}

function ProfileListRow({
  user,
  currentUserId,
  onFollowToggle,
  isPending,
}: {
  user: {
    _id: string;
    username: string;
    displayName: string;
    bio?: string;
    profileImage?: {
      url: string;
      publicId?: string;
    } | null;
    isFollowing: boolean;
  };
  currentUserId?: string;
  onFollowToggle: (userId: string, isFollowing: boolean) => void;
  isPending: boolean;
}) {
  const initials = user.displayName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isSelf = currentUserId === user._id;

  return (
    <div className="flex items-center gap-3 p-4">
      <Link
        href={`/profile/${user._id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar>
          <AvatarImage
            src={user.profileImage?.url ?? undefined}
            alt={user.displayName}
          />

          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.displayName}</p>

          <p className="truncate text-xs text-muted-foreground">
            @{user.username}
          </p>
        </div>
      </Link>

      {!isSelf && (
        <Button
          size="sm"
          variant={user.isFollowing ? "outline" : "default"}
          disabled={isPending}
          onClick={() => onFollowToggle(user._id, user.isFollowing)}
        >
          {user.isFollowing ? "Following" : "Follow"}
        </Button>
      )}
      {isSelf && <span className="text-sm text-muted-foreground"> me </span>}
    </div>
  );
}