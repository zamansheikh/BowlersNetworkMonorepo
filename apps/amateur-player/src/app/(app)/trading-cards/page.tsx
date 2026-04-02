"use client";

import { CreditCard, Sparkles, ArrowLeftRight, TrendingUp } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Trading Card Preview with Shimmer                                          */
/* -------------------------------------------------------------------------- */

function TradingCardPreview() {
  return (
    <div className="relative mx-auto w-64 sm:w-72">
      {/* Card outer glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-brand via-brand-accent to-brand-light opacity-30 blur-md" />

      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-brand/30 bg-gradient-to-br from-surface via-surface to-surface-secondary shadow-lg">
        {/* Shimmer effect */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />

        {/* Card Header */}
        <div className="bg-gradient-to-r from-brand to-brand-accent p-4 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/20">
            <span className="text-xl font-bold text-text-inverse">?</span>
          </div>
          <div className="text-sm font-bold text-text-inverse">Your Name Here</div>
          <div className="text-xs text-white/70">Amateur Bowler</div>
        </div>

        {/* Card Body */}
        <div className="space-y-3 p-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Average", value: "—" },
              { label: "High Game", value: "—" },
              { label: "300 Games", value: "—" },
              { label: "XP Level", value: "—" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg bg-surface-secondary p-2 text-center"
              >
                <div className="text-sm font-bold text-text-primary">{s.value}</div>
                <div className="text-[9px] uppercase tracking-wider text-text-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Brands */}
          <div>
            <div className="mb-1.5 text-[10px] uppercase tracking-wider text-text-muted">
              Brands
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-md border border-border bg-surface-tertiary"
                />
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="mb-1.5 text-[10px] uppercase tracking-wider text-text-muted">
              Achievements
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-border-medium bg-surface-tertiary text-[8px] text-text-muted"
                >
                  ?
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-[9px] font-medium text-text-muted">
            BOWLERSNETWORK
          </span>
          <span className="text-[9px] font-medium text-text-muted">#000001</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trading Cards Page                                                         */
/* -------------------------------------------------------------------------- */

export default function TradingCardsPage() {
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
          <CreditCard className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Trading Cards
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Collect and trade digital bowling cards. Your card updates live with
          your stats, brands, and achievements.
        </p>
      </div>

      {/* Card Preview */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-secondary p-8 shadow-sm sm:p-12">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative">
          <TradingCardPreview />
        </div>
      </div>

      {/* Rarity tiers */}
      <div>
        <h3 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-text-muted">
          Card Rarity Tiers
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Common", color: "#99a1af", bg: "bg-surface-tertiary" },
            { label: "Rare", color: "#3b82f6", bg: "bg-info-light" },
            { label: "Epic", color: "#a855f7", bg: "bg-purple-50" },
            { label: "Legendary", color: "#f59e0b", bg: "bg-warning-light" },
          ].map((tier) => (
            <div
              key={tier.label}
              className={`rounded-xl border border-border ${tier.bg} p-4 text-center`}
            >
              <div
                className="mx-auto mb-2 h-3 w-12 rounded-full"
                style={{ backgroundColor: tier.color }}
              />
              <div className="text-sm font-semibold text-text-primary">
                {tier.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Sparkles, label: "Live Updates", desc: "Stats update in real-time on your card" },
          { icon: ArrowLeftRight, label: "Trade & Collect", desc: "Exchange cards with other bowlers" },
          { icon: TrendingUp, label: "Card Value", desc: "Cards gain value as you improve" },
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
