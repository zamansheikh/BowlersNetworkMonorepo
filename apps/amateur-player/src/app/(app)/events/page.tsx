"use client";

import { CalendarDays, Clock, MapPin } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Mini Calendar                                                              */
/* -------------------------------------------------------------------------- */

function MiniCalendar() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  // April 2026 starts on Wednesday (index 3)
  const offset = 3;
  const totalDays = 30;
  const eventDays = [5, 11, 12, 18, 22, 25, 29];
  const today = 2;

  const cells = Array.from({ length: offset }, (_, i) => (
    <div key={`e-${i}`} />
  ));

  for (let d = 1; d <= totalDays; d++) {
    const isToday = d === today;
    const hasEvent = eventDays.includes(d);

    cells.push(
      <div
        key={d}
        className={[
          "relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors sm:h-10",
          isToday
            ? "bg-brand font-bold text-text-inverse"
            : hasEvent
              ? "bg-brand-50 font-medium text-brand-dark"
              : "text-text-secondary hover:bg-surface-tertiary",
        ].join(" ")}
      >
        {d}
        {hasEvent && !isToday && (
          <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" />
        )}
      </div>,
    );
  }

  return (
    <div>
      <div className="mb-3 text-center text-sm font-semibold text-text-primary">
        April 2026
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <div
            key={d}
            className="flex h-8 items-center justify-center text-xs font-medium text-text-muted"
          >
            {d}
          </div>
        ))}
        {cells}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Upcoming Event Row                                                         */
/* -------------------------------------------------------------------------- */

interface EventPreviewProps {
  title: string;
  date: string;
  time: string;
  location: string;
  color: string;
}

function EventPreview({ title, date, time, location, color }: EventPreviewProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-secondary">
      <div
        className="mt-0.5 h-10 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-text-primary">{title}</div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location}
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Events Page                                                                */
/* -------------------------------------------------------------------------- */

const SAMPLE_EVENTS: EventPreviewProps[] = [
  {
    title: "Cosmic Bowling Night",
    date: "Apr 5",
    time: "8:00 PM",
    location: "Sunset Lanes",
    color: "#a855f7",
  },
  {
    title: "Spring League Kickoff",
    date: "Apr 11",
    time: "6:30 PM",
    location: "Thunderbowl Lanes",
    color: "#8BC342",
  },
  {
    title: "Pro Shop Demo Day",
    date: "Apr 12",
    time: "10:00 AM",
    location: "Strike Zone Pro Shop",
    color: "#f97316",
  },
  {
    title: "Youth Bowling Clinic",
    date: "Apr 18",
    time: "9:00 AM",
    location: "Community Bowl",
    color: "#3b82f6",
  },
  {
    title: "Friday Night Thunder",
    date: "Apr 22",
    time: "9:00 PM",
    location: "Bowlero",
    color: "#ef4444",
  },
];

export default function EventsPage() {
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
          <CalendarDays className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Events
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Browse upcoming bowling events near you. Cosmic bowling, league
          kickoffs, pro shop events, and more.
        </p>
      </div>

      {/* Preview Area */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Calendar */}
          <div className="rounded-xl border border-border bg-surface-secondary p-4">
            <MiniCalendar />
            <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
              <span className="inline-block h-2 w-2 rounded-full bg-brand" />
              <span>{5} events this month</span>
            </div>
          </div>

          {/* Event List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Upcoming Events
            </h3>
            {SAMPLE_EVENTS.map((evt) => (
              <EventPreview key={evt.title} {...evt} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
