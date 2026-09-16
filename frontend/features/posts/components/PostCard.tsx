"use client";

import { useState } from "react";
import { Pencil, Heart, MessageCircle, Trash2 } from "lucide-react";
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
import { useUpdatePost, useDeletePost } from "../hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";
import type { FeedPost } from "@/features/feed/types";

interface PostCardProps {
  post: FeedPost;
}

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const { user } = useAuth();
  const isOwner = user?._id === post.author._id;
  const isLiked = user?._id === post.author._id;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(post?.content);

  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

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

  const handleUpdate = () => {
    const content = editContent.trim();

    if (!content) {
      toast.error("Post cannot be empty.");
      return;
    }

    updatePostMutation.mutate(
      {
        postId: post._id,
        payload: {
          content,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
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
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
          {post.author.profileImage ? (
            <img
              src={post.author.profileImage.url}
              alt={post.author.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold">
              {post.author.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Author */}
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-semibold">{post.author.displayName}</span>

            <span className="text-sm text-muted-foreground">
              @{post.author.username}
            </span>

            <span className="text-sm text-muted-foreground">
              · {formattedDate}
            </span>

            <div className="ml-auto flex gap-3 text-sm">
              {isOwner && (
                <div className="ml-auto flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditContent(post.content);
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
              className="flex items-center gap-2 text-sm transition-colors hover:text-foreground"
            >
              <Heart className="h-4 w-4" />
              <span>{post.likesCount}</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 text-sm transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
          </DialogHeader>

          <Textarea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            maxLength={280}
            spellCheck={true}
            rows={5}
          />

          <div className="text-right text-xs text-muted-foreground">
            {editContent?.length}/280
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={updatePostMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleUpdate}
              disabled={updatePostMutation.isPending}
            >
              {updatePostMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
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
