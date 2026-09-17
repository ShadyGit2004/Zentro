"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/features/auth/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";

import { useComments, useCreateComment, useDeleteComment } from "../hooks";

import { createCommentSchema, type CreateCommentFormData } from "../schema";

import CommentsSkeleton from "./CommentsSkeleton";

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const { user } = useAuth();

  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  const form = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: "",
    },
  });

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useComments(postId);

  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();

  const comments = data?.pages.flatMap((page) => page.data) ?? [];

  const handleCreateComment = (values: CreateCommentFormData) => {
    createCommentMutation.mutate(
      {
        postId,
        content: values.content.trim(),
      },
      {
        onSuccess: () => {
          form.reset();
          toast.success("Comment added.");
        },
        onError: (error) => {
          toast.error(
            getApiErrorMessage(
              error,
              "Unable to add comment. Please try again."
            )
          );
        },
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setDeletingCommentId(commentId);

    deleteCommentMutation.mutate(
      {
        postId,
        commentId,
      },
      {
        onSuccess: () => {
          toast.success("Comment deleted.");
        },
        onError: (error) => {
          toast.error(
            getApiErrorMessage(
              error,
              "Unable to delete comment. Please try again."
            )
          );
        },
        onSettled: () => {
          setDeletingCommentId(null);
        },
      }
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Comments list */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">
        {isLoading && <CommentsSkeleton />}

        {isError && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Unable to load comments. Please try again.
          </div>
        )}

        {!isLoading && !isError && comments.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No comments yet.
          </div>
        )}

        {!isLoading && !isError && comments.length > 0 && (
          <div>
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="flex gap-3 border-b px-4 py-4 last:border-b-0"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={comment.author.profileImage} />

                  <AvatarFallback>
                    {comment.author.displayName?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {comment.author.displayName}
                    </span>

                    <span className="truncate text-xs text-muted-foreground">
                      @{comment.author.username}
                    </span>
                  </div>

                  <p className="mt-1 break-words text-sm">{comment.content}</p>

                  {user?.id === comment.author._id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 px-2 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteComment(comment._id)}
                      disabled={deletingCommentId === comment._id}
                    >
                      {deletingCommentId === comment._id ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                      )}
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {hasNextPage && (
              <div className="flex justify-center px-4 py-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment input - fixed */}
      <form
        onSubmit={form.handleSubmit(handleCreateComment)}
        className="shrink-0 border-t p-4"
      >
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user?.profileImage} />

            <AvatarFallback>
              {user?.displayName?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex gap-2">
              <Input
                {...form.register("content")}
                placeholder="Write a comment..."
                maxLength={500}
                disabled={createCommentMutation.isPending}
              />

              <Button
                type="submit"
                size="icon"
                disabled={createCommentMutation.isPending}
                aria-label="Add comment"
              >
                {createCommentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="mt-1 flex items-center justify-between">
              {form.formState.errors.content && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.content.message}
                </p>
              )}

              <span className="ml-auto text-xs text-muted-foreground">
                {form.watch("content")?.length ?? 0}/500
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
