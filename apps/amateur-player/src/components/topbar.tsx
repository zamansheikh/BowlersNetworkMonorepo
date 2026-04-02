"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, Search, Bell, LogOut, User } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface TopbarProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

type UserInfo = {
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
} | null;

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

/* -------------------------------------------------------------------------- */
/*  Topbar                                                                     */
/* -------------------------------------------------------------------------- */

export function Topbar({ sidebarCollapsed, onMobileMenuToggle }: TopbarProps) {
  const [user, setUser] = useState<UserInfo>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Fetch basic user info for the avatar */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser({
            first_name: data.user.first_name ?? "",
            last_name: data.user.last_name ?? "",
            profile_picture_url:
              data.profile_media?.profile_picture_url ?? null,
          });
        }
      })
      .catch(() => {});
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [menuOpen]);

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`
    : "";

  function handleLogout() {
    localStorage.removeItem("access_token");
    window.location.href = "/signin";
  }

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
          <Link
            href="/notifications"
            className={[
              "relative flex h-9 w-9 items-center justify-center rounded-lg",
              "text-text-secondary transition-colors duration-150",
              "hover:bg-surface-tertiary hover:text-text-primary",
            ].join(" ")}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
          </Link>

          {/* User avatar + dropdown */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full overflow-hidden",
                "transition-shadow duration-150 hover:ring-2 hover:ring-brand/30",
                user?.profile_picture_url
                  ? "ring-1 ring-border"
                  : "bg-brand text-xs font-semibold text-white",
              ].join(" ")}
              aria-label="User menu"
            >
              {user?.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials || <User size={16} />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-50 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
                {user && (
                  <div className="border-b border-border px-4 py-2.5">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
                >
                  <User size={16} />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/5"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
