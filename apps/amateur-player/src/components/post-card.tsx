"use client";

import { useState } from "react";
import {
  Heart,
  Flame,
  Target,
  HandMetal,
  Sparkles,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface PostComment {
  id: string;
  author_name: string;
  author_username: string;
  author_initials: string;
  avatar_color: string;
  text: string;
  timestamp: string;
}

export interface PostReactions {
  like: number;
  fire: number;
  strike: number;
  clap: number;
  wow: number;
}

export interface Post {
  id: string;
  author_name: string;
  author_username: string;
  author_initials: string;
  avatar_color: string;
  timestamp: string;
  audience: "public" | "followers" | "center" | "private";
  content: string;
  media_url?: string | null;
  reactions: PostReactions;
  comment_count: number;
  share_count: number;
  comments: PostComment[];
  user_reaction?: keyof PostReactions | null;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const AUDIENCE_META: Record<Post["audience"], { icon: typeof Globe; label: string }> = {
  public: { icon: Globe, label: "Public" },
  followers: { icon: Users, label: "Followers" },
  center: { icon: Target, label: "Center" },
  private: { icon: Lock, label: "Private" },
};

const REACTION_CONFIG: {
  key: keyof PostReactions;
  icon: typeof Heart;
  label: string;
  activeColor: string;
  hoverColor: string;
}[] = [
  { key: "like", icon: Heart, label: "Like", activeColor: "text-error", hoverColor: "hover:text-error" },
  { key: "fire", icon: Flame, label: "Fire", activeColor: "text-fire", hoverColor: "hover:text-fire" },
  { key: "strike", icon: Target, label: "Strike", activeColor: "text-strike", hoverColor: "hover:text-strike" },
  { key: "clap", icon: HandMetal, label: "Clap", activeColor: "text-clap", hoverColor: "hover:text-clap" },
  { key: "wow", icon: Sparkles, label: "Wow", activeColor: "text-wow", hoverColor: "hover:text-wow" },
];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

const CONTENT_TRUNCATE_LENGTH = 200;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState<PostReactions>(post.reactions);
  const [activeReaction, setActiveReaction] = useState<keyof PostReactions | null>(
    post.user_reaction ?? null,
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const isLong = post.content.length > CONTENT_TRUNCATE_LENGTH;
  const displayContent =
    isLong && !expanded ? post.content.slice(0, CONTENT_TRUNCATE_LENGTH) + "..." : post.content;

  const AudienceIcon = AUDIENCE_META[post.audience].icon;

  function handleReaction(key: keyof PostReactions) {
    setReactions((prev) => {
      const updated = { ...prev };
      if (activeReaction === key) {
        updated[key] = Math.max(0, updated[key] - 1);
        setActiveReaction(null);
      } else {
        if (activeReaction) updated[activeReaction] = Math.max(0, updated[activeReaction] - 1);
        updated[key] = updated[key] + 1;
        setActiveReaction(key);
      }
      return updated;
    });
  }

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <article className="bg-surface rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md">
      {/* ---- Header ---- */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-text-inverse"
          style={{ backgroundColor: post.avatar_color }}
        >
          {post.author_initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-semibold text-text-primary">{post.author_name}</span>
            <span className="truncate text-sm text-text-muted">@{post.author_username}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span>{post.timestamp}</span>
            <span>&middot;</span>
            <AudienceIcon className="h-3 w-3" />
            <span>{AUDIENCE_META[post.audience].label}</span>
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
              {["Save post", "Hide post", "Report"].map((item) => (
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

      {/* ---- Media ---- */}
      {post.media_url && (
        <div className="px-4 pb-3">
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-tertiary">
            <img
              src={post.media_url}
              alt="Post media"
              className="h-72 w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* ---- Stats summary ---- */}
      {(totalReactions > 0 || post.comment_count > 0 || post.share_count > 0) && (
        <div className="flex items-center justify-between px-4 pb-2 text-xs text-text-muted">
          <span>
            {totalReactions > 0 && `${formatCount(totalReactions)} reaction${totalReactions !== 1 ? "s" : ""}`}
          </span>
          <div className="flex gap-3">
            {post.comment_count > 0 && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:text-text-secondary hover:underline"
              >
                {formatCount(post.comment_count)} comment{post.comment_count !== 1 ? "s" : ""}
              </button>
            )}
            {post.share_count > 0 && (
              <span>{formatCount(post.share_count)} share{post.share_count !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      )}

      {/* ---- Divider ---- */}
      <div className="mx-4 border-t border-border" />

      {/* ---- Reactions bar ---- */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex flex-1 items-center">
          {REACTION_CONFIG.map(({ key, icon: Icon, label, activeColor, hoverColor }) => {
            const isActive = activeReaction === key;
            return (
              <button
                key={key}
                onClick={() => handleReaction(key)}
                title={label}
                className={`group flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  isActive
                    ? `${activeColor} font-medium`
                    : `text-text-muted ${hoverColor} hover:bg-surface-secondary`
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${isActive ? "fill-current" : ""}`} />
                {reactions[key] > 0 && (
                  <span className="text-xs">{formatCount(reactions[key])}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-secondary"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">Comment</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-secondary">
            <Share2 className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* ---- Inline comments preview ---- */}
      {showComments && post.comments.length > 0 && (
        <>
          <div className="mx-4 border-t border-border" />
          <div className="space-y-3 px-4 py-3">
            {post.comments.slice(0, 2).map((c) => (
              <div key={c.id} className="flex items-start gap-2.5">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-text-inverse"
                  style={{ backgroundColor: c.avatar_color }}
                >
                  {c.author_initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="rounded-xl bg-surface-secondary px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-text-primary">{c.author_name}</span>
                      <span className="text-xs text-text-muted">{c.timestamp}</span>
                    </div>
                    <p className="text-sm leading-snug text-text-secondary">{c.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {post.comment_count > 2 && (
              <button className="text-sm font-medium text-brand-dark hover:underline">
                View all {post.comment_count} comments
              </button>
            )}
          </div>
        </>
      )}
    </article>
  );
}
