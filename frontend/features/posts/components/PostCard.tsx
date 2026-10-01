"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { memo, useState } from "react";
import {
  Pencil,
  Heart,
  MessageCircle,
  Trash2,
  ImagePlus,
  Music2,
  X,
  Bookmark,
  BookmarkCheck,
  Repeat2,
} from "lucide-react";

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
  useRepostPost,
  useUnrepostPost,
} from "../hooks";
import {
  useBookmarkPost,
  useUnbookmarkPost,
} from "@/features/bookmarks/hooks";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/features/auth/AuthProvider";
import type { FeedPost } from "@/features/feed/types";
import Comments from "@/features/comments/components/Comments";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  updatePostSchema,
  type UpdatePostFormData,
} from "../schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { translatePost } from "../api";

interface PostCardProps {
  post: FeedPost;
}

const TRANSLATION_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "ru", label: "Russian" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
] as const;

const renderPostContent = (content: string | undefined) => {
  if (!content) return;

  const parts = content.split(/(#[A-Za-z0-9_]+)/g);

  return parts.map((part, index) => {
    if (/^#[A-Za-z0-9_]+$/.test(part)) {
      const hashtag = part.slice(1).toLowerCase();

      return (
        <Link
          key={`${part}-${index}`}
          href={`/hashtags/${encodeURIComponent(hashtag)}`}
          className="font-medium text-primary hover:underline"
        >
          {part}
        </Link>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

function PostCard({ post }: PostCardProps) {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");
  const tComments = useTranslations("comments");

  const formattedDate = new Date(post.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

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

  const [translatedPosts, setTranslatedPosts] = useState<Record<string, string>>({});
  const [translationLanguage, setTranslationLanguage] = useState("hi");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginalPost, setShowOriginalPost] = useState(false);

  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();

  const bookmarkMutation = useBookmarkPost();
  const unbookmarkMutation = useUnbookmarkPost();

  const repostMutation = useRepostPost();
  const unrepostMutation = useUnrepostPost();

  const [editImage, setEditImage] = useState<File | undefined>();
  const [editImagePreview, setEditImagePreview] = useState<string | null>(
    null
  );

  const [editAudio, setEditAudio] = useState<File | undefined>();
  const [editAudioPreview, setEditAudioPreview] = useState<string | null>(
    null
  );

  const revokeBlobUrl = (url: string | null) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const resetEditMedia = () => {
    revokeBlobUrl(editImagePreview);
    revokeBlobUrl(editAudioPreview);

    setEditImage(undefined);
    setEditImagePreview(null);
    setEditAudio(undefined);
    setEditAudioPreview(null);
  };

  const handleBookmark = () => {
    if (post.isBookmarked) {
      unbookmarkMutation.mutate(post._id, {
        onError: (error) => {
          toast.error(
            getApiErrorMessage(
              error,
              t("unableToRemoveBookmark")
            )
          );
        },
      });

      return;
    }

    bookmarkMutation.mutate(post._id, {
      onError: (error) => {
        toast.error(
          getApiErrorMessage(error, t("unableToBookmark"))
        );
      },
    });
  };

  const handleLike = () => {
    const mutation = post.isLiked
      ? unlikeMutation
      : likeMutation;

    mutation.mutate(post._id, {
      onError: (error) => {
        toast.error(
          getApiErrorMessage(
            error,
            post.isLiked
              ? t("unableToUnlikePost")
              : t("unableToLikePost")
          )
        );
      },
    });
  };

  const handleDelete = () => {
    deletePostMutation.mutate(post._id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        toast.success(t("postDeleted"));
      },
      onError: (error) => {
        toast.error(
          getApiErrorMessage(
            error,
            t("unableToDeletePost")
          )
        );
      },
    });
  };

  const handleRepost = () => {
    const mutation = post.isReposted
      ? unrepostMutation
      : repostMutation;

    mutation.mutate(post._id, {
      onError: (error) => {
        toast.error(
          getApiErrorMessage(
            error,
            post.isReposted
              ? t("unableToRemoveRepost")
              : t("unableToRepost")
          )
        );
      },
    });
  };

  const handleTranslatePost = async () => {
    if (!post.content?.trim()) {
      toast.error(t("noTextToTranslate"));
      return;
    }

    // Translation already exists for this language.
    if (translatedPosts[translationLanguage]) {
      setShowOriginalPost(false);
      return;
    }

    setIsTranslating(true);

    try {
      const response = await translatePost(post._id, translationLanguage);

      setTranslatedPosts((current) => ({
        ...current,
        [translationLanguage]: response.data.translatedText,
      }));

      setShowOriginalPost(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("unableToTranslate")));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleEditImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    const fileTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!file) return;

    if (!fileTypes.includes(file.type)) {
      toast.error(t("imageFormatError"));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageSizeError"));
      event.target.value = "";
      return;
    }

    revokeBlobUrl(editImagePreview);
    revokeBlobUrl(editAudioPreview);

    setEditImage(file);
    setEditImagePreview(URL.createObjectURL(file));

    // Image and audio cannot exist together.
    setEditAudio(undefined);
    setEditAudioPreview(null);
  };

  const handleEditAudioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    const fileTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp4",
      "audio/webm",
    ];

    if (!file) return;

    if (!fileTypes.includes(file.type)) {
      toast.error(t("audioFormatError"));
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("audioSizeError"));
      event.target.value = "";
      return;
    }

    revokeBlobUrl(editAudioPreview);
    revokeBlobUrl(editImagePreview);

    setEditAudio(file);
    setEditAudioPreview(URL.createObjectURL(file));

    // Image and audio cannot exist together.
    setEditImage(undefined);
    setEditImagePreview(null);
  };

  const handleUpdate = (values: UpdatePostFormData) => {
    if (
      !values.content.trim() &&
      !editImage &&
      !editAudio
    ) {
      return;
    }

    updatePostMutation.mutate(
      {
        postId: post._id,
        payload: {
          content: values.content.trim(),
          image: editImage,
          audio: editAudio,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          resetEditMedia();

          toast.success(t("postUpdated"));
        },
        onError: (error) => {
          toast.error(
            getApiErrorMessage(
              error,
              t("unableToUpdatePost")
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

                      resetEditMedia();

                      // Show existing media according to its type.
                      if (post.media?.type === "audio") {
                        setEditAudioPreview(post.media.url);
                      } else if (post.media?.type === "image") {
                        setEditImagePreview(post.media.url);
                      }

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
            {showOriginalPost
              ? renderPostContent(post.content)
              : translatedPosts[translationLanguage] ??
                renderPostContent(post.content)}
          </p>

          {post.content?.trim() && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={translationLanguage}
                onChange={(event) => {
                  setTranslationLanguage(event.target.value);
                  setShowOriginalPost(false);
                }}
                disabled={isTranslating}
                className="h-8 rounded-md border bg-background px-2 text-xs"
                aria-label={t("translationLanguage")}
              >
                {TRANSLATION_LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  if (translatedPosts[translationLanguage]) {
                    setShowOriginalPost((current) => !current);
                    return;
                  }

                  handleTranslatePost();
                }}
                disabled={isTranslating}
              >
                {isTranslating
                  ? t("translating")
                  : translatedPosts[translationLanguage] && !showOriginalPost
                  ? t("showOriginal")
                  : t("translate")}
              </Button>
            </div>
          )}

          {/* Media */}
          {post.media?.url && (
            <div className="mt-3 overflow-hidden rounded-xl border">
              {post.media.type === "audio" ? (
                <div className="p-3">
                  <audio
                    controls
                    preload="metadata"
                    src={post.media.url}
                    className="w-full"
                    aria-label={t("selectedAudioPreview")}
                  />
                </div>
              ) : (
                <img
                  src={post.media.url}
                  alt={t("postMedia")}
                  className="max-h-[500px] w-full object-cover"
                />
              )}
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
              aria-label={post.isLiked ? t("unlikePost") : t("likePost")}
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
              onClick={handleRepost}
              disabled={repostMutation.isPending || unrepostMutation.isPending}
              className={`flex items-center gap-2 text-sm transition-colors ${
                post.isReposted
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={post.isReposted ? t("removeRepost") : t("repost")}
            >
              <Repeat2 className="h-4 w-4" />
              <span>{post.repostsCount}</span>
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

              <span>{post.isBookmarked ? t("save") : t("unsave")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b px-4 py-4">
            <DialogTitle>{tComments("title")}</DialogTitle>
          </DialogHeader>

          <Comments postId={post._id} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);

          if (!open) {
            resetEditMedia();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editPost")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(handleUpdate)}>
            <Textarea
              {...editForm.register("content")}
              maxLength={280}
              spellCheck={true}
              rows={5}
            />

            <div className="mt-4">
              {/* Image Preview */}
              {editImagePreview && (
                <div className="relative overflow-hidden rounded-xl border">
                  <img
                    src={editImagePreview}
                    alt={t("selectedImagePreview")}
                    className="max-h-[300px] w-full object-cover"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => {
                      revokeBlobUrl(editImagePreview);
                      setEditImage(undefined);
                      setEditImagePreview(null);
                    }}
                    aria-label={t("removeImage")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Audio Preview */}
              {editAudioPreview && (
                <div className="relative rounded-xl border p-3">
                  <audio
                    controls
                    preload="metadata"
                    src={editAudioPreview}
                    className="w-full"
                    aria-label={t("selectedAudioPreview")}
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => {
                      revokeBlobUrl(editAudioPreview);
                      setEditAudio(undefined);
                      setEditAudioPreview(null);
                    }}
                    aria-label={t("removeAudio")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <small className="mt-2 block text-xs text-muted-foreground">
                {t("replaceMedia")}
              </small>

              <div className="mt-3 flex flex-wrap gap-3">
                {/* Change Image */}
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ImagePlus className="h-4 w-4" />
                  {t("changeImage")}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleEditImageChange}
                  />
                </label>

                {/* Change Audio */}
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Music2 className="h-4 w-4" />
                  {t("addAudio")}

                  <input
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm"
                    className="hidden"
                    onChange={handleEditAudioChange}
                  />
                </label>
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between">
              {editForm.formState.errors.content && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.content.message}
                </p>
              )}

              <span className="ml-auto text-xs text-muted-foreground">
                {editForm.watch("content")?.length ?? 0}
                /280
              </span>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={updatePostMutation.isPending}
              >
                {tCommon("cancel")}
              </Button>

              <Button type="submit" disabled={updatePostMutation.isPending}>
                {updatePostMutation.isPending
                  ? tCommon("updating")
                  : tCommon("update")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deletePost")}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">{t("deletePostDesc")}</p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deletePostMutation.isPending}
            >
              {tCommon("cancel")}
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending
                ? tCommon("deleting")
                : tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

export default memo(PostCard);