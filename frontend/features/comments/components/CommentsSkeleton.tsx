import { Skeleton } from "@/components/ui/skeleton";

export default function CommentsSkeleton() {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-3 border-b px-4 py-4">
          {/* Avatar */}
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1">
            {/* Name + username */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* Comment text */}
            <div className="mt-2 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/5" />
            </div>

            {/* Delete button */}
            <Skeleton className="mt-3 h-7 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
