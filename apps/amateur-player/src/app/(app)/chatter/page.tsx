"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Eye,
  Check,
  Pin,
  Loader2,
  Plus,
  X,
  ArrowLeft,
  Send,
  Clock,
  Bookmark,
  Lock,
  MoreHorizontal,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  API helpers                                                                */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

function getToken() {
  return localStorage.getItem("access_token");
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function api(
  path: string,
  opts: { method?: string; body?: unknown } = {},
) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers: authHeaders(token),
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });

  if (res.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/signin";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.errors?.[0] ?? err?.detail ?? "Request failed");
  }

  return res.json();
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type Topic = { id: number; name: string; description: string; thread_count: number };

type Discussion = {
  id: number;
  uid: string;
  title: string;
  body: string;
  topic: { id: number; name: string };
  author: { id: number; username: string; first_name: string; last_name: string; profile_picture_url: string | null };
  tags: string[];
  upvote_count: number;
  downvote_count: number;
  opinion_count: number;
  view_count: number;
  is_locked: boolean;
  is_resolved: boolean;
  is_pinned: boolean;
  has_upvoted?: boolean;
  has_downvoted?: boolean;
  has_saved?: boolean;
  is_mine?: boolean;
  created_at: string;
};

type Opinion = {
  id: number;
  body: string;
  author: { id: number; username: string; first_name: string; last_name: string; profile_picture_url: string | null };
  parent_id: number | null;
  upvote_count: number;
  downvote_count: number;
  reply_count: number;
  is_pinned: boolean;
  has_upvoted?: boolean;
  has_downvoted?: boolean;
  is_mine?: boolean;
  created_at: string;
};

type SortOption = "recent" | "most_read" | "most_discussed" | "unanswered";

/* -------------------------------------------------------------------------- */
/*  Time helper                                                                */
/* -------------------------------------------------------------------------- */

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* -------------------------------------------------------------------------- */
/*  Chatter Page                                                               */
/* -------------------------------------------------------------------------- */

export default function ChatterPage() {
  const router = useRouter();

  /* ---- State ---- */
  const [topics, setTopics] = useState<Topic[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>("recent");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /* ---- Detail view ---- */
  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(null);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [opinionsLoading, setOpinionsLoading] = useState(false);
  const [newOpinion, setNewOpinion] = useState("");
  const [postingOpinion, setPostingOpinion] = useState(false);

  /* ---- Create discussion ---- */
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createBody, setCreateBody] = useState("");
  const [createTopicId, setCreateTopicId] = useState<number | "">("");
  const [createTags, setCreateTags] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  /* ---- Fetch topics ---- */
  useEffect(() => {
    api("/api/chatter/topics")
      .then((data) => setTopics(Array.isArray(data) ? data : data.topics ?? data.results ?? []))
      .catch(() => {});
  }, []);

  /* ---- Fetch discussions ---- */
  const fetchDiscussions = useCallback(
    async (p: number, append = false) => {
      if (!append) setLoading(true);
      try {
        const params = new URLSearchParams({
          sort,
          page: String(p),
          page_size: "15",
        });
        if (selectedTopic) params.set("topic", String(selectedTopic));

        const data = await api(`/api/chatter/discussions?${params}`);
        const items: Discussion[] = data.discussions ?? data.results ?? data;
        if (append) {
          setDiscussions((prev) => [...prev, ...items]);
        } else {
          setDiscussions(items);
        }
        setHasMore(items.length >= 15);
      } catch {
        if (!append) setDiscussions([]);
      } finally {
        setLoading(false);
      }
    },
    [sort, selectedTopic],
  );

  useEffect(() => {
    setPage(1);
    fetchDiscussions(1);
  }, [fetchDiscussions]);

  /* ---- Fetch opinions for a discussion ---- */
  async function openDiscussion(d: Discussion) {
    setActiveDiscussion(d);
    setOpinionsLoading(true);
    setOpinions([]);
    try {
      // Increment view
      api(`/api/chatter/discussions/${d.id}`)
        .then((detail) => setActiveDiscussion(detail))
        .catch(() => {});
      const data = await api(`/api/chatter/discussions/${d.id}/opinions?sort=top&page_size=50`);
      setOpinions(data.opinions ?? data.results ?? data);
    } catch {
      /* ignore */
    } finally {
      setOpinionsLoading(false);
    }
  }

  /* ---- Vote ---- */
  async function vote(id: number, type: "upvote" | "downvote", isOpinion = false) {
    const prefix = isOpinion ? "opinions" : "discussions";
    try {
      await api(`/api/chatter/${prefix}/${id}/${type}`, { method: "POST" });
      // Refresh
      if (isOpinion && activeDiscussion) {
        const data = await api(`/api/chatter/discussions/${activeDiscussion.id}/opinions?sort=top&page_size=50`);
        setOpinions(data.opinions ?? data.results ?? data);
      } else {
        fetchDiscussions(1);
        if (activeDiscussion) {
          const detail = await api(`/api/chatter/discussions/${activeDiscussion.id}`);
          setActiveDiscussion(detail);
        }
      }
    } catch { /* ignore */ }
  }

  /* ---- Post opinion ---- */
  async function submitOpinion() {
    if (!newOpinion.trim() || !activeDiscussion || postingOpinion) return;
    setPostingOpinion(true);
    try {
      await api(`/api/chatter/discussions/${activeDiscussion.id}/opinions`, {
        method: "POST",
        body: { body: newOpinion.trim() },
      });
      setNewOpinion("");
      const data = await api(`/api/chatter/discussions/${activeDiscussion.id}/opinions?sort=top&page_size=50`);
      setOpinions(data.opinions ?? data.results ?? data);
      // Update opinion count
      setActiveDiscussion((prev) => prev ? { ...prev, opinion_count: prev.opinion_count + 1 } : prev);
    } catch { /* ignore */ }
    finally { setPostingOpinion(false); }
  }

  /* ---- Create discussion ---- */
  async function handleCreate() {
    if (!createTitle.trim() || !createBody.trim() || !createTopicId) return;
    setCreating(true);
    setCreateError("");
    try {
      await api("/api/chatter/discussions", {
        method: "POST",
        body: {
          signup_data: {
            title: createTitle.trim(),
            body: createBody.trim(),
            topic_id: createTopicId,
            tags: createTags.split(",").map((t) => t.trim()).filter(Boolean),
          },
        },
      });
      setShowCreate(false);
      setCreateTitle("");
      setCreateBody("");
      setCreateTopicId("");
      setCreateTags("");
      fetchDiscussions(1);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  /* ---- Save discussion ---- */
  async function saveDiscussion(id: number) {
    try {
      await api(`/api/chatter/discussions/${id}/save`, { method: "POST" });
      fetchDiscussions(page);
    } catch { /* ignore */ }
  }

  /* ================================================================== */
  /*  Discussion Detail View                                             */
  /* ================================================================== */

  if (activeDiscussion) {
    const d = activeDiscussion;
    const initials = `${d.author.first_name?.[0] ?? ""}${d.author.last_name?.[0] ?? ""}`;

    return (
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
        {/* Back button */}
        <button
          onClick={() => setActiveDiscussion(null)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to discussions
        </button>

        {/* Discussion header */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex gap-4">
            {/* Vote column */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => vote(d.id, "upvote")}
                className={`rounded-lg p-1.5 transition-colors ${d.has_upvoted ? "text-brand bg-brand/10" : "text-text-muted hover:text-brand hover:bg-brand/5"}`}
              >
                <ChevronUp size={20} />
              </button>
              <span className="text-sm font-bold text-text-primary">
                {d.upvote_count - d.downvote_count}
              </span>
              <button
                onClick={() => vote(d.id, "downvote")}
                className={`rounded-lg p-1.5 transition-colors ${d.has_downvoted ? "text-error bg-error/10" : "text-text-muted hover:text-error hover:bg-error/5"}`}
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-dark">
                  {d.topic.name}
                </span>
                {d.is_pinned && <Pin size={14} className="text-brand" />}
                {d.is_locked && <Lock size={14} className="text-text-muted" />}
                {d.is_resolved && <Check size={14} className="text-success" />}
              </div>

              <h1 className="mt-2 text-xl font-bold text-text-primary">{d.title}</h1>

              <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                <div className="flex items-center gap-1.5">
                  {d.author.profile_picture_url ? (
                    <img src={d.author.profile_picture_url} className="h-5 w-5 rounded-full object-cover" alt="" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">{initials}</span>
                  )}
                  <span className="font-medium text-text-secondary">{d.author.first_name} {d.author.last_name}</span>
                </div>
                <span>{timeAgo(d.created_at)}</span>
                <span className="flex items-center gap-1"><Eye size={12} />{d.view_count}</span>
              </div>

              <div className="mt-4 text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                {d.body}
              </div>

              {d.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-surface-tertiary px-2 py-0.5 text-xs text-text-muted">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add opinion */}
        {!d.is_locked && (
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <textarea
              value={newOpinion}
              onChange={(e) => setNewOpinion(e.target.value)}
              placeholder="Share your opinion..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-surface-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={submitOpinion}
                disabled={!newOpinion.trim() || postingOpinion}
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {postingOpinion ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Reply
              </button>
            </div>
          </div>
        )}

        {/* Opinions */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            {d.opinion_count} {d.opinion_count === 1 ? "Opinion" : "Opinions"}
          </h2>

          {opinionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : opinions.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface py-8 text-center text-sm text-text-muted">
              No opinions yet. Be the first to share yours!
            </div>
          ) : (
            <div className="space-y-3">
              {opinions.map((op) => {
                const opInitials = `${op.author.first_name?.[0] ?? ""}${op.author.last_name?.[0] ?? ""}`;
                return (
                  <div
                    key={op.id}
                    className={`flex gap-3 rounded-xl border bg-surface p-4 ${op.is_pinned ? "border-brand/30 bg-brand/5" : "border-border"} ${op.parent_id ? "ml-8" : ""}`}
                  >
                    {/* Vote */}
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => vote(op.id, "upvote", true)}
                        className={`rounded p-1 ${op.has_upvoted ? "text-brand" : "text-text-muted hover:text-brand"}`}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <span className="text-xs font-bold text-text-secondary">
                        {op.upvote_count - op.downvote_count}
                      </span>
                      <button
                        onClick={() => vote(op.id, "downvote", true)}
                        className={`rounded p-1 ${op.has_downvoted ? "text-error" : "text-text-muted hover:text-error"}`}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        {op.author.profile_picture_url ? (
                          <img src={op.author.profile_picture_url} className="h-4 w-4 rounded-full object-cover" alt="" />
                        ) : (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[8px] font-semibold text-white">{opInitials}</span>
                        )}
                        <span className="font-medium text-text-secondary">{op.author.first_name} {op.author.last_name}</span>
                        <span>{timeAgo(op.created_at)}</span>
                        {op.is_pinned && <Pin size={12} className="text-brand" />}
                      </div>
                      <p className="mt-1.5 text-sm text-text-primary whitespace-pre-wrap">{op.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================================================================== */
  /*  Discussions List View                                              */
  /* ================================================================== */

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "recent", label: "Recent" },
    { value: "most_read", label: "Most Read" },
    { value: "most_discussed", label: "Most Discussed" },
    { value: "unanswered", label: "Unanswered" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Chatter</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Community discussions about everything bowling
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <Plus size={18} />
          New Thread
        </button>
      </div>

      {/* Topics filter */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selectedTopic === null
                ? "bg-brand text-white"
                : "bg-surface-tertiary text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            All
          </button>
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(selectedTopic === t.id ? null : t.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                selectedTopic === t.id
                  ? "bg-brand text-white"
                  : "bg-surface-tertiary text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {t.name}
              <span className="ml-1.5 text-xs opacity-70">{t.thread_count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sort tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {SORT_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSort(s.value)}
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${
              sort === s.value
                ? "border-b-2 border-brand text-brand"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Discussion list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-brand" />
        </div>
      ) : discussions.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface py-16 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-text-muted" />
          <p className="text-sm text-text-muted">No discussions yet. Start the first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {discussions.map((d) => {
            const initials = `${d.author.first_name?.[0] ?? ""}${d.author.last_name?.[0] ?? ""}`;
            const score = d.upvote_count - d.downvote_count;

            return (
              <button
                key={d.id}
                onClick={() => openDiscussion(d)}
                className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-secondary"
              >
                {/* Vote score */}
                <div className="flex flex-col items-center gap-0.5 pt-0.5">
                  <ChevronUp size={16} className={d.has_upvoted ? "text-brand" : "text-text-muted"} />
                  <span className={`text-xs font-bold ${score > 0 ? "text-brand" : score < 0 ? "text-error" : "text-text-muted"}`}>
                    {score}
                  </span>
                  <ChevronDown size={16} className={d.has_downvoted ? "text-error" : "text-text-muted"} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand-dark">
                      {d.topic.name}
                    </span>
                    {d.is_pinned && <Pin size={12} className="text-brand" />}
                    {d.is_resolved && <Check size={12} className="text-success" />}
                    {d.is_locked && <Lock size={12} className="text-text-muted" />}
                  </div>

                  <h3 className="mt-1 text-sm font-semibold text-text-primary">{d.title}</h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      {d.author.profile_picture_url ? (
                        <img src={d.author.profile_picture_url} className="h-4 w-4 rounded-full object-cover" alt="" />
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[8px] font-semibold text-white">{initials}</span>
                      )}
                      {d.author.first_name} {d.author.last_name}
                    </span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} />{d.opinion_count}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{d.view_count}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{timeAgo(d.created_at)}</span>
                  </div>
                </div>

                {/* Save */}
                <button
                  onClick={(e) => { e.stopPropagation(); saveDiscussion(d.id); }}
                  className={`shrink-0 rounded-lg p-1.5 transition-colors ${d.has_saved ? "text-brand" : "text-text-muted hover:text-brand"}`}
                >
                  <Bookmark size={16} />
                </button>
              </button>
            );
          })}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchDiscussions(next, true);
                }}
                className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- Create Discussion Modal ---- */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">New Discussion</h2>
              <button onClick={() => setShowCreate(false)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div className="mb-3 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{createError}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Topic</label>
                <select
                  value={createTopicId}
                  onChange={(e) => setCreateTopicId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-input focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="">Select a topic</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Title</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="What do you want to discuss?"
                  className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-input placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Body</label>
                <textarea
                  value={createBody}
                  onChange={(e) => setCreateBody(e.target.value)}
                  rows={5}
                  placeholder="Share your thoughts..."
                  className="w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-input placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Tags (comma separated)</label>
                <input
                  type="text"
                  value={createTags}
                  onChange={(e) => setCreateTags(e.target.value)}
                  placeholder="equipment, ball motion, hook"
                  className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-input placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!createTitle.trim() || !createBody.trim() || !createTopicId || creating}
                  className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  Post Discussion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
