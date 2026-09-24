import Link from "next/link";

import { HashtagSearchResult as HashtagSearchResultType} from "@/features/hashtags/types";

interface HashtagSearchResultProps {
  hashtag: HashtagSearchResultType;
}

export default function HashtagSearchResult({
  hashtag,
}: HashtagSearchResultProps) {
  return (
    <Link
      href={`/hashtags/${encodeURIComponent(hashtag.name)}`}
      className="block rounded-xl p-3 transition hover:bg-muted"
    >
      <p className="font-medium">#{hashtag.name}</p>

      <p className="text-sm text-muted-foreground">
        {hashtag.postsCount} {hashtag.postsCount === 1 ? "post" : "posts"}
      </p>
    </Link>
  );
}
