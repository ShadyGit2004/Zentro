"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AudioLines, ImagePlus, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "../hooks";
import { createPostSchema, type CreatePostFormData } from "../schema";

import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

const IMAGE_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/webm",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 10 * 1024 * 1024;

export default function CreatePost() {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  const [audio, setAudio] = useState<File | undefined>();
  const [audioPreview, setAudioPreview] = useState<string | undefined>();

  const createPostMutation = useCreatePost();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
    },
  });

  const content = watch("content");

  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(undefined);
    setImagePreview(undefined);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const clearAudio = () => {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }

    setAudio(undefined);
    setAudioPreview(undefined);

    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error(t("imageFormatError"));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(t("imageSizeError"));
      event.target.value = "";
      return;
    }

    // Image and audio cannot be selected together.
    clearAudio();

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAudioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!AUDIO_TYPES.includes(file.type)) {
      toast.error(t("audioFormatError"));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AUDIO_SIZE) {
      toast.error(t("audioSizeError"));
      event.target.value = "";
      return;
    }

    // Audio and image cannot be selected together.
    clearImage();

    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }

    setAudio(file);
    setAudioPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data: CreatePostFormData) => {
    createPostMutation.mutate(
      {
        content: data.content,
        image,
        audio,
      },
      {
        onSuccess: () => {
          reset();
          clearImage();
          clearAudio();
          toast.success(t("postCreated"));
        },

        onError: (error: unknown) => {
          const err = getApiErrorMessage(
            error,
            t("unableToCreatePost")
          );

          toast.error(err);
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-b py-4 px-3"
    >
      <Textarea
        {...register("content")}
        placeholder={t("whatsHappening")}
        maxLength={280}
        disabled={createPostMutation.isPending}
        className="min-h-20 resize-none border-0 px-1 text-base shadow-none focus-visible:ring-0"
      />

      {errors.content && (
        <p className="mt-1 text-sm text-destructive">
          {errors.content.message}
        </p>
      )}

      {imagePreview && (
        <div className="relative mt-3 overflow-hidden rounded-xl border">
          <Image
            src={imagePreview}
            alt={t("selectedImagePreview")}
            width={800}
            height={500}
            unoptimized
            className="max-h-96 w-full object-cover"
          />

          <button
            type="button"
            onClick={clearImage}
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow"
            aria-label={t("removeImage")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {audioPreview && (
        <div className="relative mt-3 rounded-xl border p-3">
          <audio
            controls
            preload="metadata"
            src={audioPreview}
            className="w-full"
            aria-label={t("selectedAudioPreview")}
          />

          <button
            type="button"
            onClick={clearAudio}
            className="absolute right-2 top-2 rounded-full bg-background p-1.5 shadow"
            aria-label={t("removeAudio")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm"
            className="hidden"
            onChange={handleAudioChange}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            disabled={
              createPostMutation.isPending || !!audio
            }
            aria-label={t("addImage")}
          >
            <ImagePlus className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => audioInputRef.current?.click()}
            disabled={
              createPostMutation.isPending || !!image
            }
            aria-label={t("addAudio")}
          >
            <AudioLines className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {content?.length ?? 0}/280
          </span>

          <Button
            type="submit"
            disabled={
              createPostMutation.isPending ||
              (!image && !audio && !content?.trim())
            }
          >
            {createPostMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tCommon("posting")}
              </>
            ) : (
              tCommon("post")
            )}
          </Button>
        </div>
      </div>

      {createPostMutation.isError && (
        <p className="mt-2 text-sm text-destructive">
          {t("unableToCreatePost")}
        </p>
      )}
    </form>
  );
}