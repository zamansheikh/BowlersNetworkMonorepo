"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "../../components/sidebar";
import { Topbar } from "../../components/topbar";

/* -------------------------------------------------------------------------- */
/*  App Layout — wraps all authenticated (app) routes                          */
/* -------------------------------------------------------------------------- */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = useCallback(() => setCollapsed((c) => !c), []);
  const handleMobileClose = useCallback(() => setMobileOpen(false), []);
  const handleMobileToggle = useCallback(() => setMobileOpen((o) => !o), []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      {/* Topbar */}
      <Topbar
        sidebarCollapsed={collapsed}
        onMobileMenuToggle={handleMobileToggle}
      />

      {/* Main content */}
      <main
        className={[
          "pt-(--topbar-height) transition-[margin-left] duration-200 ease-in-out",
          collapsed
            ? "md:ml-(--sidebar-collapsed-width)"
            : "md:ml-(--sidebar-width)",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
