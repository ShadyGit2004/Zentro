export default function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
