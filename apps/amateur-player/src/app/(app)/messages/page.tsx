"use client";

import { MessageCircle, Search, Lock, Users, Send } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Conversation Row                                                           */
/* -------------------------------------------------------------------------- */

interface ConversationProps {
  name: string;
  initials: string;
  color: string;
  preview: string;
  time: string;
  unread?: number;
  isGroup?: boolean;
}

function ConversationRow({
  name,
  initials,
  color,
  preview,
  time,
  unread,
  isGroup,
}: ConversationProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-secondary">
      <div className="relative">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-text-inverse"
          style={{ backgroundColor: color }}
        >
          {isGroup ? <Users className="h-5 w-5" /> : initials}
        </div>
        {unread && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-text-inverse">
            {unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">{name}</span>
          <span className="text-[11px] text-text-muted">{time}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-text-muted">{preview}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Messages Page                                                              */
/* -------------------------------------------------------------------------- */

const SAMPLE_CONVERSATIONS: ConversationProps[] = [
  {
    name: "Marcus Williams",
    initials: "MW",
    color: "#5145cd",
    preview: "Hey, are you bowling in the Fall Classic?",
    time: "2m ago",
    unread: 2,
  },
  {
    name: "Pin Crushers Team",
    initials: "",
    color: "#8BC342",
    preview: "Sarah: See everyone Tuesday at 7!",
    time: "1h ago",
    unread: 5,
    isGroup: true,
  },
  {
    name: "Sarah Chen",
    initials: "SC",
    color: "#e11d48",
    preview: "That 10-pin tip worked perfectly, thanks!",
    time: "3h ago",
  },
  {
    name: "ProShop Dave",
    initials: "PD",
    color: "#d97706",
    preview: "Your ball is ready for pickup. I adjusted the...",
    time: "Yesterday",
  },
  {
    name: "League Chat",
    initials: "",
    color: "#0891b2",
    preview: "Jake: Who's subbing for Tony next week?",
    time: "Yesterday",
    isGroup: true,
  },
];

export default function MessagesPage() {
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
          <MessageCircle className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Messages
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Private messaging with end-to-end encryption. Direct messages, group
          chats, and team conversations.
        </p>
      </div>

      {/* Preview Area */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-secondary p-6 shadow-sm sm:p-8">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
            <Search className="h-4 w-4 text-text-muted" />
            <span className="text-sm text-text-muted">Search messages...</span>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {["All", "Direct", "Groups", "Teams"].map((tab, i) => (
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

          {/* Conversation List */}
          <div className="space-y-2">
            {SAMPLE_CONVERSATIONS.map((c) => (
              <ConversationRow key={c.name} {...c} />
            ))}
          </div>

          {/* Compose bar */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
            <span className="flex-1 text-sm text-text-muted">
              Start a new message...
            </span>
            <button
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Lock, label: "Encrypted", desc: "End-to-end encryption on all messages" },
          { icon: Users, label: "Group Chats", desc: "Create groups with your bowling circle" },
          { icon: MessageCircle, label: "Rich Media", desc: "Share photos, videos, and game clips" },
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
