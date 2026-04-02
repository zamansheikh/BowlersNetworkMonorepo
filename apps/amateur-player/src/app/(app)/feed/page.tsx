"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  TrendingUp,
  UserPlus,
  Hash,
  Flame,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import CreatePost from "@/components/create-post";
import PostCard, { type Post } from "@/components/post-card";

/* -------------------------------------------------------------------------- */
/*  API Config                                                                */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleUnauthorized() {
  localStorage.removeItem("access_token");
  window.location.href = "/signin";
}

/* -------------------------------------------------------------------------- */
/*  Sidebar Data (static for now)                                             */
/* -------------------------------------------------------------------------- */

const MOCK_SUGGESTIONS = [
  {
    id: "s1",
    name: "Jake Torres",
    username: "jtorres",
    initials: "JT",
    color: "#0891b2",
    bio: "League bowler at Sunset Lanes",
  },
  {
    id: "s2",
    name: "Amy Rodriguez",
    username: "amyrodz",
    initials: "AR",
    color: "#7c3aed",
    bio: "Sport shot enthusiast | 215 avg",
  },
];

const MOCK_TRENDING = [
  { id: "t1", tag: "PerfectGame", posts: 342 },
  { id: "t2", tag: "FallLeagues2026", posts: 218 },
  { id: "t3", tag: "StormPhaseV", posts: 156 },
];

/* -------------------------------------------------------------------------- */
/*  Skeleton Loader                                                           */
/* -------------------------------------------------------------------------- */

function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-surface-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-surface-secondary" />
          <div className="h-3 w-24 rounded bg-surface-secondary" />
        </div>
      </div>
      {/* Content */}
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-surface-secondary" />
        <div className="h-3 w-full rounded bg-surface-secondary" />
        <div className="h-3 w-3/4 rounded bg-surface-secondary" />
      </div>
      {/* Actions */}
      <div className="mt-4 flex items-center gap-4">
        <div className="h-8 w-16 rounded-lg bg-surface-secondary" />
        <div className="h-8 w-16 rounded-lg bg-surface-secondary" />
        <div className="h-8 w-16 rounded-lg bg-surface-secondary" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  /* ---- Fetch feed ---- */
  const fetchFeed = useCallback(
    async (opts: { refresh?: boolean } = {}) => {
      const { refresh = false } = opts;

      if (loadingRef.current) return;
      loadingRef.current = true;

      if (refresh) {
        setIsRefreshing(true);
      } else if (posts.length === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      try {
        const params = new URLSearchParams({ page_size: "20" });
        if (!refresh && cursor) {
          params.set("cursor", cursor);
        }

        const res = await fetch(
          `${BASE_URL}/api/newsfeed/feed?${params.toString()}`,
          { headers: getAuthHeaders() }
        );

        if (res.status === 401) return handleUnauthorized();

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.detail ?? data?.message ?? "Failed to load feed"
          );
        }

        const data = await res.json();
        const newPosts: Post[] = data.posts ?? data.results ?? [];

        if (refresh) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => {
            /* Deduplicate by id */
            const existingIds = new Set(prev.map((p) => p.id));
            const unique = newPosts.filter(
              (p) => !existingIds.has(p.id)
            );
            return [...prev, ...unique];
          });
        }

        /* Update cursor for next page */
        if (newPosts.length > 0) {
          setCursor(newPosts[newPosts.length - 1].id);
        }
        if (newPosts.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
        loadingRef.current = false;
      }
    },
    [cursor, posts.length]
  );

  /* ---- Initial load ---- */
  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Infinite scroll via IntersectionObserver ---- */
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingRef.current
        ) {
          fetchFeed();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchFeed, hasMore]);

  /* ---- Refresh ---- */
  function handleRefresh() {
    setCursor(null);
    setHasMore(true);
    fetchFeed({ refresh: true });
  }

  /* ---- Post created callback ---- */
  function handlePostCreated() {
    setCursor(null);
    setHasMore(true);
    fetchFeed({ refresh: true });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex gap-6">
        {/* ================================================================= */}
        {/*  Main Feed Column                                                 */}
        {/* ================================================================= */}
        <main className="min-w-0 flex-1 space-y-4">
          {/* Create Post Composer */}
          <CreatePost onPostCreated={handlePostCreated} />

          {/* Refresh bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary">
              Your Feed
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* ---- Loading skeletons (initial load) ---- */}
          {isLoading && (
            <div className="space-y-4">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          )}

          {/* ---- Error state ---- */}
          {!isLoading && error && posts.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface px-6 py-12 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                <AlertCircle className="h-7 w-7 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Something went wrong
                </h3>
                <p className="mt-1 text-sm text-text-muted">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-dark"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ---- Empty state ---- */}
          {!isLoading && !error && posts.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface px-6 py-12 text-center shadow-sm">
              <div className="text-5xl">&#127923;</div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  No posts yet
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  Follow some bowlers or create your first post to get
                  your feed started!
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="rounded-lg border border-brand px-5 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-text-inverse"
              >
                Refresh Feed
              </button>
            </div>
          )}

          {/* ---- Feed Posts ---- */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* ---- Inline error (when loading more fails) ---- */}
          {error && posts.length > 0 && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted shadow-sm">
              <AlertCircle className="h-4 w-4 text-error" />
              <span>Failed to load more posts.</span>
              <button
                onClick={() => fetchFeed()}
                className="font-medium text-brand hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* ---- Loading more spinner ---- */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          )}

          {/* ---- Infinite scroll sentinel ---- */}
          {hasMore && !isLoading && (
            <div ref={sentinelRef} className="h-1" />
          )}

          {/* ---- End of feed ---- */}
          {!hasMore && posts.length > 0 && (
            <div className="py-8 text-center text-sm text-text-muted">
              You&apos;re all caught up! Check back later for new
              posts.
            </div>
          )}
        </main>

        {/* ================================================================= */}
        {/*  Right Sidebar                                                    */}
        {/* ================================================================= */}
        <aside className="hidden w-80 shrink-0 space-y-4 lg:block">
          {/* ---- Who to Follow ---- */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <UserPlus className="h-4 w-4 text-brand" />
              Who to Follow
            </h3>
            <div className="space-y-3">
              {MOCK_SUGGESTIONS.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-text-inverse"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text-primary">
                      {user.name}
                    </div>
                    <div className="truncate text-xs text-text-muted">
                      {user.bio}
                    </div>
                  </div>
                  <button className="shrink-0 rounded-full border border-brand px-3 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-text-inverse">
                    Follow
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-3 text-sm font-medium text-brand-dark hover:underline">
              Show more
            </button>
          </div>

          {/* ---- Trending Topics ---- */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <TrendingUp className="h-4 w-4 text-fire" />
              Trending Topics
            </h3>
            <div className="space-y-3">
              {MOCK_TRENDING.map((topic, i) => (
                <button
                  key={topic.id}
                  className="flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-secondary"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
                    {i === 0 ? (
                      <Flame className="h-4 w-4 text-fire" />
                    ) : (
                      <Hash className="h-4 w-4 text-text-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-primary">
                      #{topic.tag}
                    </div>
                    <div className="text-xs text-text-muted">
                      {topic.posts} posts
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button className="mt-3 text-sm font-medium text-brand-dark hover:underline">
              Show more
            </button>
          </div>

          {/* ---- Footer links ---- */}
          <div className="px-2 text-xs text-text-muted">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <a href="#" className="hover:underline">
                About
              </a>
              <a href="#" className="hover:underline">
                Help
              </a>
              <a href="#" className="hover:underline">
                Privacy
              </a>
              <a href="#" className="hover:underline">
                Terms
              </a>
            </div>
            <p className="mt-2">&copy; 2026 BowlersNetwork, Inc.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
