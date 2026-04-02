"use client";

import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  ChevronRight,
  Smartphone,
  Globe,
  Lock,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Setting Section Card                                                       */
/* -------------------------------------------------------------------------- */

interface SettingSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  items: string[];
  color: string;
  bgColor: string;
}

function SettingSection({
  icon: Icon,
  title,
  description,
  items,
  color,
  bgColor,
}: SettingSectionProps) {
  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgColor}`}
          >
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand-dark">
                Coming Soon
              </span>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">{description}</p>
          </div>
        </div>
      </div>

      {/* Setting items */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-secondary"
          >
            <span className="text-sm text-text-secondary">{item}</span>
            <ChevronRight className="h-4 w-4 text-text-muted opacity-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Settings Page                                                              */
/* -------------------------------------------------------------------------- */

const SETTING_SECTIONS: SettingSectionProps[] = [
  {
    icon: User,
    title: "Account",
    description: "Manage your profile, email, and login credentials",
    color: "text-info",
    bgColor: "bg-info-light",
    items: [
      "Edit Profile",
      "Change Email",
      "Change Password",
      "Connected Accounts",
      "Delete Account",
    ],
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Control how and when you receive alerts",
    color: "text-warning",
    bgColor: "bg-warning-light",
    items: [
      "Push Notifications",
      "Email Notifications",
      "Game Reminders",
      "Tournament Alerts",
      "Social Activity",
    ],
  },
  {
    icon: Shield,
    title: "Privacy",
    description: "Control who can see your profile and activity",
    color: "text-error",
    bgColor: "bg-error-light",
    items: [
      "Profile Visibility",
      "Activity Status",
      "Score Sharing",
      "Blocked Users",
      "Data Export",
    ],
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize how the app looks and feels",
    color: "text-nav-active",
    bgColor: "bg-nav-active-bg",
    items: [
      "Theme (Light / Dark)",
      "Accent Color",
      "Compact Mode",
      "Font Size",
    ],
  },
];

export default function SettingsPage() {
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
          <Settings className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Settings
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Manage your account, notifications, privacy, and preferences.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="relative">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand/0 via-brand/5 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative grid gap-4 sm:grid-cols-2">
          {SETTING_SECTIONS.map((section) => (
            <SettingSection key={section.title} {...section} />
          ))}
        </div>
      </div>

      {/* Additional quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Smartphone, label: "App Version", desc: "v1.0.0 (Build 1)" },
          { icon: Globe, label: "Language", desc: "English (US)" },
          { icon: Lock, label: "Two-Factor Auth", desc: "Not configured" },
        ].map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs"
          >
            <f.icon className="h-5 w-5 shrink-0 text-text-muted" />
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
