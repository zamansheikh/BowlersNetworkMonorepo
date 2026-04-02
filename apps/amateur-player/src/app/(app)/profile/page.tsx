"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import ProfileHeader, { type ProfileData } from "@/components/profile-header";
import ProfileTabs, { type TabKey } from "@/components/profile-tabs";

/* -------------------------------------------------------------------------- */
/*  Own Profile Page — /profile                                                */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

export default function MyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/signin");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          router.push("/signin");
          return;
        }

        if (!res.ok) throw new Error("Failed to load profile");

        const data: ProfileData = await res.json();
        setProfile(data);
      } catch {
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  /* ---- Loading Skeleton ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-0">
        {/* Cover skeleton */}
        <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="h-36 w-full bg-surface-tertiary sm:h-48" />
          <div className="px-4 pb-5 sm:px-6">
            <div className="-mt-14 mb-4 flex items-end justify-between sm:-mt-16">
              <div className="h-24 w-24 rounded-full border-4 border-surface bg-surface-tertiary sm:h-[120px] sm:w-[120px]" />
              <div className="h-10 w-28 rounded-lg bg-surface-tertiary" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-48 rounded bg-surface-tertiary" />
              <div className="h-3 w-28 rounded bg-surface-tertiary" />
              <div className="h-3 w-full max-w-sm rounded bg-surface-tertiary" />
              <div className="mt-3 h-2 w-full max-w-xs rounded-full bg-surface-tertiary" />
              <div className="mt-2 flex gap-4">
                <div className="h-4 w-24 rounded bg-surface-tertiary" />
                <div className="h-4 w-24 rounded bg-surface-tertiary" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex gap-4 border-b border-border px-4 py-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-16 rounded bg-surface-tertiary" />
            ))}
          </div>
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-surface-tertiary" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---- Error State ---- */
  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-0">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16 shadow-sm">
          <AlertCircle className="mb-4 h-12 w-12 text-error" />
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            Failed to load profile
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            {error || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ---- Profile ---- */
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-0">
      {/* Back link */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={16} />
        Back to Feed
      </Link>

      <ProfileHeader profile={profile} isOwn />

      <ProfileTabs
        profile={profile}
        isOwn
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
