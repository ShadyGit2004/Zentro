// "use client";

// import { Bookmark as BookmarkIcon, Loader2 } from "lucide-react";

// import { useBookmarkedPosts, useUnbookmarkPost } from "../hooks";
// import type { BookmarkedPost } from "../types";

// const Bookmark = () => {
//   const {
//     data,
//     isLoading,
//     isError,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = useBookmarkedPosts();

//   const unbookmarkMutation = useUnbookmarkPost();

//   const posts: BookmarkedPost[] = data?.pages.flatMap((page) => page.data) ?? [];

//   const handleUnbookmark = (postId: string) => {
//     unbookmarkMutation.mutate(postId);
//   };

//   if (isLoading) {
//     return (
//       <div className="space-y-4">
//         {[1, 2, 3].map((item) => (
//           <div key={item} className="animate-pulse rounded-xl border p-5">
//             <div className="mb-3 h-4 w-32 rounded bg-muted" />
//             <div className="mb-2 h-4 w-full rounded bg-muted" />
//             <div className="h-4 w-3/4 rounded bg-muted" />
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="rounded-xl border p-6 text-center">
//         <p className="text-sm text-muted-foreground">
//           Failed to load your bookmarks.
//         </p>
//       </div>
//     );
//   }

//   if (posts.length === 0) {
//     return (
//       <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
//         <BookmarkIcon className="mb-3 h-10 w-10 text-muted-foreground" />

//         <h2 className="text-lg font-semibold">No bookmarks yet</h2>

//         <p className="mt-1 text-sm text-muted-foreground">
//           Posts you bookmark will appear here.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {posts.map((post) => (
//         <article key={post._id} className="rounded-xl border bg-background p-5">
//           {/* Author */}
//           <div className="mb-3 flex items-center gap-3">
//             <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted">
//               {post.author.profileImage?.url ? (
//                 <img
//                   src={post.author.profileImage.url}
//                   alt={post.author.displayName}
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 <span className="text-sm font-medium">
//                   {post.author.displayName.charAt(0).toUpperCase()}
//                 </span>
//               )}
//             </div>

//             <div>
//               <p className="text-sm font-semibold">{post.author.displayName}</p>

//               <p className="text-xs text-muted-foreground">
//                 @{post.author.username}
//               </p>
//             </div>
//           </div>

//           {/* Content */}
//           {post.content && (
//             <p className="whitespace-pre-wrap text-sm">{post.content}</p>
//           )}

//           {/* Media */}
//           {post.media?.url && (
//             <div className="mt-4 overflow-hidden rounded-lg">
//               <img
//                 src={post.media.url}
//                 alt="Post media"
//                 className="max-h-[500px] w-full object-cover"
//               />
//             </div>
//           )}

//           {/* Footer */}
//           <div className="mt-4 flex items-center justify-between border-t pt-3">
//             <div className="flex gap-4 text-sm text-muted-foreground">
//               <span>{post.likesCount} likes</span>
//               <span>{post.commentsCount} comments</span>
//             </div>

//             <button
//               type="button"
//               onClick={() => handleUnbookmark(post._id)}
//               disabled={unbookmarkMutation.isPending}
//               className="flex items-center gap-2 text-sm text-foreground transition-colors hover:text-muted-foreground disabled:opacity-50"
//             >
//               <BookmarkIcon className="h-4 w-4" fill="currentColor" />
//               Remove
//             </button>
//           </div>
//         </article>
//       ))}

//       {/* Load More */}
//       {hasNextPage && (
//         <div className="flex justify-center pt-2">
//           <button
//             type="button"
//             onClick={() => fetchNextPage()}
//             disabled={isFetchingNextPage}
//             className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
//           >
//             {isFetchingNextPage ? (
//               <span className="flex items-center gap-2">
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Loading...
//               </span>
//             ) : (
//               "Load more"
//             )}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Bookmark;

"use client";

import { Bookmark as BookmarkIcon, Loader2 } from "lucide-react";

import PostCard from "@/features/posts/components/PostCard";
import { useBookmarkedPosts } from "../hooks";

const Bookmark = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBookmarkedPosts();

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-xl border p-5"
          >
            <div className="mb-3 h-4 w-32 rounded bg-muted" />
            <div className="mb-2 h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load your bookmarks.
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <BookmarkIcon className="mb-3 h-10 w-10 text-muted-foreground" />

        <h2 className="text-lg font-semibold">
          No bookmarks yet
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Posts you bookmark will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
        />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookmark;
