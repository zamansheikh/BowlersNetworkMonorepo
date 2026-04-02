"use client";

import { Target } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Pin Deck — 10 pins in triangle formation                                   */
/* -------------------------------------------------------------------------- */

function PinDeck() {
  const rows = [
    [7, 8, 9, 10],
    [4, 5, 6],
    [2, 3],
    [1],
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-3">
          {row.map((pin) => (
            <div
              key={pin}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand/30 bg-brand-50 text-xs font-bold text-brand-600 shadow-xs sm:h-11 sm:w-11 sm:text-sm"
            >
              {pin}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sample Scorecard Row                                                       */
/* -------------------------------------------------------------------------- */

function ScorecardPreview() {
  const frames = [
    { f1: "8", f2: "/", score: "20" },
    { f1: "X", f2: "", score: "45" },
    { f1: "7", f2: "2", score: "54" },
    { f1: "X", f2: "", score: "74" },
    { f1: "6", f2: "/", score: "90" },
    { f1: "9", f2: "-", score: "99" },
    { f1: "X", f2: "", score: "—" },
    { f1: "—", f2: "—", score: "—" },
    { f1: "—", f2: "—", score: "—" },
    { f1: "—", f2: "—", score: "—" },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-max rounded-lg border border-border bg-surface shadow-xs">
        {frames.map((frame, i) => (
          <div
            key={i}
            className={[
              "flex w-16 flex-col border-r border-border last:border-r-0 sm:w-20",
              i < 6 ? "" : "opacity-40",
            ].join(" ")}
          >
            {/* Frame number */}
            <div className="border-b border-border-subtle bg-surface-secondary px-1 py-0.5 text-center text-[10px] font-medium text-text-muted">
              {i + 1}
            </div>
            {/* Throws */}
            <div className="flex border-b border-border-subtle">
              <div className="flex-1 border-r border-border-subtle px-1 py-1.5 text-center text-xs font-semibold text-text-primary">
                {frame.f1}
              </div>
              <div className="flex-1 px-1 py-1.5 text-center text-xs font-semibold text-text-primary">
                {frame.f2}
              </div>
            </div>
            {/* Running total */}
            <div className="px-1 py-2 text-center text-sm font-bold text-text-secondary">
              {frame.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Games Page                                                                 */
/* -------------------------------------------------------------------------- */

export default function GamesPage() {
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
          <Target className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Game Scoring
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Track every frame with pin-by-pin scoring. Analyze your performance
          with AI coaching insights.
        </p>
      </div>

      {/* Preview Area */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        {/* Shimmer gradient border effect */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative space-y-8">
          {/* Pin Deck Section */}
          <div className="text-center">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
              Pin Deck View
            </h3>
            <PinDeck />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-text-muted">
              Live Scorecard
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Scorecard Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-text-secondary">
                Player 1 — Frame 7
              </div>
              <div className="rounded-md bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-muted">
                Running: 99
              </div>
            </div>
            <ScorecardPreview />
          </div>

          {/* AI Insight Preview */}
          <div className="rounded-xl border border-brand/20 bg-brand-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/20">
                <Target className="h-4 w-4 text-brand-dark" />
              </div>
              <div>
                <div className="text-sm font-semibold text-brand-dark">
                  AI Coach Insight
                </div>
                <div className="mt-0.5 text-sm text-brand-700">
                  Your spare conversion rate is 72% this session. Focus on the
                  3-6-10 spare combination — you&apos;ve missed it twice tonight.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pin-by-Pin", desc: "Track individual pin falls per throw" },
          { label: "AI Coaching", desc: "Get real-time tips and analysis" },
          { label: "Multi-Player", desc: "Score for up to 6 bowlers at once" },
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
