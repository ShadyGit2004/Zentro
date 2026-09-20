export default function NotificationsSkeleton() {
  return (
    <div className="space-y-1">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-xl border p-4 mb-2"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
