"use client";

import { Users, Plus, Shield, Trophy } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Empty Team Card                                                            */
/* -------------------------------------------------------------------------- */

interface TeamCardProps {
  name: string;
  members: { initials: string; color: string }[];
  league: string;
  record: string;
}

function TeamCard({ name, members, league, record }: TeamCardProps) {
  return (
    <div className="group rounded-xl border-2 border-dashed border-border-medium bg-surface p-5 transition-all duration-200 hover:border-brand/40 hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-text-primary">{name}</div>
          <div className="mt-0.5 text-xs text-text-muted">{league}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand group-hover:bg-brand/20">
          <Shield className="h-5 w-5" />
        </div>
      </div>

      {/* Member Avatars */}
      <div className="mb-3 flex -space-x-2">
        {members.map((m, i) => (
          <div
            key={i}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold text-text-inverse"
            style={{ backgroundColor: m.color }}
          >
            {m.initials}
          </div>
        ))}
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-tertiary text-[10px] font-medium text-text-muted">
          +?
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle pt-3">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Trophy className="h-3.5 w-3.5" />
          <span>{record}</span>
        </div>
        <span className="rounded-full bg-surface-tertiary px-2.5 py-0.5 text-[11px] font-medium text-text-muted">
          {members.length} members
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Create Team Card                                                           */
/* -------------------------------------------------------------------------- */

function CreateTeamCard() {
  return (
    <button
      disabled
      className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-medium bg-surface-secondary p-5 opacity-60 transition-all"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
        <Plus className="h-6 w-6 text-brand" />
      </div>
      <div className="text-sm font-semibold text-text-secondary">Create a Team</div>
      <div className="mt-1 text-xs text-text-muted">
        Start competing together
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Teams Page                                                                 */
/* -------------------------------------------------------------------------- */

const SAMPLE_TEAMS: TeamCardProps[] = [
  {
    name: "Pin Crushers",
    league: "Tuesday Night League",
    record: "12W - 4L",
    members: [
      { initials: "MW", color: "#5145cd" },
      { initials: "SC", color: "#e11d48" },
      { initials: "JT", color: "#0891b2" },
    ],
  },
  {
    name: "Gutter Busters",
    league: "Friday Mixed League",
    record: "8W - 8L",
    members: [
      { initials: "PD", color: "#d97706" },
      { initials: "AR", color: "#7c3aed" },
      { initials: "TK", color: "#2563eb" },
      { initials: "LP", color: "#db2777" },
    ],
  },
  {
    name: "Strike Force",
    league: "Saturday Sport Shot",
    record: "15W - 1L",
    members: [
      { initials: "BN", color: "#6fa332" },
      { initials: "KR", color: "#059669" },
    ],
  },
];

export default function TeamsPage() {
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
          <Users className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Teams
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Create teams, invite members, and compete together in tournaments and
          leagues.
        </p>
      </div>

      {/* Preview Area */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-secondary p-6 shadow-sm sm:p-8">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_TEAMS.map((t) => (
            <TeamCard key={t.name} {...t} />
          ))}
          <CreateTeamCard />
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Team Chat", desc: "Built-in messaging for your team" },
          { label: "Shared Stats", desc: "Track team performance together" },
          { label: "Roster Management", desc: "Invite, remove, and manage roles" },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-border bg-surface p-4 text-center shadow-xs"
          >
            <div className="text-sm font-semibold text-text-primary">{f.label}</div>
            <div className="mt-1 text-xs text-text-muted">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
