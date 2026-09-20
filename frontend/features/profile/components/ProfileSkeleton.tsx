import FeedSkeleton from "@/features/feed/components/FeedSkeleton";

export default function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Profile header */}
      <section className="animate-pulse rounded-2xl border p-5">
        <div className="flex flex-col gap-5 sm:flex-row">
          {/* Avatar */}
          <div className="h-24 w-24 shrink-0 rounded-full bg-muted" />

          <div className="flex-1">
            {/* Name + username */}
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="mt-2 h-4 w-28 rounded bg-muted" />

            {/* Bio */}
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </div>

            {/* Buttons */}
            <div className="mt-5 flex gap-2">
              <div className="h-9 w-28 rounded-md bg-muted" />
              <div className="h-9 w-24 rounded-md bg-muted" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 border-t pt-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-col items-center gap-2">
              <div className="h-5 w-10 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-5 grid grid-cols-3 gap-2 animate-pulse">
        <div className="h-10 rounded-lg bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
      </div>

      {/* Posts / content */}
      <div className="mt-4 space-y-4">
      <FeedSkeleton/>
        {
        // [1, 2, 3].map((item) => (
          // <div key={item} className="animate-pulse rounded-xl border p-5">
          //   {/* Post author */}
          //   <div className="flex items-center gap-3">
          //     <div className="h-10 w-10 rounded-full bg-muted" />

          //     <div className="space-y-2">
          //       <div className="h-4 w-28 rounded bg-muted" />
          //       <div className="h-3 w-20 rounded bg-muted" />
          //     </div>
          //   </div>

          //   {/* Post content */}
          //   <div className="mt-4 space-y-2">
          //     <div className="h-4 w-full rounded bg-muted" />
          //     <div className="h-4 w-4/5 rounded bg-muted" />
          //     <div className="h-4 w-3/5 rounded bg-muted" />
          //   </div>

          //   {/* Post actions */}
          //   <div className="mt-5 flex gap-5">
          //     <div className="h-4 w-12 rounded bg-muted" />
          //     <div className="h-4 w-12 rounded bg-muted" />
          //     <div className="h-4 w-12 rounded bg-muted" />
          //   </div>
          // </div>
        // ))
        } 
      </div>
    </div>
  );
}

export function ProfileListSkeleton() {
  return (
    <div className="animate-pulse divide-y rounded-xl border">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-center gap-3 p-4">
          <div className="h-10 w-10 rounded-full bg-muted" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>

          <div className="h-9 w-20 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function EmptyList({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
      <div className="mb-3 text-muted-foreground">{icon}</div>

      <h2 className="font-semibold">{title}</h2>

      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}