import AppShell from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";

const SettingSkeleton = () => {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {/* Profile */}
      <div className="rounded-xl border p-5">
        <div className="mb-5 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full" />

          <div className="w-full space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border p-5">
        <div className="mb-5 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 border-b py-4 last:border-b-0"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>

            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        ))}
      </div>

      {/* Subscription */}
      <div className="rounded-xl border p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>

          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border p-5">
        <div className="mb-5 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
    </AppShell>
  );
};

export default SettingSkeleton;
