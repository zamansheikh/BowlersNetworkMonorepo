"use client";

import { MessageSquare, TrendingUp, Pin, Users, Hash } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Category Pill                                                              */
/* -------------------------------------------------------------------------- */

interface CategoryPillProps {
  label: string;
  count: number;
  active?: boolean;
  color: string;
}

function CategoryPill({ label, count, active, color }: CategoryPillProps) {
  return (
    <button
      disabled
      className={[
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-brand/10 text-brand-dark shadow-xs"
          : "bg-surface-tertiary text-text-secondary hover:bg-surface-secondary",
      ].join(" ")}
    >
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
      <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-text-muted">
        {count}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Discussion Thread Preview                                                  */
/* -------------------------------------------------------------------------- */

interface ThreadPreviewProps {
  title: string;
  author: string;
  authorColor: string;
  authorInitials: string;
  replies: number;
  timeAgo: string;
  category: string;
}

function ThreadPreview({
  title,
  author,
  authorColor,
  authorInitials,
  replies,
  timeAgo,
  category,
}: ThreadPreviewProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-secondary">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-text-inverse"
        style={{ backgroundColor: authorColor }}
      >
        {authorInitials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-text-primary">{title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span>{author}</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {replies} replies
          </span>
          <span>{timeAgo}</span>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-medium text-text-muted">
        {category}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chatter Page                                                               */
/* -------------------------------------------------------------------------- */

const CATEGORIES: CategoryPillProps[] = [
  { label: "General", count: 234, active: true, color: "#8BC342" },
  { label: "Equipment", count: 189, color: "#f97316" },
  { label: "Lane Play", count: 145, color: "#3b82f6" },
  { label: "Tournament", count: 98, color: "#a855f7" },
  { label: "Technique", count: 76, color: "#ef4444" },
  { label: "Pro Tips", count: 52, color: "#eab308" },
  { label: "Off-Topic", count: 167, color: "#99a1af" },
];

const SAMPLE_THREADS: ThreadPreviewProps[] = [
  {
    title: "Best ball for medium oil? Looking to replace my Hustle Ink",
    author: "Marcus W.",
    authorColor: "#5145cd",
    authorInitials: "MW",
    replies: 23,
    timeAgo: "2h ago",
    category: "Equipment",
  },
  {
    title: "How do you adjust for burnt up lanes in block 2 of tournaments?",
    author: "Sarah C.",
    authorColor: "#e11d48",
    authorInitials: "SC",
    replies: 15,
    timeAgo: "4h ago",
    category: "Lane Play",
  },
  {
    title: "Just converted the 7-10 split. AMA",
    author: "Jake T.",
    authorColor: "#0891b2",
    authorInitials: "JT",
    replies: 47,
    timeAgo: "6h ago",
    category: "General",
  },
  {
    title: "Two-handed vs one-handed: the eternal debate continues",
    author: "Amy R.",
    authorColor: "#7c3aed",
    authorInitials: "AR",
    replies: 89,
    timeAgo: "8h ago",
    category: "Technique",
  },
];

export default function ChatterPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      {/* Coming Soon Badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand-dark">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Coming Soon
        </span>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
          <MessageSquare className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Chatter
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Topic-led discussions with the bowling community. Equipment reviews,
          lane play tips, tournament talk, and more.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((c) => (
          <CategoryPill key={c.label} {...c} />
        ))}
      </div>

      {/* Preview Area */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-secondary p-6 shadow-sm sm:p-8">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative space-y-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
              <TrendingUp className="h-4 w-4 text-fire" />
              Trending Discussions
            </h3>
            <button
              disabled
              className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-dark opacity-50"
            >
              New Thread
            </button>
          </div>

          {SAMPLE_THREADS.map((t) => (
            <ThreadPreview key={t.title} {...t} />
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Hash, label: "7 Categories", desc: "Topics for every discussion" },
          { icon: Users, label: "Community-Led", desc: "Moderated by top bowlers" },
          { icon: Pin, label: "Pinned Guides", desc: "Expert knowledge base" },
        ].map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs"
          >
            <f.icon className="h-5 w-5 shrink-0 text-brand" />
            <div>
              <div className="text-sm font-semibold text-text-primary">{f.label}</div>
              <div className="text-xs text-text-muted">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
