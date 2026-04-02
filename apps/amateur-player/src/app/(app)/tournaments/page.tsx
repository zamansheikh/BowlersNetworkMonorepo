"use client";

import { Trophy, MapPin, Calendar, Users } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Empty Tournament Card                                                      */
/* -------------------------------------------------------------------------- */

interface TournamentCardProps {
  title: string;
  format: string;
  date: string;
  location: string;
  entryFee: string;
  spots: string;
}

function TournamentCard({
  title,
  format,
  date,
  location,
  entryFee,
  spots,
}: TournamentCardProps) {
  return (
    <div className="group rounded-xl border-2 border-dashed border-border-medium bg-surface p-5 transition-all duration-200 hover:border-brand/40 hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-text-primary">{title}</div>
          <span className="mt-1 inline-block rounded-full bg-surface-tertiary px-2 py-0.5 text-[11px] font-medium text-text-muted">
            {format}
          </span>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand group-hover:bg-brand/20">
          <Trophy className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-2 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5" />
          <span>{spots}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
        <span className="text-sm font-semibold text-text-primary">{entryFee}</span>
        <button
          disabled
          className="rounded-lg bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand-dark opacity-50"
        >
          Register
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tournaments Page                                                           */
/* -------------------------------------------------------------------------- */

const SAMPLE_TOURNAMENTS: TournamentCardProps[] = [
  {
    title: "Fall Classic Open",
    format: "Singles",
    date: "Oct 15-17, 2026",
    location: "Sunset Lanes, Portland, OR",
    entryFee: "$75 entry",
    spots: "48 / 64 spots filled",
  },
  {
    title: "Metro Doubles Championship",
    format: "Doubles",
    date: "Nov 8-9, 2026",
    location: "Thunderbowl Lanes, Detroit, MI",
    entryFee: "$120 per team",
    spots: "16 / 32 teams",
  },
  {
    title: "Holiday Team Bash",
    format: "Team (4-person)",
    date: "Dec 20, 2026",
    location: "Bowlero Times Square, New York, NY",
    entryFee: "$200 per team",
    spots: "Registration opens Nov 1",
  },
];

export default function TournamentsPage() {
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
          <Trophy className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Tournaments
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Discover and register for local and national bowling tournaments.
          Singles, doubles, and team formats.
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {["All Tournaments", "Singles", "Doubles", "Team", "Near Me"].map(
          (pill, i) => (
            <button
              key={pill}
              disabled
              className={[
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                i === 0
                  ? "bg-brand/10 text-brand-dark"
                  : "bg-surface-tertiary text-text-muted",
              ].join(" ")}
            >
              {pill}
            </button>
          ),
        )}
      </div>

      {/* Tournament Cards */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-secondary p-6 shadow-sm sm:p-8">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_TOURNAMENTS.map((t) => (
            <TournamentCard key={t.title} {...t} />
          ))}
        </div>
      </div>

      {/* Bottom info cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Live Brackets", desc: "Follow tournament progress in real-time" },
          { label: "Online Registration", desc: "Sign up and pay directly in the app" },
          { label: "Prize Tracking", desc: "Track earnings and tournament history" },
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
