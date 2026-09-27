import { Skeleton } from "@/components/ui/skeleton";

const SubscriptionSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Current Subscription */}
      <div className="rounded-xl border p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-56" />
          </div>

          <Skeleton className="h-9 w-24 rounded-full" />
        </div>

        {/* Usage */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border p-5">
              <div className="space-y-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-xl border">
        <div className="border-b p-5">
          <Skeleton className="h-6 w-40" />
        </div>

        <div className="space-y-4 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>

              <div className="space-y-2 text-right">
                <Skeleton className="ml-auto h-4 w-20" />
                <Skeleton className="ml-auto h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-5">
          <Skeleton className="mx-auto h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSkeleton;
