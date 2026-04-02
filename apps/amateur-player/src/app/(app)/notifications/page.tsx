"use client";

import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Trophy,
  Star,
  BellOff,
  Settings,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Notification Type Icon                                                     */
/* -------------------------------------------------------------------------- */

interface NotificationTypeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

function NotificationType({
  icon: Icon,
  label,
  count,
  color,
  bgColor,
}: NotificationTypeProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-secondary">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgColor}`}
      >
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-text-primary">{label}</div>
      </div>
      <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-muted">
        {count}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty Notification Item (skeleton)                                         */
/* -------------------------------------------------------------------------- */

function EmptyNotificationRow() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface p-4">
      <div className="h-9 w-9 shrink-0 rounded-full bg-surface-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-surface-tertiary" />
        <div className="h-2.5 w-1/2 rounded bg-border-subtle" />
      </div>
      <div className="h-2.5 w-12 rounded bg-border-subtle" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Notifications Page                                                         */
/* -------------------------------------------------------------------------- */

const NOTIFICATION_TYPES: NotificationTypeProps[] = [
  { icon: Heart, label: "Reactions", count: 0, color: "text-error", bgColor: "bg-error-light" },
  { icon: MessageSquare, label: "Comments", count: 0, color: "text-info", bgColor: "bg-info-light" },
  { icon: UserPlus, label: "New Followers", count: 0, color: "text-brand", bgColor: "bg-brand-50" },
  { icon: Trophy, label: "Tournaments", count: 0, color: "text-warning", bgColor: "bg-warning-light" },
  { icon: Star, label: "Achievements", count: 0, color: "text-nav-active", bgColor: "bg-nav-active-bg" },
];

export default function NotificationsPage() {
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
          <Bell className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Notifications
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Stay updated on reactions, comments, follows, and more.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex justify-center gap-1">
        {["All", "Mentions", "Reactions", "Follows", "System"].map((tab, i) => (
          <button
            key={tab}
            disabled
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium",
              i === 0
                ? "bg-brand/10 text-brand-dark"
                : "text-text-muted hover:bg-surface-tertiary",
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Preview Area */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-secondary p-6 shadow-sm sm:p-8">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative space-y-6">
          {/* Notification categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
              Notification Categories
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {NOTIFICATION_TYPES.map((t) => (
                <NotificationType key={t.label} {...t} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-text-muted">
              Recent Notifications
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Empty state */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <EmptyNotificationRow key={i} />
            ))}
          </div>

          {/* No notifications message */}
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-tertiary">
              <BellOff className="h-7 w-7 text-text-muted" />
            </div>
            <div className="text-sm font-semibold text-text-secondary">
              No notifications yet
            </div>
            <div className="mt-1 max-w-xs text-xs text-text-muted">
              When you get reactions, comments, new followers, and tournament
              updates, they&apos;ll show up here.
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Bell, label: "Push Alerts", desc: "Real-time mobile notifications" },
          { icon: Settings, label: "Custom Filters", desc: "Choose what matters to you" },
          { icon: BellOff, label: "Quiet Hours", desc: "Pause notifications on schedule" },
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
