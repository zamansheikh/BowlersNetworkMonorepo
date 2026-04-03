"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper,
  Target,
  BarChart3,
  Trophy,
  CalendarDays,
  Users,
  MessageSquare,
  Tag,
  Star,
  CreditCard,
  MessageCircle,
  Settings,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Navigation items                                                           */
/* -------------------------------------------------------------------------- */

const NAV_ITEMS: NavItem[] = [
  { label: "Feed", href: "/feed", icon: Newspaper },
  { label: "Games", href: "/games", icon: Target },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Media", href: "/media", icon: Play },
  { label: "Chatter", href: "/chatter", icon: MessageSquare },
  { label: "Brands", href: "/brands", icon: Tag },
  { label: "Pros", href: "/pros", icon: Star },
  { label: "Trading Cards", href: "/trading-cards", icon: CreditCard },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  /* Close mobile drawer on route change */
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* Close mobile drawer on Escape key */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) onMobileClose();
    },
    [mobileOpen, onMobileClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* Lock body scroll when mobile drawer is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* ---- Helpers ----------------------------------------------------------- */

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebarWidth = collapsed
    ? "var(--sidebar-collapsed-width)"
    : "var(--sidebar-width)";

  /* ---- Shared inner content --------------------------------------------- */

  const renderContent = (isMobile: boolean) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <div className="flex h-full flex-col">
        {/* Logo area */}
        <div className="flex h-(--topbar-height) shrink-0 items-center gap-3 border-b border-border px-5">
          <Image src="/logo.png" alt="BowlersNetwork" width={36} height={36} className="shrink-0 rounded-lg" />
          {!isCollapsed && (
            <span className="truncate text-base font-semibold text-text-primary transition-opacity duration-200">
              BowlersNetwork
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={[
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5",
                      "text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-nav-active-bg text-nav-active"
                        : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary",
                    ].join(" ")}
                  >
                    {/* Active left accent bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-0.75 -translate-y-1/2 rounded-r-full bg-nav-active" />
                    )}

                    <Icon
                      size={20}
                      className={[
                        "shrink-0 transition-colors duration-150",
                        active
                          ? "text-nav-active"
                          : "text-text-muted group-hover:text-text-secondary",
                      ].join(" ")}
                    />

                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <div className="shrink-0 border-t border-border p-3">
            <button
              onClick={onToggleCollapse}
              className={[
                "flex w-full items-center gap-2 rounded-lg px-3 py-2",
                "text-sm font-medium text-text-muted transition-colors duration-150",
                "hover:bg-surface-tertiary hover:text-text-secondary",
                isCollapsed ? "justify-center" : "",
              ].join(" ")}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <>
                  <ChevronLeft size={18} />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ---- Mobile overlay ------------------------------------------------ */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onMobileClose}
        aria-hidden
      />

      {/* ---- Mobile drawer ------------------------------------------------- */}
      <aside
        className={[
          "fixed left-0 top-0 z-50 h-full w-(--sidebar-width) bg-surface shadow-xl",
          "transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Mobile navigation"
      >
        {/* Close button inside drawer */}
        <button
          onClick={onMobileClose}
          className={[
            "absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-md",
            "text-text-muted transition-colors duration-150 hover:bg-surface-tertiary hover:text-text-primary",
          ].join(" ")}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
        {renderContent(true)}
      </aside>

      {/* ---- Desktop sidebar ----------------------------------------------- */}
      <aside
        className="fixed left-0 top-0 z-30 hidden h-full border-r border-border bg-surface md:block"
        style={{
          width: sidebarWidth,
          transition: "width 200ms ease-in-out",
        }}
        aria-label="Desktop navigation"
      >
        {renderContent(false)}
      </aside>
    </>
  );
}
