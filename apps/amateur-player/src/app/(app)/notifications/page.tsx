"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Trophy,
  CheckCheck,
  Trash2,
  Loader2,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  API helpers                                                                */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

function getToken() {
  return localStorage.getItem("access_token");
}

async function api(
  path: string,
  opts: { method?: string; body?: unknown } = {},
) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });

  if (res.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/signin";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.errors?.[0] ?? "Request failed");
  }

  return res.json();
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type Notification = {
  id: number;
  category: string;
  message: string;
  is_read: boolean;
  actor: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_picture_url: string | null;
  } | null;
  target_type: string;
  target_id: number | null;
  data: Record<string, unknown>;
  created_at: string;
};

type Filter = "all" | "unread" | "social" | "activity" | "system";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

const CATEGORY_ICONS: Record<string, typeof Bell> = {
  follow: UserPlus,
  like: Heart,
  comment: MessageSquare,
  tournament: Trophy,
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] ?? Bell;
}

/* -------------------------------------------------------------------------- */
/*  Notifications Page                                                         */
/* -------------------------------------------------------------------------- */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page_size: "50" });
      if (filter === "unread") params.set("is_read", "false");
      else if (filter !== "all") params.set("category", filter);

      const data = await api(`/api/notifications?${params}`);
      setNotifications(data.notifications ?? data.results ?? data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api("/api/notifications/unread-count");
      setUnreadCount(data.unread_count ?? 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  async function markRead(id: number) {
    try {
      await api(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  }

  async function markAllRead() {
    try {
      await api("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  }

  async function deleteNotification(id: number) {
    try {
      await api(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { /* ignore */ }
  }

  async function clearAll() {
    try {
      await api("/api/notifications/clear-all", { method: "POST" });
      setNotifications([]);
      setUnreadCount(0);
    } catch { /* ignore */ }
  }

  const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { value: "social", label: "Social" },
    { value: "activity", label: "Activity" },
    { value: "system", label: "System" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-text-secondary">
              {unreadCount} unread
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary disabled:opacity-40"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-secondary hover:text-error disabled:opacity-40"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "border-b-2 border-brand text-brand"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-brand" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface py-16 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-text-muted" />
          <p className="text-sm text-text-muted">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => {
            const Icon = getCategoryIcon(n.category);
            const initials = n.actor
              ? `${n.actor.first_name?.[0] ?? ""}${n.actor.last_name?.[0] ?? ""}`
              : "";

            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors cursor-pointer ${
                  n.is_read
                    ? "border-transparent bg-surface hover:bg-surface-secondary"
                    : "border-brand/20 bg-brand/5 hover:bg-brand/10"
                }`}
              >
                {/* Actor avatar or category icon */}
                {n.actor?.profile_picture_url ? (
                  <img
                    src={n.actor.profile_picture_url}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : n.actor ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                    {initials}
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-tertiary">
                    <Icon size={18} className="text-text-muted" />
                  </div>
                )}

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary">
                    {n.actor && (
                      <span className="font-semibold">
                        {n.actor.first_name} {n.actor.last_name}{" "}
                      </span>
                    )}
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">{timeAgo(n.created_at)}</p>
                </div>

                {/* Unread dot + delete */}
                <div className="flex items-center gap-2">
                  {!n.is_read && (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="rounded p-1 text-text-muted opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                    style={{ opacity: undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
