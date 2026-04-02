"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Info,
  FileText,
  BarChart3,
  CreditCard,
  Image as ImageIcon,
  Hand,
  Home,
  User,
  Calendar,
  Heart,
  Loader2,
  Inbox,
} from "lucide-react";
import type { ProfileData } from "./profile-header";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type TabKey = "info" | "posts" | "stats" | "cards" | "media";

interface ProfileTabsProps {
  profile: ProfileData;
  isOwn: boolean;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

interface PostItem {
  id: number | string;
  content?: string;
  caption?: string;
  text?: string;
  created_at?: string;
  timestamp?: string;
  media_url?: string | null;
  image_url?: string | null;
  author_name?: string;
  author_username?: string;
  reactions_count?: number;
  comments_count?: number;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

const TABS: { key: TabKey; label: string; icon: typeof Info }[] = [
  { key: "info", label: "Info", icon: Info },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "stats", label: "Stats", icon: BarChart3 },
  { key: "cards", label: "Cards", icon: CreditCard },
  { key: "media", label: "Media", icon: ImageIcon },
];

/* -------------------------------------------------------------------------- */
/*  Tab Bar                                                                    */
/* -------------------------------------------------------------------------- */

function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <div className="overflow-x-auto border-b border-border bg-surface">
      <div className="flex min-w-max">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={[
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6",
                isActive
                  ? "text-brand"
                  : "text-text-muted hover:text-text-secondary",
              ].join(" ")}
            >
              <Icon size={16} />
              {label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-brand" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Info Tab                                                                   */
/* -------------------------------------------------------------------------- */

function InfoTab({
  profile,
  isOwn,
}: {
  profile: ProfileData;
  isOwn: boolean;
}) {
  const show = (field: { is_public: boolean; is_added?: boolean }) =>
    isOwn || field.is_public;

  const items: { icon: typeof User; label: string; value: string }[] = [];

  if (profile.bio.is_added && show(profile.bio)) {
    items.push({ icon: User, label: "Bio", value: profile.bio.content });
  }

  if (profile.nickname.is_added && show(profile.nickname)) {
    items.push({ icon: Heart, label: "Nickname", value: profile.nickname.name });
  }

  if (show(profile.ball_handling_style)) {
    items.push({
      icon: Hand,
      label: "Bowling Style",
      value: profile.ball_handling_style.description,
    });
    if (profile.ball_handling_style.handedness) {
      items.push({
        icon: Hand,
        label: "Handedness",
        value: profile.ball_handling_style.handedness,
      });
    }
    if (profile.ball_handling_style.ball_carry) {
      items.push({
        icon: Hand,
        label: "Ball Carry",
        value: profile.ball_handling_style.ball_carry,
      });
    }
    if (profile.ball_handling_style.grip) {
      items.push({
        icon: Hand,
        label: "Grip",
        value: profile.ball_handling_style.grip,
      });
    }
  }

  if (profile.home_center.is_added && show(profile.home_center)) {
    items.push({
      icon: Home,
      label: "Home Center",
      value: profile.home_center.center_name,
    });
  }

  if (profile.gender.is_added && show(profile.gender)) {
    items.push({ icon: User, label: "Gender", value: profile.gender.value });
  }

  if (profile.birthdate.is_added && show(profile.birthdate)) {
    items.push({
      icon: Calendar,
      label: "Age",
      value: `${profile.birthdate.age} years old`,
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Info className="mb-3 h-10 w-10 text-text-muted" />
        <p className="text-sm text-text-muted">
          {isOwn
            ? "Add details to your profile so others can learn more about you."
            : "This user hasn't shared any details yet."}
        </p>
        {isOwn && (
          <Link
            href="/settings"
            className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-dark"
          >
            Edit Profile
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={`${item.label}-${i}`}
            className="rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-sm"
          >
            <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-text-muted">
              <Icon size={14} />
              {item.label}
            </div>
            <p className="text-sm text-text-primary">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Posts Tab                                                                   */
/* -------------------------------------------------------------------------- */

function PostsTab({
  profile,
  isOwn,
}: {
  profile: ProfileData;
  isOwn: boolean;
}) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchedRef = useRef(false);

  const fetchPosts = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const token = localStorage.getItem("access_token");
        const endpoint = isOwn
          ? `/api/newsfeed/my-posts?page=${pageNum}&page_size=10`
          : `/api/newsfeed/users/${profile.user.id}/posts?page=${pageNum}&page_size=10`;

        const res = await fetch(`${BASE_URL}${endpoint}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        const items: PostItem[] = Array.isArray(data)
          ? data
          : data.results ?? data.data ?? [];

        if (items.length < 10) setHasMore(false);

        if (append) {
          setPosts((prev) => [...prev, ...items]);
        } else {
          setPosts(items);
        }
      } catch {
        setError("Could not load posts. Please try again later.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isOwn, profile.user.id],
  );

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchPosts(1);
  }, [fetchPosts]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-border bg-surface p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-surface-tertiary" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-surface-tertiary" />
                <div className="h-2 w-20 rounded bg-surface-tertiary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-surface-tertiary" />
              <div className="h-3 w-3/4 rounded bg-surface-tertiary" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-error">{error}</p>
        <button
          onClick={() => {
            setError("");
            fetchPosts(1);
          }}
          className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="mb-3 h-10 w-10 text-text-muted" />
        <p className="text-sm text-text-muted">
          {isOwn ? "You haven't posted anything yet." : "No posts yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          {/* Author row */}
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-semibold text-text-inverse">
              {(post.author_name ?? profile.user.first_name)?.[0]}
              {(
                post.author_name?.split(" ")[1] ?? profile.user.last_name
              )?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold text-text-primary">
                {post.author_name ??
                  `${profile.user.first_name} ${profile.user.last_name}`}
              </span>
              <span className="ml-1.5 text-xs text-text-muted">
                @{post.author_username ?? profile.user.username}
              </span>
              {(post.created_at ?? post.timestamp) && (
                <span className="ml-1.5 text-xs text-text-muted">
                  &middot; {post.created_at ?? post.timestamp}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">
            {post.content ?? post.caption ?? post.text ?? ""}
          </p>

          {/* Media */}
          {(post.media_url ?? post.image_url) && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border-subtle">
              <img
                src={(post.media_url ?? post.image_url)!}
                alt="Post media"
                className="h-64 w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Engagement stats */}
          {(post.reactions_count || post.comments_count) && (
            <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
              {post.reactions_count != null && post.reactions_count > 0 && (
                <span>{post.reactions_count} reactions</span>
              )}
              {post.comments_count != null && post.comments_count > 0 && (
                <span>{post.comments_count} comments</span>
              )}
            </div>
          )}
        </article>
      ))}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary disabled:opacity-50"
          >
            {loadingMore && <Loader2 size={16} className="animate-spin" />}
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Placeholder Tabs                                                           */
/* -------------------------------------------------------------------------- */

function PlaceholderTab({
  icon: Icon,
  message,
}: {
  icon: typeof BarChart3;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-secondary">
        <Icon className="h-8 w-8 text-text-muted" />
      </div>
      <p className="text-sm font-medium text-text-muted">{message}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ProfileTabs({
  profile,
  isOwn,
  activeTab,
  onTabChange,
}: ProfileTabsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <TabBar active={activeTab} onChange={onTabChange} />

      <div className="p-4 sm:p-6">
        {activeTab === "info" && <InfoTab profile={profile} isOwn={isOwn} />}
        {activeTab === "posts" && (
          <PostsTab profile={profile} isOwn={isOwn} />
        )}
        {activeTab === "stats" && (
          <PlaceholderTab icon={BarChart3} message="Game stats coming soon" />
        )}
        {activeTab === "cards" && (
          <PlaceholderTab
            icon={CreditCard}
            message="Trading cards coming soon"
          />
        )}
        {activeTab === "media" && (
          <PlaceholderTab
            icon={ImageIcon}
            message="Media gallery coming soon"
          />
        )}
      </div>
    </div>
  );
}
