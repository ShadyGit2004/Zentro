"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "../hooks";
import { createPostSchema, type CreatePostFormData } from "../schema";

import {toast} from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

export default function CreatePost() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();

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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    const fileTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (!file) return;

    if (!fileTypes.includes(file.type)) {
      toast.error("Please select an image file [jpg, jpeg, png, webp].");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }    

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(undefined);
    setImagePreview(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

 const onSubmit = (data: CreatePostFormData) => {

   createPostMutation.mutate(
     { content: data.content, image },
     {
       onSuccess: () => {
         reset();
         removeImage();
         toast.success("Post created successfully.");
       },

       onError: (error:unknown) => {         
        const err = getApiErrorMessage(error, "Unable to create post. Please try again.");
        toast.error(err);
       },
     }
   );
 };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border-b py-4 px-3">
      <Textarea
        {...register("content")}
        placeholder="What’s happening?"
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
            alt="Selected image preview"
            width={800}
            height={500}
            unoptimized
            className="max-h-96 w-full object-cover"
          />

          <button
            type="button"
            onClick={removeImage}
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpg, image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={handleImageChange}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={createPostMutation.isPending}
            aria-label="Add image"
          >
            <ImagePlus className="h-5 w-5" />
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
              (!image &&
              !content?.trim())
            }
          >
            {createPostMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>

      {createPostMutation.isError && (
        <p className="mt-2 text-sm text-destructive">
          Unable to create post. Please try again.
        </p>
      )}
    </form>
  );
}
