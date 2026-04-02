"use client";

import { Menu, Search, Bell } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface TopbarProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Topbar                                                                     */
/* -------------------------------------------------------------------------- */

export function Topbar({ sidebarCollapsed, onMobileMenuToggle }: TopbarProps) {
  return (
    <header
      className={[
        "fixed top-0 right-0 left-0 z-30 flex h-(--topbar-height) items-center",
        "border-b border-border bg-surface transition-[left] duration-200 ease-in-out",
        sidebarCollapsed
          ? "md:left-(--sidebar-collapsed-width)"
          : "md:left-(--sidebar-width)",
      ].join(" ")}
    >
      <div className="flex w-full items-center gap-4 px-4 md:px-6">
        {/* Left: Hamburger menu — mobile only */}
        <button
          onClick={onMobileMenuToggle}
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:hidden",
            "text-text-secondary transition-colors duration-150",
            "hover:bg-surface-tertiary hover:text-text-primary",
          ].join(" ")}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Center: Search bar */}
        <div className="relative flex flex-1 justify-center">
          <div className="relative w-full max-w-xl">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search BowlersNetwork..."
              className={[
                "h-10 w-full rounded-lg border border-border bg-surface-secondary",
                "pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted",
                "outline-none transition-all duration-150",
                "focus:border-brand focus:ring-2 focus:ring-brand/20",
              ].join(" ")}
            />
          </div>
        </div>

        {/* Right: Notifications + Avatar */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Notification bell */}
          <button
            className={[
              "relative flex h-9 w-9 items-center justify-center rounded-lg",
              "text-text-secondary transition-colors duration-150",
              "hover:bg-surface-tertiary hover:text-text-primary",
            ].join(" ")}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {/* Unread badge dot */}
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
          </button>

          {/* User avatar */}
          <button
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full",
              "bg-brand text-xs font-semibold text-white",
              "transition-shadow duration-150 hover:ring-2 hover:ring-brand/30",
            ].join(" ")}
            aria-label="User menu"
          >
            JD
          </button>
        </div>
      </div>
    </header>
  );
}
