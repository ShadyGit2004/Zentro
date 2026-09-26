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

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useUpdateProfile, useUpdateProfileImage } from "../../profile/hooks";
import { updateProfileSchema } from "../../profile/schema";
import type { UpdateProfileFormData } from "../../profile/schema";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";

interface EditProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  profile: {
    id: string;
    username: string;
    displayName: string;
    bio?: string;
    profileImage?: {
      url: string;
      publicId?: string;
    } | null;
  };
}

export default function EditProfileForm({
  open,
  onOpenChange,
  userId,
  profile,
}: EditProfileFormProps) {
  const { user, updateUser } = useAuth();

  const [imgErr, setImgErr] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const updateProfileMutation = useUpdateProfile(userId);
  const updateProfileImageMutation = useUpdateProfileImage(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    if (!open) return;

    reset({
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio ?? "",
    });

    setImgErr("");
    setSelectedImage(null);
    setImagePreview(null);
  }, [open, profile, reset]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setImgErr("Only JPG, JPEG, PNG or WebP images are allowed.");
      toast.error("Only JPG, JPEG, PNG or WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImgErr("Profile image must be less than 5MB.");
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
    setImgErr("");
  };

  const handleProfileUpdate = async (values: UpdateProfileFormData) => {
    try {
      let updatedProfileImage:
        | {
            url: string;
            publicId?: string;
          }
        | undefined;

      if (selectedImage) {
        const imageResponse = await updateProfileImageMutation.mutateAsync(
          selectedImage
        );

        updatedProfileImage = imageResponse.data.profileImage;
      }

      const profileResponse = await updateProfileMutation.mutateAsync(values);

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
      onOpenChange(false);

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update profile."));
    }
  };

  const currentImage = imagePreview ?? profile.profileImage?.url ?? undefined;

  const isSaving = updateProfileMutation.isPending || updateProfileImageMutation.isPending;

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setSelectedImage(null);
      setImagePreview(null);
      setImgErr("");
    }

    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleProfileUpdate)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-none">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium">Username</label>

                <Input {...register("username")} className="mt-1.5" />

                {errors.username && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Display name</label>

                <Input {...register("displayName")} className="mt-1.5" />

                {errors.displayName && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.displayName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>

                <Textarea {...register("bio")} className="mt-1.5" rows={4} />

                {errors.bio && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              {currentImage && (
                <div>
                  <label className="text-sm font-medium">Profile image</label>

                  <div className="relative mt-1.5 overflow-hidden rounded-xl border">
                    <img
                      src={currentImage}
                      alt="Profile preview"
                      className="max-h-48 w-full object-cover sm:max-h-64"
                    />
                  </div>
                </div>
              )}

              <div>
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

                {imgErr && (
                  <p className="mt-1.5 text-sm text-destructive">{imgErr}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 shrink-0 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
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
  );
}
