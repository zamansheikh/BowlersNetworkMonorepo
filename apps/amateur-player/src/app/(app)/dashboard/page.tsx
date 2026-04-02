"use client";

import { BarChart3, TrendingUp, Zap, Award, Hash } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-text-muted">{label}</div>
          <div className="mt-2 text-3xl font-bold text-text-primary">{value}</div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mini Bar Chart Placeholder                                                 */
/* -------------------------------------------------------------------------- */

function MiniBarChart() {
  const bars = [65, 78, 45, 82, 70, 55, 90, 68, 75, 88, 72, 60];
  const maxH = Math.max(...bars);

  return (
    <div className="flex h-32 items-end gap-1.5 sm:gap-2">
      {bars.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-brand/20"
            style={{ height: `${(v / maxH) * 100}%` }}
          >
            <div
              className="h-full w-full rounded-t-sm bg-brand/40 opacity-60"
              style={{ height: `${60 + Math.random() * 40}%` }}
            />
          </div>
          <span className="text-[9px] text-text-muted">
            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  XP Progress Bar                                                            */
/* -------------------------------------------------------------------------- */

function XPProgressBar() {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">Level 12</span>
        <span className="text-xs text-text-muted">2,450 / 5,000 XP</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-surface-tertiary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-accent"
          style={{ width: "49%" }}
        />
      </div>
      <div className="mt-1 text-xs text-text-muted">2,550 XP to Level 13</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard Page                                                             */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
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
          <BarChart3 className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Dashboard
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Your engagement analytics, XP progress, game stats, and referral
          tracking — all in one place.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Career Average"
          value="—"
          icon={TrendingUp}
          color="text-info"
          bgColor="bg-info-light"
        />
        <StatCard
          label="Total Games"
          value="—"
          icon={BarChart3}
          color="text-brand"
          bgColor="bg-brand-50"
        />
        <StatCard
          label="XP Level"
          value="—"
          icon={Zap}
          color="text-warning"
          bgColor="bg-warning-light"
        />
        <StatCard
          label="Leaderboard Rank"
          value="—"
          icon={Award}
          color="text-nav-active"
          bgColor="bg-nav-active-bg"
        />
      </div>

      {/* Charts & Progress */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative space-y-8">
          {/* XP Progress */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
              <Zap className="h-4 w-4 text-warning" />
              XP Progress
            </h3>
            <XPProgressBar />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-text-muted">
              Monthly Scores
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Bar Chart Preview */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
              <BarChart3 className="h-4 w-4 text-brand" />
              Score Trend (12 Months)
            </h3>
            <MiniBarChart />
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
              <Hash className="h-4 w-4 text-text-muted" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-surface-secondary p-3"
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-border-medium" />
                  <div className="h-3 flex-1 rounded bg-border" />
                  <div className="h-3 w-16 rounded bg-border-subtle" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
