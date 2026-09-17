"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  useFollowUser,
  useUnfollowUser,
} from "@/features/follows/hooks";

import {
  useUpdateProfile,
  useUserProfile,
} from "../hooks";

import {
  updateProfileSchema,
} from "../schema";

import type {
  UpdateProfileFormData,
} from "../schema";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";
import ProfileListDialog from "./ProfileListDialog";

interface ProfileProps {
  userId: string;
}

export default function Profile({ userId }: ProfileProps) {

const [listType, setListType] = useState<"followers" | "following" | null>(null);

  const { data, isLoading, isError } = useUserProfile(userId);
  const { user } = useAuth();  

  const profile = data?.data;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsFollowing(profile.isFollowing);
    }
  }, [profile]);

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const updateProfileMutation = useUpdateProfile();

  const isOwnProfile = user?.id === profile?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  const handleEditOpen = () => {
    if (!profile) return;

    reset({
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio ?? "",
    });

    setIsEditOpen(true);
  };

  const onSubmit = async (formData: UpdateProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(formData);

      toast.success("Profile updated successfully");
      setIsEditOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;

    try {
      if (isFollowing) {
        const res = await unfollowMutation.mutateAsync(profile.id);
        setIsFollowing(false);
        toast.success(res.data.message || "Unfollowed successfully");
      } else {
        const res = await followMutation.mutateAsync(profile.id);
        setIsFollowing(true);
        toast.success(res.data.message || "Following successfully");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="space-y-5">
          <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />

          <div className="space-y-2">
            <div className="h-6 w-44 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />

          <div className="flex gap-8">
            <div className="h-10 w-16 animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  if (isError || !profile) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-12">
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load profile. Please try again.
          </p>
        </div>
      </section>
    );
  }

  const initials = profile?.displayName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <section className="mx-auto w-full max-w-2xl">
        {/* Profile Header */}
        <div className="border-b px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6">
            {/* Avatar + Actions */}
            <div className="flex items-start justify-between gap-4">
              <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
                <AvatarImage
                  src={profile?.profileImage?.url ?? undefined}
                  alt={profile.displayName}
                />

                <AvatarFallback className="text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="pt-1">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    className="rounded-full px-5"
                    onClick={handleEditOpen}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    className="min-w-24 rounded-full px-5"
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                    onClick={handleFollowToggle}>
                    {followMutation.isPending || unfollowMutation.isPending
                      ? "..."
                      : isFollowing
                      ? "Following"
                      : "Follow"}
                  </Button>
                )}
              </div>
            </div>

            {/* Identity */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {profile.displayName}
              </h1>

              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="max-w-xl whitespace-pre-wrap text-sm leading-6">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-7">
              <div className="text-sm">
                <span className="font-semibold">{profile.postsCount ?? 0}</span>{" "}
                <span className="text-muted-foreground">Posts</span>
              </div>

              <button
                type="button"
                onClick={() => setListType("followers")}
                className="text-sm transition-opacity hover:opacity-70"
              >
                <span className="font-semibold">
                  {profile.followersCount ?? 0}
                </span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </button>

              <button
                type="button"
                onClick={() => setListType("following")}
                className="text-sm transition-opacity hover:opacity-70"
              >
                <span className="font-semibold">
                  {profile.followingCount ?? 0}
                </span>{" "}
                <span className="text-muted-foreground">Following</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Followers / Following */}
      <ProfileListDialog
        open={listType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setListType(null);
          }
        }}
        userId={profile.id}
        type={listType ?? "followers"}
      />

      {/* Edit Profile */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>

              <Input
                id="username"
                placeholder="username"
                {...register("username")}
              />

              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>

              <Input
                id="displayName"
                placeholder="Your name"
                {...register("displayName")}
              />

              {errors.displayName && (
                <p className="text-sm text-destructive">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>

              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell people a little about yourself"
                {...register("bio")}
              />

              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
