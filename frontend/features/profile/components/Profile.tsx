"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Camera } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useFollowUser, useUnfollowUser } from "@/features/follows/hooks";

import {
  useUpdateProfile,
  useUpdateProfileImage,
  useUserProfile,
} from "../hooks";

import { updateProfileSchema } from "../schema";

import type { UpdateProfileFormData } from "../schema";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";
import ProfileListDialog from "./ProfileListDialog";

interface ProfileProps {
  userId: string;
}

export default function Profile({ userId }: ProfileProps) {

  const [listType, setListType] = useState<"followers" | "following" | null>(
    null
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, isLoading, isError } = useUserProfile(userId);
  const { user } = useAuth();

  const profile = data?.data;

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const updateProfileMutation = useUpdateProfile();
  const updateProfileImageMutation = useUpdateProfileImage();

  useEffect(() => {
    if (profile) {
      setIsFollowing(profile.isFollowing);
    }
  }, [profile]);

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

    setSelectedImage(null);
    setImagePreview(null);
    setIsEditOpen(true);
  };

  const handleEditClose = (open: boolean) => {
    if (!open) {
      setSelectedImage(null);
      setImagePreview(null);
    }

    setIsEditOpen(open);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG or WebP images are allowed");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Profile image must be less than 5MB");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const onSubmit = async (formData: UpdateProfileFormData) => {
    try {
      let profileUpdated = false;
      let imageUpdated = false;

      if (selectedImage) {
        await updateProfileImageMutation.mutateAsync(selectedImage);
        imageUpdated = true;
      }

      await updateProfileMutation.mutateAsync(formData);
      profileUpdated = true;

      if (imageUpdated || profileUpdated) {
        toast.success("Profile updated successfully");
      }

      setSelectedImage(null);
      setImagePreview(null);
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

  const initials = profile.displayName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentImage = imagePreview ?? profile.profileImage?.url ?? undefined;

  const isSaving = updateProfileMutation.isPending || updateProfileImageMutation.isPending;

  return (
    <>
      <section className="mx-auto w-full max-w-2xl">
        {/* Profile Header */}
        <div className="border-b px-4 py-6 sm:px-6">
          <div className="mb-6 flex items-center gap-3">
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>

          <div className="flex flex-col gap-6">
            {/* Avatar + Actions */}
            <div className="flex items-start justify-between gap-4">
              <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
                <AvatarImage
                  src={profile.profileImage?.url ?? undefined}
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
                    disabled={
                      followMutation.isPending || unfollowMutation.isPending
                    }
                    onClick={handleFollowToggle}
                  >
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
      <Dialog open={isEditOpen} onOpenChange={handleEditClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="h-24 w-24 border">
                  <AvatarImage src={currentImage} alt={profile.displayName} />

                  <AvatarFallback className="text-2xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 flex size-8 cursor-pointer items-center justify-center rounded-full border bg-background shadow-sm transition hover:bg-muted"
                  aria-label="Change profile image"
                >
                  <Camera className="size-4" />
                </label>

                <input
                  id="profileImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <label
                htmlFor="profileImage"
                className="cursor-pointer text-sm font-medium hover:underline"
              >
                Change profile photo
              </label>

              <p className="text-xs text-muted-foreground">
                JPG, JPEG, PNG or WebP · Max 5MB
              </p>
            </div>

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
                onClick={() => handleEditClose(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
