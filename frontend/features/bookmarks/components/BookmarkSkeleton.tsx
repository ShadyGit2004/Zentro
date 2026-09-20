export default function BookmarkSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border p-5">
          <div className="mb-3 h-4 w-32 rounded bg-muted" />
          <div className="mb-2 h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
