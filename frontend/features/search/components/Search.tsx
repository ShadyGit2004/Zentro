"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

import { useSearchHashtags } from "@/features/hashtags/hooks";

import { Input } from "@/components/ui/input";
import { useSearchPosts, useSearchUsers } from "../hooks";
import UserSearchResult from "./UserSearchResult";
import PostSearchResult from "./PostSearchResult";
import SearchSkeleton from "./SearchSkeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import HashtagSearchResult from "./HashtagSearchResult";

type SearchTab = "users" | "posts";

export default function Search() {

  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("users");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(input.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [input]);

  const isUsersTab = activeTab === "users";

  // Only active tab query is enabled
  const isHashtagSearch = input.trim().startsWith("#");
  const usersQuery = useSearchUsers(query, isUsersTab && !isHashtagSearch);
  const postsQuery = useSearchPosts(query, !isUsersTab && !isHashtagSearch);
  const hashtagQuery = useSearchHashtags(isHashtagSearch ? query : "");

  const users = usersQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const posts = postsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const activeQuery = isUsersTab ? usersQuery : postsQuery;

  const results = isUsersTab ? users : posts;

  const isSearching = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const hasResults = results.length > 0;

  const loadMore = () => {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold">Search</h1>
      </div>

      {/* Search input */}
      <div className="relative">
        <SearchIcon
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />

        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search users, posts or #hashtags..."
          aria-label="Search users, posts or #hashtags"
          className="h-11 rounded-xl pl-9"
        />
      </div>

      {/* Tabs */}
      {query.length >= 2 && !isHashtagSearch && (
        <div
          className="mt-4 grid grid-cols-2 rounded-xl bg-muted p-1"
          role="tablist"
          aria-label="Search results"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isUsersTab}
            onClick={() => setActiveTab("users")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              isUsersTab ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Users
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={!isUsersTab}
            onClick={() => setActiveTab("posts")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              !isUsersTab ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Posts
          </button>
        </div>
      )}

      {/* Results */}
      {isHashtagSearch ? (
        <div className="mt-4">
          {hashtagQuery.isLoading && <SearchSkeleton />}

          {!hashtagQuery.isLoading && hashtagQuery.isError && (
            <p className="py-8 text-center text-sm text-destructive">
              {getApiErrorMessage(
                hashtagQuery.error,
                "Something went wrong while searching hashtags."
              )}
            </p>
          )}

          {!hashtagQuery.isLoading &&
            !hashtagQuery.isError &&
            hashtagQuery.data?.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hashtags found.
              </p>
            )}

          {!hashtagQuery.isLoading &&
            !hashtagQuery.isError &&
            hashtagQuery.data &&
            hashtagQuery.data.length > 0 &&
            hashtagQuery.data.map((hashtag) => (               
              <HashtagSearchResult key={hashtag._id} hashtag={hashtag} />
            ))}
        </div>
      ) : (
      <div className="mt-4">
        {/* Initial state */}
        {query.length < 2 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Search for users or posts.
          </p>
        )}

        {/* Loading */}
        {query.length >= 2 && isSearching && <SearchSkeleton />}

        {/* Error */}
        {query.length >= 2 && !isSearching && isError && (
          <p className="py-8 text-center text-sm text-destructive">
            {getApiErrorMessage(activeQuery.error, "Something went wrong while searching."
            )}
          </p>
        )}

        {/* Empty */}
        {query.length >= 2 && !isSearching && !isError && !hasResults && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {isUsersTab ? "users" : "posts"} found.
          </p>
        )}

        {/* User results */}
        {isUsersTab && users.length > 0 && (
          <div className="space-y-1">
            {users.map((user) => (
              <UserSearchResult key={user._id} user={user} />
            ))}
          </div>
        )}

        {/* Post results */}
        {!isUsersTab && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostSearchResult key={post._id} post={post} />
            ))}
          </div>
        )}

        {/* Load more */}
        {query.length >= 2 && activeQuery.hasNextPage && (
          <button
            type="button"
            onClick={loadMore}
            disabled={activeQuery.isFetchingNextPage}
            className="mt-4 w-full rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeQuery.isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
      )}
    </div>
  );
}
