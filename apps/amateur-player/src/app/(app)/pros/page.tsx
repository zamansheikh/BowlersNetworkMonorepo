"use client";

import { Star, Search, Award, Eye, BookOpen } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Pro Directory Card                                                         */
/* -------------------------------------------------------------------------- */

interface ProCardProps {
  name: string;
  initials: string;
  color: string;
  title: string;
  average: string;
  titles: number;
  followers: string;
  verified: boolean;
}

function ProCard({
  name,
  initials,
  color,
  title,
  average,
  titles: titleCount,
  followers,
  verified,
}: ProCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-sm">
      {/* Avatar & Info */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-text-inverse"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          {verified && (
            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-brand">
                <Star className="h-2.5 w-2.5 text-text-inverse" fill="currentColor" />
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text-primary">{name}</div>
          <div className="text-xs text-text-muted">{title}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-surface-secondary p-3">
        <div className="text-center">
          <div className="text-sm font-bold text-text-primary">{average}</div>
          <div className="text-[10px] text-text-muted">Average</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-text-primary">{titleCount}</div>
          <div className="text-[10px] text-text-muted">Titles</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-text-primary">{followers}</div>
          <div className="text-[10px] text-text-muted">Followers</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          disabled
          className="flex-1 rounded-lg bg-brand/10 py-2 text-xs font-semibold text-brand-dark opacity-50"
        >
          Follow
        </button>
        <button
          disabled
          className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-text-secondary opacity-50"
        >
          Mentorship
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pros Page                                                                  */
/* -------------------------------------------------------------------------- */

const SAMPLE_PROS: ProCardProps[] = [
  {
    name: "Jason Belmonte",
    initials: "JB",
    color: "#dc2626",
    title: "PBA Champion",
    average: "228",
    titles: 30,
    followers: "125K",
    verified: true,
  },
  {
    name: "EJ Tackett",
    initials: "EJ",
    color: "#2563eb",
    title: "PBA Tour Player",
    average: "225",
    titles: 18,
    followers: "89K",
    verified: true,
  },
  {
    name: "Danielle McEwan",
    initials: "DM",
    color: "#db2777",
    title: "PWBA Champion",
    average: "220",
    titles: 12,
    followers: "67K",
    verified: true,
  },
  {
    name: "Anthony Simonsen",
    initials: "AS",
    color: "#7c3aed",
    title: "PBA Tour Player",
    average: "224",
    titles: 10,
    followers: "54K",
    verified: true,
  },
  {
    name: "Shannon O'Keefe",
    initials: "SO",
    color: "#059669",
    title: "PWBA Champion",
    average: "218",
    titles: 15,
    followers: "72K",
    verified: true,
  },
  {
    name: "Kyle Troup",
    initials: "KT",
    color: "#d97706",
    title: "PBA Tour Player",
    average: "222",
    titles: 8,
    followers: "45K",
    verified: true,
  },
];

export default function ProsPage() {
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
          <Star className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Pro Bowlers
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Discover and follow professional bowlers. Request mentorship, view
          stats, and watch highlights.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
          <Search className="h-4 w-4 text-text-muted" />
          <span className="text-sm text-text-muted">Search pro bowlers...</span>
        </div>
        <div className="flex gap-2">
          {["PBA", "PWBA", "All"].map((f, i) => (
            <button
              key={f}
              disabled
              className={[
                "rounded-full px-4 py-1.5 text-xs font-medium",
                i === 2
                  ? "bg-brand/10 text-brand-dark"
                  : "bg-surface-tertiary text-text-muted",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-secondary p-6 shadow-sm sm:p-8">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_PROS.map((p) => (
            <ProCard key={p.name} {...p} />
          ))}
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Eye, label: "Watch Highlights", desc: "Game footage and shot breakdowns" },
          { icon: BookOpen, label: "Mentorship", desc: "Request 1-on-1 coaching sessions" },
          { icon: Award, label: "Career Stats", desc: "Full tournament and career data" },
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
