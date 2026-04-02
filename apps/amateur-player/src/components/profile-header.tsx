"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  BadgeCheck,
  UserPlus,
  UserCheck,
  MessageCircle,
  Pencil,
  X,
  Loader2,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ProfileUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  is_pro: boolean;
}

export interface ProfileMedia {
  profile_picture_url: string | null;
  cover_picture_url: string | null;
  intro_video_url: string | null;
}

export interface ProfileData {
  user: ProfileUser;
  gender: { value: string; is_public: boolean; is_added: boolean };
  birthdate: { date_of_birth: string | null; date_str: string; age: number; is_public: boolean; is_added: boolean };
  address: { location: { address: string }; is_public: boolean; is_added: boolean };
  home_center: { center_name: string; is_public: boolean; is_added: boolean };
  ball_handling_style: {
    handedness: string;
    ball_carry: string;
    grip: string;
    description: string;
    is_public: boolean;
  };
  bio: { content: string; is_public: boolean; is_added: boolean };
  nickname: { name: string; is_public: boolean; is_added: boolean };
  profile_media: ProfileMedia;
  follower_count: number;
  following_count: number;
  completion_percentage: number;
  is_complete: boolean;
  /* Present only on other-user profiles */
  is_following?: boolean;
  can_follow?: boolean;
}

export interface FollowUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url?: string | null;
}

interface ProfileHeaderProps {
  profile: ProfileData;
  isOwn: boolean;
  onFollowToggle?: () => void;
  followLoading?: boolean;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

/* -------------------------------------------------------------------------- */
/*  Follower / Following Modal                                                 */
/* -------------------------------------------------------------------------- */

function FollowListModal({
  title,
  onClose,
}: {
  title: "Followers" | "Following";
  onClose: () => void;
}) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const endpoint = title === "Followers" ? "/api/followers" : "/api/followings";
    const token = localStorage.getItem("access_token");

    fetch(`${BASE_URL}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.results ?? data.data ?? []);
      })
      .catch(() => setError("Could not load " + title.toLowerCase()))
      .finally(() => setLoading(false));
  }, [title]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          )}

          {error && (
            <p className="py-8 text-center text-sm text-text-muted">{error}</p>
          )}

          {!loading && !error && users.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">
              No {title.toLowerCase()} yet.
            </p>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="space-y-3">
              {users.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-secondary"
                >
                  {u.profile_picture_url ? (
                    <img
                      src={u.profile_picture_url}
                      alt={u.first_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-text-inverse">
                      {u.first_name?.[0]}
                      {u.last_name?.[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text-primary">
                      {u.first_name} {u.last_name}
                    </div>
                    <div className="truncate text-xs text-text-muted">
                      @{u.username}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Profile Header                                                             */
/* -------------------------------------------------------------------------- */

export default function ProfileHeader({
  profile,
  isOwn,
  onFollowToggle,
  followLoading,
}: ProfileHeaderProps) {
  const [followModal, setFollowModal] = useState<
    "Followers" | "Following" | null
  >(null);

  const displayName = `${profile.user.first_name} ${profile.user.last_name}`;
  const initials = `${profile.user.first_name?.[0] ?? ""}${profile.user.last_name?.[0] ?? ""}`;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {/* ---- Cover Photo ---- */}
        <div className="relative h-36 w-full sm:h-48">
          {profile.profile_media.cover_picture_url ? (
            <img
              src={profile.profile_media.cover_picture_url}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand via-brand-dark to-brand-darker" />
          )}
        </div>

        {/* ---- Profile Info Section ---- */}
        <div className="relative px-4 pb-5 sm:px-6">
          {/* Profile Picture — overlaps cover bottom edge */}
          <div className="-mt-14 mb-3 flex items-end justify-between sm:-mt-16">
            <div className="shrink-0">
              {profile.profile_media.profile_picture_url ? (
                <img
                  src={profile.profile_media.profile_picture_url}
                  alt={displayName}
                  className="h-24 w-24 rounded-full border-4 border-surface object-cover shadow-md sm:h-[120px] sm:w-[120px]"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-brand text-2xl font-bold text-text-inverse shadow-md sm:h-[120px] sm:w-[120px] sm:text-3xl">
                  {initials}
                </div>
              )}
            </div>

            {/* Action Buttons — top right on mobile, beside avatar on desktop */}
            <div className="flex items-center gap-2 pt-16 sm:pt-18">
              {isOwn ? (
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  <Pencil size={16} />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </Link>
              ) : (
                <>
                  {profile.can_follow !== false && (
                    <button
                      onClick={onFollowToggle}
                      disabled={followLoading}
                      className={[
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                        profile.is_following
                          ? "border border-brand bg-surface text-brand hover:border-error hover:text-error"
                          : "bg-brand text-text-inverse hover:bg-brand-dark",
                        followLoading ? "opacity-60" : "",
                      ].join(" ")}
                    >
                      {followLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : profile.is_following ? (
                        <UserCheck size={16} />
                      ) : (
                        <UserPlus size={16} />
                      )}
                      {profile.is_following ? "Following" : "Follow"}
                    </button>
                  )}
                  <Link
                    href="/messages"
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                  >
                    <MessageCircle size={16} />
                    <span className="hidden sm:inline">Message</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Name + Username */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
                {displayName}
              </h1>
              {profile.user.is_pro && (
                <span className="flex items-center gap-1 rounded-full bg-nav-active-bg px-2.5 py-0.5 text-xs font-semibold text-nav-active">
                  <BadgeCheck size={14} />
                  PRO
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted">@{profile.user.username}</p>
          </div>

          {/* Bio */}
          {profile.bio.is_added && profile.bio.content && (
            <p className="mb-3 text-sm leading-relaxed text-text-secondary">
              {profile.bio.content}
            </p>
          )}

          {/* Meta row: home center */}
          {profile.home_center.is_added && profile.home_center.is_public && (
            <div className="mb-3 flex items-center gap-1.5 text-sm text-text-muted">
              <MapPin size={14} className="shrink-0" />
              <span>{profile.home_center.center_name}</span>
            </div>
          )}

          {/* XP Level Bar */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-text-secondary">
                Profile Level
              </span>
              <span className="font-semibold text-brand">
                {profile.completion_percentage}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-tertiary">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
                style={{ width: `${profile.completion_percentage}%` }}
              />
            </div>
          </div>

          {/* Follower / Following counts */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFollowModal("Followers")}
              className="group text-sm transition-colors hover:text-brand"
            >
              <span className="font-bold text-text-primary group-hover:text-brand">
                {formatCount(profile.follower_count)}
              </span>{" "}
              <span className="text-text-muted group-hover:text-brand">
                Followers
              </span>
            </button>
            <button
              onClick={() => setFollowModal("Following")}
              className="group text-sm transition-colors hover:text-brand"
            >
              <span className="font-bold text-text-primary group-hover:text-brand">
                {formatCount(profile.following_count)}
              </span>{" "}
              <span className="text-text-muted group-hover:text-brand">
                Following
              </span>
            </button>
          </div>
        </div>

        {/* ---- Profile Completion Banner (own profile only) ---- */}
        {isOwn && !profile.is_complete && (
          <div className="border-t border-border bg-brand-50 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-brand-darker">
                  Your profile is {profile.completion_percentage}% complete
                </p>
                <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-brand-lighter">
                  <div
                    className="h-full rounded-full bg-brand-dark transition-all duration-500"
                    style={{ width: `${profile.completion_percentage}%` }}
                  />
                </div>
              </div>
              <Link
                href="/profile/edit"
                className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-dark"
              >
                Complete your profile
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ---- Follow List Modal ---- */}
      {followModal && (
        <FollowListModal
          title={followModal}
          onClose={() => setFollowModal(null)}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
