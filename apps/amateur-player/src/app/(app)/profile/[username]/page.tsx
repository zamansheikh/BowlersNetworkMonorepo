"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, UserX } from "lucide-react";
import Link from "next/link";
import ProfileHeader, { type ProfileData } from "@/components/profile-header";
import ProfileTabs, { type TabKey } from "@/components/profile-tabs";

/* -------------------------------------------------------------------------- */
/*  Other User's Profile Page — /profile/[username]                            */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const username = params.username;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${BASE_URL}/api/profile/${username}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401) {
          router.push("/signin");
          return;
        }

        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Failed to load profile");

        const data: ProfileData = await res.json();

        /* If viewing own profile, redirect to /profile */
        const myToken = localStorage.getItem("access_token");
        if (myToken) {
          try {
            const myRes = await fetch(`${BASE_URL}/api/profile`, {
              headers: { Authorization: `Bearer ${myToken}` },
            });
            if (myRes.ok) {
              const myData = await myRes.json();
              if (myData.user?.username === username) {
                router.replace("/profile");
                return;
              }
            }
          } catch {
            /* Ignore — not critical */
          }
        }

        setProfile(data);
      } catch {
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (username) fetchProfile();
  }, [username, router]);

  /* ---- Follow Toggle ---- */
  const handleFollowToggle = useCallback(async () => {
    if (!profile) return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/signin");
      return;
    }

    setFollowLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/follow/${profile.user.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.status === 401) {
        router.push("/signin");
        return;
      }

      if (!res.ok) throw new Error("Follow action failed");

      const data: { is_following: boolean; follower_count: number } =
        await res.json();

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              is_following: data.is_following,
              follower_count: data.follower_count,
            }
          : prev,
      );
    } catch {
      /* Silently fail — could add toast later */
    } finally {
      setFollowLoading(false);
    }
  }, [profile, router]);

  /* ---- Loading Skeleton ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-0">
        {/* Back link placeholder */}
        <div className="h-4 w-28 animate-pulse rounded bg-surface-tertiary" />

        {/* Cover skeleton */}
        <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="h-36 w-full bg-surface-tertiary sm:h-48" />
          <div className="px-4 pb-5 sm:px-6">
            <div className="-mt-14 mb-4 flex items-end justify-between sm:-mt-16">
              <div className="h-24 w-24 rounded-full border-4 border-surface bg-surface-tertiary sm:h-[120px] sm:w-[120px]" />
              <div className="flex gap-2 pt-16">
                <div className="h-10 w-24 rounded-lg bg-surface-tertiary" />
                <div className="h-10 w-24 rounded-lg bg-surface-tertiary" />
              </div>
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

  /* ---- Not Found ---- */
  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-0">
        <Link
          href="/feed"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Back to Feed
        </Link>

        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16 shadow-sm">
          <UserX className="mb-4 h-12 w-12 text-text-muted" />
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            User not found
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            No user with the username &quot;{username}&quot; exists.
          </p>
          <Link
            href="/feed"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-dark"
          >
            Go to Feed
          </Link>
        </div>
      </div>
    );
  }

  /* ---- Error State ---- */
  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-0">
        <Link
          href="/feed"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Back to Feed
        </Link>

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

      <ProfileHeader
        profile={profile}
        isOwn={false}
        onFollowToggle={handleFollowToggle}
        followLoading={followLoading}
      />

      <ProfileTabs
        profile={profile}
        isOwn={false}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
