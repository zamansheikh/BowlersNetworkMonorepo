"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Heart,
  Target,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Send,
  Loader2,
  ThumbsUp,
  BadgeCheck,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  API Config                                                                */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
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
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface PostAuthor {
  id: string;
  first_name: string;
  username: string;
  profile_picture_url: string | null;
  is_pro: boolean;
}

export interface PostTypeData {
  media_urls?: string[];
  video_url?: string;
  thumbnail_url?: string;
  options?: { id: string; text: string; votes: number }[];
  scores?: { game: number; score: number }[];
  [key: string]: unknown;
}

export interface Post {
  id: string;
  uid: string;
  post_type: "text" | "photo" | "video" | "score" | "poll";
  caption: string;
  audience: "public" | "followers" | "center" | "private";
  author: PostAuthor;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  type_data: PostTypeData | null;
  is_mine: boolean;
  has_reacted: boolean;
  reaction_type: ReactionType | null;
  has_saved: boolean;
  created_at: string;
}

export interface PostComment {
  id: string;
  text: string;
  author: PostAuthor;
  likes_count: number;
  has_liked: boolean;
  created_at: string;
  replies?: PostComment[];
}

export type ReactionType = "like" | "fire" | "strike" | "clap" | "wow";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const AUDIENCE_META: Record<
  Post["audience"],
  { icon: typeof Globe; label: string }
> = {
  public: { icon: Globe, label: "Public" },
  followers: { icon: Users, label: "Followers" },
  center: { icon: Target, label: "Center" },
  private: { icon: Lock, label: "Private" },
};

const REACTION_CONFIG: {
  key: ReactionType;
  emoji: string;
  label: string;
  activeColor: string;
  hoverColor: string;
}[] = [
  {
    key: "like",
    emoji: "\u2764\uFE0F",
    label: "Like",
    activeColor: "text-error",
    hoverColor: "hover:text-error",
  },
  {
    key: "fire",
    emoji: "\uD83D\uDD25",
    label: "Fire",
    activeColor: "text-fire",
    hoverColor: "hover:text-fire",
  },
  {
    key: "strike",
    emoji: "\uD83C\uDFB3",
    label: "Strike",
    activeColor: "text-strike",
    hoverColor: "hover:text-strike",
  },
  {
    key: "clap",
    emoji: "\uD83D\uDC4F",
    label: "Clap",
    activeColor: "text-clap",
    hoverColor: "hover:text-clap",
  },
  {
    key: "wow",
    emoji: "\uD83D\uDE2E",
    label: "Wow",
    activeColor: "text-wow",
    hoverColor: "hover:text-wow",
  },
];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const CONTENT_TRUNCATE_LENGTH = 200;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* Reaction state */
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(
    post.reaction_type ?? null
  );

  /* Save state */
  const [isSaved, setIsSaved] = useState(post.has_saved);

  /* Comments */
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentPosting, setCommentPosting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [sharesCount] = useState(post.shares_count);

  const reactionPickerRef = useRef<HTMLDivElement>(null);

  const isLong = post.caption.length > CONTENT_TRUNCATE_LENGTH;
  const displayContent =
    isLong && !expanded
      ? post.caption.slice(0, CONTENT_TRUNCATE_LENGTH) + "..."
      : post.caption;

  const AudienceIcon = AUDIENCE_META[post.audience]?.icon ?? Globe;

  /* Close reaction picker on outside click */
  useEffect(() => {
    if (!showReactionPicker) return;
    function handleClick(e: MouseEvent) {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target as Node)
      ) {
        setShowReactionPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showReactionPicker]);

  /* ---- API: React ---- */
  const handleReaction = useCallback(
    async (key: ReactionType) => {
      setShowReactionPicker(false);

      const prevReaction = activeReaction;
      const prevCount = likesCount;

      /* Optimistic update */
      if (activeReaction === key) {
        /* Removing reaction */
        setActiveReaction(null);
        setLikesCount((c) => Math.max(0, c - 1));
      } else {
        /* Adding or changing */
        if (!activeReaction) {
          setLikesCount((c) => c + 1);
        }
        setActiveReaction(key);
      }

      try {
        const res = await fetch(
          `${BASE_URL}/api/newsfeed/${post.id}/react`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ reaction_type: key }),
          }
        );
        if (res.status === 401) return handleUnauthorized();
        if (!res.ok) throw new Error("Reaction failed");
      } catch {
        /* Revert on error */
        setActiveReaction(prevReaction);
        setLikesCount(prevCount);
      }
    },
    [activeReaction, likesCount, post.id]
  );

  /* ---- API: Save ---- */
  const handleSave = useCallback(async () => {
    const prevSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      const res = await fetch(
        `${BASE_URL}/api/newsfeed/${post.id}/save`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Save failed");
    } catch {
      setIsSaved(prevSaved);
    }
  }, [isSaved, post.id]);

  /* ---- API: Load Comments ---- */
  const loadComments = useCallback(async () => {
    if (commentsLoaded) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/newsfeed/${post.id}/comments?page=1&page_size=10`,
        { headers: getAuthHeaders() }
      );
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data.comments ?? data.results ?? data ?? []);
      setCommentsLoaded(true);
    } catch {
      /* silently fail */
    } finally {
      setCommentsLoading(false);
    }
  }, [commentsLoaded, post.id]);

  /* ---- API: Post Comment ---- */
  const handlePostComment = useCallback(async () => {
    if (!commentText.trim() || commentPosting) return;
    setCommentPosting(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/newsfeed/${post.id}/comments`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ text: commentText.trim(), parent_id: null }),
        }
      );
      if (res.status === 401) return handleUnauthorized();
      if (!res.ok) throw new Error("Failed to post comment");
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setCommentsCount((c) => c + 1);
      setCommentText("");
    } catch {
      /* silently fail */
    } finally {
      setCommentPosting(false);
    }
  }, [commentText, commentPosting, post.id]);

  /* ---- API: Like Comment ---- */
  const handleLikeComment = useCallback(
    async (commentId: string) => {
      /* Optimistic */
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                has_liked: !c.has_liked,
                likes_count: c.has_liked
                  ? Math.max(0, c.likes_count - 1)
                  : c.likes_count + 1,
              }
            : c
        )
      );

      try {
        const res = await fetch(
          `${BASE_URL}/api/newsfeed/comments/${commentId}/like`,
          { method: "POST", headers: getAuthHeaders() }
        );
        if (res.status === 401) return handleUnauthorized();
        if (!res.ok) throw new Error("Failed to like comment");
      } catch {
        /* Revert */
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  has_liked: !c.has_liked,
                  likes_count: c.has_liked
                    ? Math.max(0, c.likes_count - 1)
                    : c.likes_count + 1,
                }
              : c
          )
        );
      }
    },
    []
  );

  /* Toggle comments panel */
  function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && !commentsLoaded) {
      loadComments();
    }
  }

  /* Active reaction config (for display) */
  const activeReactionConfig = activeReaction
    ? REACTION_CONFIG.find((r) => r.key === activeReaction)
    : null;

  return (
    <article className="bg-surface rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md">
      {/* ---- Header ---- */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        {post.author.profile_picture_url ? (
          <img
            src={post.author.profile_picture_url}
            alt={post.author.first_name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-text-inverse">
            {getInitials(post.author.first_name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-semibold text-text-primary">
              {post.author.first_name}
            </span>
            {post.author.is_pro && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />
            )}
            <span className="truncate text-sm text-text-muted">
              @{post.author.username}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span>{relativeTime(post.created_at)}</span>
            <span>&middot;</span>
            <AudienceIcon className="h-3 w-3" />
            <span>
              {AUDIENCE_META[post.audience]?.label ?? post.audience}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-secondary"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg">
              {["Hide post", "Report"].map((item) => (
                <button
                  key={item}
                  className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-secondary"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- Content ---- */}
      {post.caption && (
        <div className="px-4 pb-2">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">
            {displayContent}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-sm font-medium text-brand-dark hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* ---- Media (photo) ---- */}
      {post.post_type === "photo" &&
        post.type_data?.media_urls &&
        post.type_data.media_urls.length > 0 && (
          <div className="px-4 pb-3">
            <div
              className={`grid gap-1 overflow-hidden rounded-lg border border-border-subtle ${
                post.type_data.media_urls.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-2"
              }`}
            >
              {post.type_data.media_urls
                .slice(0, 4)
                .map((url: string, i: number) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Post media ${i + 1}`}
                    className={`w-full object-cover ${
                      post.type_data!.media_urls!.length === 1
                        ? "max-h-96"
                        : "h-48"
                    }`}
                    loading="lazy"
                  />
                ))}
            </div>
          </div>
        )}

      {/* ---- Media (video) ---- */}
      {post.post_type === "video" && post.type_data?.video_url && (
        <div className="px-4 pb-3">
          <div className="overflow-hidden rounded-lg border border-border-subtle">
            <video
              src={post.type_data.video_url}
              poster={post.type_data.thumbnail_url ?? undefined}
              controls
              className="max-h-96 w-full"
            />
          </div>
        </div>
      )}

      {/* ---- Stats summary ---- */}
      {(likesCount > 0 || commentsCount > 0 || sharesCount > 0) && (
        <div className="flex items-center justify-between px-4 pb-2 text-xs text-text-muted">
          <span>
            {likesCount > 0 &&
              `${formatCount(likesCount)} reaction${likesCount !== 1 ? "s" : ""}`}
          </span>
          <div className="flex gap-3">
            {commentsCount > 0 && (
              <button
                onClick={toggleComments}
                className="hover:text-text-secondary hover:underline"
              >
                {formatCount(commentsCount)} comment
                {commentsCount !== 1 ? "s" : ""}
              </button>
            )}
            {sharesCount > 0 && (
              <span>
                {formatCount(sharesCount)} share
                {sharesCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ---- Divider ---- */}
      <div className="mx-4 border-t border-border" />

      {/* ---- Action bar ---- */}
      <div className="flex items-center justify-between px-2 py-1">
        {/* Reaction button with picker */}
        <div className="flex items-center gap-1">
          <div className="relative" ref={reactionPickerRef}>
            <button
              onClick={() => {
                if (activeReaction) {
                  handleReaction(activeReaction);
                } else {
                  setShowReactionPicker(!showReactionPicker);
                }
              }}
              onMouseEnter={() => setShowReactionPicker(true)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                activeReaction && activeReactionConfig
                  ? `${activeReactionConfig.activeColor} font-medium`
                  : "text-text-muted hover:bg-surface-secondary hover:text-text-secondary"
              }`}
            >
              {activeReactionConfig ? (
                <span className="text-lg leading-none">
                  {activeReactionConfig.emoji}
                </span>
              ) : (
                <Heart className="h-4.5 w-4.5" />
              )}
              <span className="hidden sm:inline">
                {activeReactionConfig?.label ?? "React"}
              </span>
            </button>

            {/* Reaction picker popup */}
            {showReactionPicker && (
              <div
                className="absolute bottom-full left-0 mb-2 flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1.5 shadow-lg"
                onMouseLeave={() => setShowReactionPicker(false)}
              >
                {REACTION_CONFIG.map(({ key, emoji, label }) => (
                  <button
                    key={key}
                    onClick={() => handleReaction(key)}
                    title={label}
                    className={`rounded-full p-1.5 text-xl transition-transform hover:scale-125 ${
                      activeReaction === key
                        ? "scale-110 bg-surface-secondary"
                        : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-secondary"
          >
            <MessageCircle className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Comment</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-secondary">
            <Share2 className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
            isSaved
              ? "font-medium text-brand"
              : "text-text-muted hover:bg-surface-secondary hover:text-text-secondary"
          }`}
          title={isSaved ? "Unsave" : "Save"}
        >
          <Bookmark
            className={`h-4.5 w-4.5 ${isSaved ? "fill-current" : ""}`}
          />
          <span className="hidden sm:inline">
            {isSaved ? "Saved" : "Save"}
          </span>
        </button>
      </div>

      {/* ---- Comments section ---- */}
      {showComments && (
        <>
          <div className="mx-4 border-t border-border" />
          <div className="space-y-3 px-4 py-3">
            {/* Comment input */}
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-text-inverse">
                U
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1.5">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                  placeholder="Write a comment..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
                <button
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || commentPosting}
                  className="shrink-0 text-brand transition-colors hover:text-brand-dark disabled:opacity-40"
                >
                  {commentPosting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Loading skeleton */}
            {commentsLoading && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-2.5 animate-pulse">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-surface-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 rounded bg-surface-secondary" />
                      <div className="h-3 w-full rounded bg-surface-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment list */}
            {!commentsLoading &&
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  {c.author.profile_picture_url ? (
                    <img
                      src={c.author.profile_picture_url}
                      alt={c.author.first_name}
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[10px] font-semibold text-brand-dark">
                      {getInitials(c.author.first_name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="rounded-xl bg-surface-secondary px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-text-primary">
                          {c.author.first_name}
                        </span>
                        {c.author.is_pro && (
                          <BadgeCheck className="h-3.5 w-3.5 text-brand" />
                        )}
                        <span className="text-xs text-text-muted">
                          {relativeTime(c.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-snug text-text-secondary">
                        {c.text}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-3 px-2">
                      <button
                        onClick={() => handleLikeComment(c.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          c.has_liked
                            ? "font-medium text-brand"
                            : "text-text-muted hover:text-text-secondary"
                        }`}
                      >
                        <ThumbsUp
                          className={`h-3 w-3 ${c.has_liked ? "fill-current" : ""}`}
                        />
                        {c.likes_count > 0 && (
                          <span>{formatCount(c.likes_count)}</span>
                        )}
                      </button>
                      <button className="text-xs text-text-muted hover:text-text-secondary">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {/* No comments loaded */}
            {!commentsLoading &&
              commentsLoaded &&
              comments.length === 0 && (
                <p className="py-2 text-center text-sm text-text-muted">
                  No comments yet. Be the first to comment!
                </p>
              )}
          </div>
        </>
      )}
    </article>
  );
}
