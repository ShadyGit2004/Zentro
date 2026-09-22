"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Camera, Lock, Pencil, Trash2, UserRound, Users } from "lucide-react";

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

import {
  useFollowers,
  useFollowing,
  useFollowUser,
  useUnfollowUser,
} from "@/features/follows/hooks";

import {
  useUpdatePassword,
  useUpdateProfile,
  useUpdateProfileImage,
  useUserProfile,
  useDeleteAccount,
} from "../hooks";

import { useRouter } from "next/navigation";

import { useUserPosts } from "@/features/posts/hooks";

import { updatePasswordSchema, updateProfileSchema } from "../schema";
import type { UpdatePasswordFormData, UpdateProfileFormData } from "../schema";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";

import ProfileSkeleton from "./ProfileSkeleton";
import PostCard from "@/features/posts/components/PostCard";
import {ProfileListSkeleton, EmptyList} from "./ProfileSkeleton";
import FeedSkeleton from "@/features/feed/components/FeedSkeleton";

interface ProfileProps {
  userId: string;
}

type Tab = "posts" | "followers" | "following";

export default function Profile({ userId }: ProfileProps) { 
  const router = useRouter(); 
  const { user, updateUser, clearAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const updateProfileMutation = useUpdateProfile(userId);

  const updateProfileImageMutation = useUpdateProfileImage(userId);

  const updatePasswordMutation = useUpdatePassword();

  const deleteAccountMutation = useDeleteAccount();

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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG or WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile image must be less than 5MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
  };

  const handleProfileUpdate = async (values: UpdateProfileFormData) => {
    try {
      let updatedProfileImage: {
        url?: string;
        publicId: string
      } | undefined;

      if (selectedImage) {
        const imageResponse = await updateProfileImageMutation.mutateAsync(
          selectedImage
        );

        updatedProfileImage = imageResponse.data.profileImage;
      }

      const profileResponse = await updateProfileMutation.mutateAsync(values);

      // Sync AuthContext only when editing own profile
      if (userId === user?.id) {
        updateUser({
          username: profileResponse.data.username,
          displayName: profileResponse.data.displayName,
          ...(updatedProfileImage !== undefined && {
            profileImage: updatedProfileImage,
          }),
        });
      }

      setSelectedImage(null);
      setImagePreview(null);
      setIsEditOpen(false);

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update profile."));
    }
  };

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

  function PasswordDialog({
    open,
    onOpenChange,
    mutation,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mutation: ReturnType<typeof useUpdatePassword>;
  }) {
    const form = useForm<UpdatePasswordFormData>({
      resolver: zodResolver(updatePasswordSchema),
      defaultValues: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    });

    const handleSubmit = async (values: UpdatePasswordFormData) => {
      try {
        await mutation.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        toast.success("Password updated successfully.");

        form.reset();
        onOpenChange(false);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to update password."));
      }
    };

    return (
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            form.reset();
          }

          onOpenChange(value);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="space-y-3">
              <label className="text-sm font-medium">Current password</label>
              <Input
                type="password"
                placeholder="Current password"
                {...form.register("currentPassword")}
              />

              {form.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New password</label>

              <Input
                type="password"
                placeholder="New password"
                {...form.register("newPassword")}
              />

              {form.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confirm new password
              </label>

              <Input
                type="password"
                placeholder="Confirm new password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Updating..." : "Update password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

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
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn't load this profile.
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

  const currentImage = imagePreview ?? profile.profileImage?.url ?? undefined;

  const isSaving = updateProfileMutation.isPending || updateProfileImageMutation.isPending;

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

            {isOwnProfile && (
              <button
                type="button"
                onClick={handleEditOpen}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm"
                aria-label="Edit profile"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
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
                {isOwnProfile ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditOpen}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPasswordOpen(true)}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Password
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setIsDeleteOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant={profile.isFollowing ? "outline" : "default"}
                    onClick={handleFollowToggle}
                    disabled={
                      followMutation.isPending || unfollowMutation.isPending
                    }
                  >
                    {" "}
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

          <button
            type="button"
            onClick={() => setActiveTab("followers")}
            className="text-center"
          >
            <p className="font-semibold">{profile.followersCount}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("following")}
            className="text-center"
          >
            <p className="font-semibold">{profile.followingCount}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
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
            {" "}
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {activeTab === "posts" && (
        <section className="mt-4">
          {isPostsError && (
            <p>{getApiErrorMessage(postsError, "Unable to load posts.")}</p>
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
            <p>{getApiErrorMessage(followersError, "Unable to load followers.")}</p>
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
            <p>{getApiErrorMessage(followingError, "Unable to load following users.")}</p>
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

      {/* Edit Profile */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open && imagePreview) {
            URL.revokeObjectURL(imagePreview);
          }

          if (!open) {
            setSelectedImage(null);
            setImagePreview(null);
          }

          setIsEditOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleProfileUpdate)}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Username</label>

              <Input {...register("username")} className="mt-1" />

              {errors.username && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Display name</label>

              <Input {...register("displayName")} className="mt-1" />

              {errors.displayName && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>

              <Textarea {...register("bio")} className="mt-1" rows={4} />

              {errors.bio && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {currentImage && (
              <div className="relative overflow-hidden rounded-xl border">
                <img
                  src={currentImage}
                  alt="Profile preview"
                  className="max-h-64 w-full object-cover"
                />
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Camera className="h-4 w-4" />
              Change profile image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password */}
      <PasswordDialog
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
        mutation={updatePasswordMutation}
      />

      {/* Delete account */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This action cannot be undone. Your account and associated data will
            be permanently deleted.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={deleteAccountMutation.isPending}
              onClick={() => {
                deleteAccountMutation.mutate(undefined, {
                  onSuccess: () => {
                    clearAuth();
                    toast.success("Account deleted successfully.");
                    router.replace("/auth/login");
                  },
                  onError: (error) => {
                    toast.error(
                      getApiErrorMessage(error, "Unable to delete account.")
                    );
                  },
                });
              }}
            >
              {deleteAccountMutation.isPending
                ? "Deleting..."
                : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    bio: string;
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
      {isSelf && (
        <span className="text-sm text-muted"> me </span>
      )}
    </div>
  );
}