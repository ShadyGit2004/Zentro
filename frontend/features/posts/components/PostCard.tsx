"use client";

import Link from "next/link";
import { memo,  useState } from "react";
import { Pencil, Heart, MessageCircle, Trash2, ImagePlus, X, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useUpdatePost,
  useDeletePost,
  useLikePost,
  useUnlikePost,
} from "../hooks";
import { useBookmarkPost, useUnbookmarkPost } from "@/features/bookmarks/hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";
import type { FeedPost } from "@/features/feed/types";
import Comments from "@/features/comments/components/Comments";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updatePostSchema, type UpdatePostFormData } from "../schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostCardProps {
  post: FeedPost;
}

function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const editForm = useForm<UpdatePostFormData>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      content: post.content,
    },
  });

  const { user } = useAuth();
  const isOwner = user?.id === post.author._id;

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();

  const bookmarkMutation = useBookmarkPost();
  const unbookmarkMutation = useUnbookmarkPost();

  const handleBookmark = () => {
    if (post.isBookmarked) {
      unbookmarkMutation.mutate(post._id, {
        onError: (error) => {
          toast.error(
            getApiErrorMessage(
              error,
              "Unable to remove bookmark. Please try again."
            )
          );
        },
      });

      return;
    }

    bookmarkMutation.mutate(post._id, {
      onError: (error) => {
        toast.error(
          getApiErrorMessage(error, "Unable to bookmark post. Please try again.")
        );
      },
    });
  };

  const handleLike = () => {
    const mutation = post.isLiked ? unlikeMutation : likeMutation;

    mutation.mutate(post._id, {
      onError: (error) => {
        toast.error(
          getApiErrorMessage(
            error,
            post.isLiked
              ? "Unable to unlike post. Please try again."
              : "Unable to like post. Please try again."
          )
        );
      },
    });
  };

  const handleDelete = () => {
    deletePostMutation.mutate(post._id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        toast.success("Post deleted successfully.");
      },
      onError: (error) => {
        toast.error(
          getApiErrorMessage(error, "Unable to delete post. Please try again.")
        );
      },
    });
  };

  const [editImage, setEditImage] = useState<File | undefined>();
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const handleEditImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {    
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

    if (editImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }   

    setEditImage(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleUpdate = (values: UpdatePostFormData) => {
    if (values.content.trim() === "" && !editImage){
      return;
    }
      updatePostMutation.mutate(
        {
          postId: post._id,
          payload: {
            content: values.content.trim(),
            image: editImage,
          },
        },
        {
          onSuccess: () => {
            setIsEditOpen(false);
            setEditImage(undefined);
            setEditImagePreview(null);
            toast.success("Post updated successfully.");
          },
          onError: (error) => {
            toast.error(
              getApiErrorMessage(
                error,
                "Unable to update post. Please try again."
              )
            );
          },
        }
      );
  };

  return (
    <article className="border-b px-4 py-5">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          {/* Author */}
          <div className="flex flex-wrap gap-x-2">
            {/* Avatar */}
            <Link
              href={`/profile/${post.author._id}`}
              className="group flex items-center gap-3"
            >
              <Avatar>
                <AvatarImage
                  src={post.author.profileImage?.url ?? undefined}
                  alt={post.author.displayName}
                />
                <AvatarFallback>
                  {post.author.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate font-semibold group-hover:underline">
                  {post.author.displayName}{" "}
                  <span className="text-xs text-muted-foreground">
                    · {formattedDate}
                  </span>
                </p>

                <p className="truncate text-sm text-muted-foreground">
                  @{post.author.username}
                </p>
              </div>
            </Link>

            <div className="ml-auto flex gap-3 text-sm">
              {isOwner && (
                <div className="ml-auto flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      editForm.reset({
                        content: post.content,
                      });

                      setEditImage(undefined);
                      setEditImagePreview(post.media?.url ?? null);
                      setIsEditOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
            {post.content}
          </p>

          {/* Media */}
          {post.media?.url && (
            <div className="mt-3 overflow-hidden rounded-xl border">
              <img
                src={post.media.url}
                alt="Post media"
                className="max-h-[500px] w-full object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-6 text-muted-foreground">
            <button
              type="button"
              onClick={handleLike}
              disabled={likeMutation.isPending || unlikeMutation.isPending}
              className={`flex items-center gap-2 text-sm transition-colors ${
                post.isLiked
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={post.isLiked ? "Unlike post" : "Like post"}
            >
              <Heart
                className="h-4 w-4"
                fill={post.isLiked ? "currentColor" : "none"}
              />
              <span>{post.likesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </button>

            <button
              type="button"
              onClick={handleBookmark}
              disabled={
                bookmarkMutation.isPending || unbookmarkMutation.isPending
              }
              className={`ml-auto flex items-center gap-2 text-sm transition-colors ${
                post.isBookmarked
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {post.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" fill="currentColor" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}

              <span>{post.isBookmarked ? "Saved" : "Save"}</span>
            </button> 
          </div>
        </div>
      </div>

      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b px-4 py-4">
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          <Comments postId={post._id} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(handleUpdate)}>
            <Textarea
              {...editForm.register("content")}
              maxLength={280}
              spellCheck={true}
              rows={5}
            />

            <div className="mt-4">
              {editImagePreview && (
                <div className="relative overflow-hidden rounded-xl border">
                  <img
                    src={editImagePreview}
                    alt="Post preview"
                    className="max-h-[300px] w-full object-cover"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => {
                      setEditImage(undefined);
                      setEditImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <small className="mt-2 block text-xs text-muted-foreground">
                You can replace the image, but you can’t remove it completely.
              </small>

              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ImagePlus className="h-4 w-4" />
                Change image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleEditImageChange}
                />
              </label>
            </div>

            <div className="mt-1 flex items-center justify-between">
              {editForm.formState.errors.content && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.content.message}
                </p>
              )}

              <span className="ml-auto text-xs text-muted-foreground">
                {editForm.watch("content")?.length ?? 0}/280
              </span>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={updatePostMutation.isPending}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={updatePostMutation.isPending}>
                {updatePostMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This action cannot be undone. Your post will be permanently deleted.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deletePostMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

export default memo(PostCard);