import { Skeleton } from "@/components/ui/skeleton";

export default function FeedSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, index) => (
        <article key={index} className="border-b px-4 py-5">
          <div className="flex gap-3">
            {/* Avatar */}
            <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-muted" />

            <div className="min-w-0 flex-1">
              {/* Author */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28 bg-muted" />
                <Skeleton className="h-4 w-20 bg-muted" />
              </div>

              {/* Content */}
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-4/5 bg-muted" />
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-6">
                <Skeleton className="h-4 w-12 bg-muted" />
                <Skeleton className="h-4 w-12 bg-muted" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
