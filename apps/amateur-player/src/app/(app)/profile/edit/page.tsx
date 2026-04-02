"use client";

import { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Save,
  Upload,
  User,
  AlertCircle,
} from "lucide-react";
import type { ProfileData } from "@/components/profile-header";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** Generic POST helper with auth + 401 redirect. */
async function apiPost(
  path: string,
  body: Record<string, unknown>,
  router: ReturnType<typeof useRouter>,
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const token = getToken();
  if (!token) {
    router.push("/signin");
    return { ok: false, error: "Not authenticated" };
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    router.push("/signin");
    return { ok: false, error: "Session expired" };
  }

  if (!res.ok) {
    let msg = "Something went wrong";
    try {
      const err = await res.json();
      msg = err.detail ?? err.message ?? msg;
    } catch {
      /* ignore parse errors */
    }
    return { ok: false, error: msg };
  }

  try {
    const data = await res.json();
    return { ok: true, data };
  } catch {
    return { ok: true };
  }
}

/* -------------------------------------------------------------------------- */
/*  Section save-state type                                                    */
/* -------------------------------------------------------------------------- */

type SaveState = "idle" | "saving" | "success" | "error";

function useSaveState(): [SaveState, (s: SaveState) => void] {
  const [state, setState] = useState<SaveState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = useCallback((s: SaveState) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState(s);
    if (s === "success" || s === "error") {
      timerRef.current = setTimeout(() => setState("idle"), 2500);
    }
  }, []);

  return [state, set];
}

/* -------------------------------------------------------------------------- */
/*  Reusable UI pieces                                                         */
/* -------------------------------------------------------------------------- */

/** Privacy toggle: Public / Private */
function PrivacyToggle({
  isPublic,
  onChange,
}: {
  isPublic: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!isPublic)}
      className="group flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-surface-secondary"
    >
      {isPublic ? (
        <>
          <Eye size={13} className="text-brand" />
          <span className="text-brand">Public</span>
        </>
      ) : (
        <>
          <EyeOff size={13} className="text-text-muted" />
          <span className="text-text-muted">Private</span>
        </>
      )}
    </button>
  );
}

/** Save button with state feedback */
function SaveButton({
  state,
  onClick,
  label = "Save",
}: {
  state: SaveState;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "saving"}
      className={[
        "flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200",
        state === "success"
          ? "bg-success text-white"
          : state === "error"
            ? "bg-error text-white"
            : "bg-brand text-text-inverse hover:bg-brand-dark",
        state === "saving" ? "opacity-70" : "",
      ].join(" ")}
    >
      {state === "saving" && <Loader2 size={15} className="animate-spin" />}
      {state === "success" && <Check size={15} />}
      {state === "error" && <AlertCircle size={15} />}
      {state === "idle" && <Save size={15} />}
      {state === "saving"
        ? "Saving..."
        : state === "success"
          ? "Saved!"
          : state === "error"
            ? "Failed"
            : label}
    </button>
  );
}

/** Inline toast under save button */
function InlineMessage({
  state,
  successText,
  errorText,
}: {
  state: SaveState;
  successText: string;
  errorText: string;
}) {
  if (state === "idle" || state === "saving") return null;
  return (
    <p
      className={[
        "mt-2 text-xs font-medium transition-opacity",
        state === "success" ? "text-success" : "text-error",
      ].join(" ")}
    >
      {state === "success" ? successText : errorText}
    </p>
  );
}

/** Section card wrapper */
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border bg-surface-secondary px-5 py-3.5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          {title}
        </h2>
      </div>
      <div className="space-y-6 p-5">{children}</div>
    </section>
  );
}

/** Label wrapper */
function FieldLabel({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-text-secondary">
      {label}
      {children}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image upload helper                                                        */
/* -------------------------------------------------------------------------- */

async function uploadImage(
  file: File,
  profileEndpoint: string,
  router: ReturnType<typeof useRouter>,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const token = getToken();
  if (!token) {
    router.push("/signin");
    return { ok: false, error: "Not authenticated" };
  }

  /* 1. Initiate upload */
  const initRes = await fetch(
    `${BASE_URL}/api/cloud/upload/singlepart/requests/initiate`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ file_name: file.name, bucket: "cdn" }),
    },
  );

  if (initRes.status === 401) {
    router.push("/signin");
    return { ok: false, error: "Session expired" };
  }
  if (!initRes.ok) return { ok: false, error: "Failed to initiate upload" };

  const { presigned_url, public_url } = await initRes.json();

  /* 2. PUT the file to the presigned URL */
  const putRes = await fetch(presigned_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!putRes.ok) return { ok: false, error: "Failed to upload file" };

  /* 3. Save the URL to the profile endpoint */
  const saveRes = await apiPost(profileEndpoint, { url: public_url }, router);
  if (!saveRes.ok) return { ok: false, error: saveRes.error ?? "Failed to save" };

  return { ok: true, url: public_url };
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton                                                           */
/* -------------------------------------------------------------------------- */

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-0">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-pulse rounded bg-surface-tertiary" />
        <div className="h-6 w-40 animate-pulse rounded bg-surface-tertiary" />
      </div>

      {/* Progress bar skeleton */}
      <div className="animate-pulse rounded-xl border border-border bg-surface p-5">
        <div className="mb-2 h-4 w-48 rounded bg-surface-tertiary" />
        <div className="h-3 w-full rounded-full bg-surface-tertiary" />
      </div>

      {/* Section skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div className="border-b border-border bg-surface-secondary px-5 py-3.5">
            <div className="h-4 w-32 rounded bg-surface-tertiary" />
          </div>
          <div className="space-y-4 p-5">
            <div className="h-10 w-full rounded-lg bg-surface-tertiary" />
            <div className="h-10 w-3/4 rounded-lg bg-surface-tertiary" />
            <div className="h-9 w-24 rounded-lg bg-surface-tertiary" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function EditProfilePage() {
  const router = useRouter();

  /* ---- Global state ---- */
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  /* ---- Profile media ---- */
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const profilePicRef = useRef<HTMLInputElement>(null);
  const coverPicRef = useRef<HTMLInputElement>(null);
  const [profilePicState, setProfilePicState] = useSaveState();
  const [coverPicState, setCoverPicState] = useSaveState();
  const [profilePicError, setProfilePicError] = useState("");
  const [coverPicError, setCoverPicError] = useState("");

  /* ---- Bio ---- */
  const [bioContent, setBioContent] = useState("");
  const [bioPublic, setBioPublic] = useState(true);
  const [bioState, setBioState] = useSaveState();
  const [bioError, setBioError] = useState("");

  /* ---- Nickname ---- */
  const [nickname, setNickname] = useState("");
  const [nicknamePublic, setNicknamePublic] = useState(true);
  const [nicknameState, setNicknameState] = useSaveState();
  const [nicknameError, setNicknameError] = useState("");

  /* ---- Gender ---- */
  const [gender, setGender] = useState("");
  const [genderPublic, setGenderPublic] = useState(true);
  const [genderState, setGenderState] = useSaveState();
  const [genderError, setGenderError] = useState("");

  /* ---- Birthdate ---- */
  const [birthdate, setBirthdate] = useState("");
  const [birthdatePublic, setBirthdatePublic] = useState(true);
  const [birthdateState, setBirthdateState] = useSaveState();
  const [birthdateError, setBirthdateError] = useState("");

  /* ---- Address ---- */
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addressPublic, setAddressPublic] = useState(true);
  const [addressState, setAddressState] = useSaveState();
  const [addressError, setAddressError] = useState("");

  /* ---- Ball handling style ---- */
  const [handedness, setHandedness] = useState("");
  const [ballCarry, setBallCarry] = useState("");
  const [grip, setGrip] = useState("");
  const [ballStylePublic, setBallStylePublic] = useState(true);
  const [ballStyleState, setBallStyleState] = useSaveState();
  const [ballStyleError, setBallStyleError] = useState("");

  /* ---- Home center ---- */
  const [centerName, setCenterName] = useState("");
  const [centerId, setCenterId] = useState<number | "">("");
  const [centerPublic, setCenterPublic] = useState(true);
  const [centerState, setCenterState] = useSaveState();
  const [centerError, setCenterError] = useState("");

  /* ---- Contact info ---- */
  const [contactPublic, setContactPublic] = useState(true);
  const [contactState, setContactState] = useSaveState();
  const [contactError, setContactError] = useState("");

  /* ---- Coach status ---- */
  const [isCoach, setIsCoach] = useState(false);
  const [coachState, setCoachState] = useSaveState();
  const [coachError, setCoachError] = useState("");

  /* ---- Fetch profile ---- */
  useEffect(() => {
    async function load() {
      const token = getToken();
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

        const data: ProfileData & {
          contact_info?: { is_public: boolean };
          critical_info?: { is_coach: boolean };
          home_center: ProfileData["home_center"] & { center_id?: number };
          address: ProfileData["address"] & {
            location: { address: string; zip_code?: string };
          };
        } = await res.json();

        setProfile(data);

        /* Populate form fields */
        setProfilePicPreview(data.profile_media.profile_picture_url);
        setCoverPreview(data.profile_media.cover_picture_url);

        setBioContent(data.bio.content ?? "");
        setBioPublic(data.bio.is_public);

        setNickname(data.nickname.name ?? "");
        setNicknamePublic(data.nickname.is_public);

        setGender(data.gender.value ?? "");
        setGenderPublic(data.gender.is_public);

        setBirthdate(data.birthdate.date_str ?? "");
        setBirthdatePublic(data.birthdate.is_public);

        setAddress(data.address?.location?.address ?? "");
        setZipCode(data.address?.location?.zip_code ?? "");
        setAddressPublic(data.address?.is_public ?? true);

        setHandedness(data.ball_handling_style.handedness ?? "");
        setBallCarry(data.ball_handling_style.ball_carry ?? "");
        setGrip(data.ball_handling_style.grip ?? "");
        setBallStylePublic(data.ball_handling_style.is_public);

        setCenterName(data.home_center.center_name ?? "");
        setCenterId(data.home_center.center_id ?? "");
        setCenterPublic(data.home_center.is_public);

        setContactPublic(data.contact_info?.is_public ?? true);
        setIsCoach(data.critical_info?.is_coach ?? false);
      } catch {
        setFetchError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  /* ---- Image change handlers ---- */
  const handleProfilePicChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePicPreview(URL.createObjectURL(file));
    setProfilePicState("saving");
    setProfilePicError("");

    const result = await uploadImage(file, "/api/profile/profile-picture", router);
    if (result.ok) {
      setProfilePicState("success");
      if (result.url) setProfilePicPreview(result.url);
    } else {
      setProfilePicState("error");
      setProfilePicError(result.error ?? "Upload failed");
    }
  };

  const handleCoverPicChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
    setCoverPicState("saving");
    setCoverPicError("");

    const result = await uploadImage(file, "/api/profile/cover-picture", router);
    if (result.ok) {
      setCoverPicState("success");
      if (result.url) setCoverPreview(result.url);
    } else {
      setCoverPicState("error");
      setCoverPicError(result.error ?? "Upload failed");
    }
  };

  /* ---- Section save handlers ---- */
  const saveBio = async () => {
    setBioState("saving");
    setBioError("");
    const r = await apiPost("/api/profile/bio", { content: bioContent, is_public: bioPublic }, router);
    if (r.ok) setBioState("success");
    else {
      setBioState("error");
      setBioError(r.error ?? "Failed to save bio");
    }
  };

  const saveNickname = async () => {
    setNicknameState("saving");
    setNicknameError("");
    const r = await apiPost("/api/profile/nickname", { name: nickname, is_public: nicknamePublic }, router);
    if (r.ok) setNicknameState("success");
    else {
      setNicknameState("error");
      setNicknameError(r.error ?? "Failed to save nickname");
    }
  };

  const saveGender = async () => {
    setGenderState("saving");
    setGenderError("");
    const r = await apiPost("/api/profile/gender", { value: gender, is_public: genderPublic }, router);
    if (r.ok) setGenderState("success");
    else {
      setGenderState("error");
      setGenderError(r.error ?? "Failed to save gender");
    }
  };

  const saveBirthdate = async () => {
    setBirthdateState("saving");
    setBirthdateError("");
    const r = await apiPost("/api/profile/birthdate", { date_of_birth: birthdate, is_public: birthdatePublic }, router);
    if (r.ok) setBirthdateState("success");
    else {
      setBirthdateState("error");
      setBirthdateError(r.error ?? "Failed to save birthdate");
    }
  };

  const saveAddress = async () => {
    setAddressState("saving");
    setAddressError("");
    const r = await apiPost("/api/profile/address", { address, zip_code: zipCode, is_public: addressPublic }, router);
    if (r.ok) setAddressState("success");
    else {
      setAddressState("error");
      setAddressError(r.error ?? "Failed to save address");
    }
  };

  const saveBallStyle = async () => {
    setBallStyleState("saving");
    setBallStyleError("");
    const r = await apiPost("/api/profile/ball-handling-style", { handedness, ball_carry: ballCarry, grip, is_public: ballStylePublic }, router);
    if (r.ok) setBallStyleState("success");
    else {
      setBallStyleState("error");
      setBallStyleError(r.error ?? "Failed to save ball handling style");
    }
  };

  const saveHomeCenter = async () => {
    setCenterState("saving");
    setCenterError("");
    const r = await apiPost("/api/profile/home-center", { center_id: centerId || undefined, center_name: centerName, is_public: centerPublic }, router);
    if (r.ok) setCenterState("success");
    else {
      setCenterState("error");
      setCenterError(r.error ?? "Failed to save home center");
    }
  };

  const saveContactInfo = async () => {
    setContactState("saving");
    setContactError("");
    const r = await apiPost("/api/profile/contact-info", { is_public: contactPublic }, router);
    if (r.ok) setContactState("success");
    else {
      setContactState("error");
      setContactError(r.error ?? "Failed to save contact info");
    }
  };

  const saveCoachStatus = async () => {
    setCoachState("saving");
    setCoachError("");
    const r = await apiPost("/api/profile/critical-info", { is_coach: isCoach }, router);
    if (r.ok) setCoachState("success");
    else {
      setCoachState("error");
      setCoachError(r.error ?? "Failed to save coach status");
    }
  };

  /* ---- Loading / Error states ---- */
  if (loading) return <LoadingSkeleton />;

  if (fetchError || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-0">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16 shadow-sm">
          <AlertCircle className="mb-4 h-12 w-12 text-error" />
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            Failed to load profile
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            {fetchError || "An unexpected error occurred."}
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

  /* ---- Shared input classes ---- */
  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-input placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand/20";
  const selectClass =
    "w-full appearance-none rounded-lg border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text-input transition-colors focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand/20";

  /* ---- Render ---- */
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
          Edit Profile
        </h1>
      </div>

      {/* Completion bar */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">
            Profile Completion
          </span>
          <span className="text-sm font-bold text-brand">
            {profile.completion_percentage}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-surface-tertiary">
          <div
            className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
            style={{ width: `${profile.completion_percentage}%` }}
          />
        </div>
        {!profile.is_complete && (
          <p className="mt-2 text-xs text-text-muted">
            Fill in more fields below to boost your profile completion.
          </p>
        )}
      </div>

      {/* ================================================================== */}
      {/*  Section 1: Profile Media                                          */}
      {/* ================================================================== */}
      <SectionCard title="Profile Media">
        {/* Profile Picture */}
        <div>
          <FieldLabel label="Profile Picture" />
          <div className="mt-2 flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
              {profilePicPreview ? (
                <img
                  src={profilePicPreview}
                  alt="Profile"
                  className="h-full w-full rounded-full border-2 border-border object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-border bg-surface-secondary">
                  <User size={32} className="text-text-muted" />
                </div>
              )}
              {profilePicState === "saving" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <Loader2 size={24} className="animate-spin text-white" />
                </div>
              )}
              {profilePicState === "success" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                  <Check size={24} className="text-white" />
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => profilePicRef.current?.click()}
                disabled={profilePicState === "saving"}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:opacity-50"
              >
                <Camera size={15} />
                Change Photo
              </button>
              <input
                ref={profilePicRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
              <InlineMessage
                state={profilePicState}
                successText="Profile picture updated!"
                errorText={profilePicError || "Upload failed"}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Cover Photo */}
        <div>
          <FieldLabel label="Cover Photo" />
          <div className="mt-2">
            <div className="relative h-36 w-full overflow-hidden rounded-xl border-2 border-dashed border-border sm:h-44">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-surface-secondary">
                  <ImagePlus size={32} className="mb-2 text-text-muted" />
                  <span className="text-xs text-text-muted">
                    No cover photo
                  </span>
                </div>
              )}
              {coverPicState === "saving" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 size={28} className="animate-spin text-white" />
                </div>
              )}
              {coverPicState === "success" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Check size={28} className="text-white" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => coverPicRef.current?.click()}
              disabled={coverPicState === "saving"}
              className="mt-3 flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:opacity-50"
            >
              <Upload size={15} />
              Change Cover
            </button>
            <input
              ref={coverPicRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPicChange}
            />
            <InlineMessage
              state={coverPicState}
              successText="Cover photo updated!"
              errorText={coverPicError || "Upload failed"}
            />
          </div>
        </div>
      </SectionCard>

      {/* ================================================================== */}
      {/*  Section 2: Basic Info                                             */}
      {/* ================================================================== */}
      <SectionCard title="Basic Info">
        {/* Bio */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel label="Bio" />
            <PrivacyToggle isPublic={bioPublic} onChange={setBioPublic} />
          </div>
          <textarea
            value={bioContent}
            onChange={(e) => setBioContent(e.target.value.slice(0, 280))}
            placeholder="Tell people about yourself..."
            maxLength={280}
            rows={3}
            className={`${inputClass} resize-none`}
          />
          <div className="mt-1 flex items-center justify-between">
            <InlineMessage
              state={bioState}
              successText="Bio updated!"
              errorText={bioError || "Failed to save"}
            />
            <span className="text-xs text-text-muted">
              {bioContent.length}/280
            </span>
          </div>
          <div className="mt-3 flex justify-end">
            <SaveButton state={bioState} onClick={saveBio} label="Save Bio" />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Nickname */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel label="Nickname" />
            <PrivacyToggle isPublic={nicknamePublic} onChange={setNicknamePublic} />
          </div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your nickname"
            className={inputClass}
          />
          <InlineMessage
            state={nicknameState}
            successText="Nickname updated!"
            errorText={nicknameError || "Failed to save"}
          />
          <div className="mt-3 flex justify-end">
            <SaveButton
              state={nicknameState}
              onClick={saveNickname}
              label="Save Nickname"
            />
          </div>
        </div>
      </SectionCard>

      {/* ================================================================== */}
      {/*  Section 3: Personal Details                                       */}
      {/* ================================================================== */}
      <SectionCard title="Personal Details">
        {/* Gender */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel label="Gender" />
            <PrivacyToggle isPublic={genderPublic} onChange={setGenderPublic} />
          </div>
          <div className="relative">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={selectClass}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
          </div>
          <InlineMessage
            state={genderState}
            successText="Gender updated!"
            errorText={genderError || "Failed to save"}
          />
          <div className="mt-3 flex justify-end">
            <SaveButton
              state={genderState}
              onClick={saveGender}
              label="Save Gender"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Birthdate */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel label="Birthdate" />
            <PrivacyToggle
              isPublic={birthdatePublic}
              onChange={setBirthdatePublic}
            />
          </div>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className={inputClass}
          />
          <InlineMessage
            state={birthdateState}
            successText="Birthdate updated!"
            errorText={birthdateError || "Failed to save"}
          />
          <div className="mt-3 flex justify-end">
            <SaveButton
              state={birthdateState}
              onClick={saveBirthdate}
              label="Save Birthdate"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Address */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel label="Address" />
            <PrivacyToggle
              isPublic={addressPublic}
              onChange={setAddressPublic}
            />
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              className={inputClass}
            />
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Zip code"
              className={inputClass}
            />
          </div>
          <InlineMessage
            state={addressState}
            successText="Address updated!"
            errorText={addressError || "Failed to save"}
          />
          <div className="mt-3 flex justify-end">
            <SaveButton
              state={addressState}
              onClick={saveAddress}
              label="Save Address"
            />
          </div>
        </div>
      </SectionCard>

      {/* ================================================================== */}
      {/*  Section 4: Bowling Info                                           */}
      {/* ================================================================== */}
      <SectionCard title="Bowling Info">
        {/* Ball Handling Style */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel label="Ball Handling Style" />
            <PrivacyToggle
              isPublic={ballStylePublic}
              onChange={setBallStylePublic}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Handedness */}
            <div>
              <span className="mb-1 block text-xs font-medium text-text-muted">
                Handedness
              </span>
              <div className="relative">
                <select
                  value={handedness}
                  onChange={(e) => setHandedness(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select</option>
                  <option value="Lefty">Lefty</option>
                  <option value="Righty">Righty</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
              </div>
            </div>

            {/* Ball Carry */}
            <div>
              <span className="mb-1 block text-xs font-medium text-text-muted">
                Ball Carry
              </span>
              <div className="relative">
                <select
                  value={ballCarry}
                  onChange={(e) => setBallCarry(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select</option>
                  <option value="One handed">One handed</option>
                  <option value="Two handed">Two handed</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
              </div>
            </div>

            {/* Grip */}
            <div>
              <span className="mb-1 block text-xs font-medium text-text-muted">
                Grip
              </span>
              <div className="relative">
                <select
                  value={grip}
                  onChange={(e) => setGrip(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select</option>
                  <option value="With Thumb">With Thumb</option>
                  <option value="With No Thumb">With No Thumb</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
              </div>
            </div>
          </div>
          <InlineMessage
            state={ballStyleState}
            successText="Ball handling style updated!"
            errorText={ballStyleError || "Failed to save"}
          />
          <div className="mt-3 flex justify-end">
            <SaveButton
              state={ballStyleState}
              onClick={saveBallStyle}
              label="Save Style"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Home Center */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel label="Home Center" />
            <PrivacyToggle isPublic={centerPublic} onChange={setCenterPublic} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              placeholder="Center name"
              className={inputClass}
            />
            <input
              type="number"
              value={centerId}
              onChange={(e) =>
                setCenterId(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="Center ID (optional)"
              className={inputClass}
            />
          </div>
          <InlineMessage
            state={centerState}
            successText="Home center updated!"
            errorText={centerError || "Failed to save"}
          />
          <div className="mt-3 flex justify-end">
            <SaveButton
              state={centerState}
              onClick={saveHomeCenter}
              label="Save Center"
            />
          </div>
        </div>
      </SectionCard>

      {/* ================================================================== */}
      {/*  Section 5: Other                                                  */}
      {/* ================================================================== */}
      <SectionCard title="Other">
        {/* Contact Info */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <FieldLabel label="Contact Info Visibility" />
              <p className="mt-0.5 text-xs text-text-muted">
                Controls whether your email address is visible to other users.
              </p>
            </div>
            <PrivacyToggle
              isPublic={contactPublic}
              onChange={setContactPublic}
            />
          </div>
          {profile.user && (
            <p className="mt-2 text-sm text-text-secondary">
              Email shown on profile:{" "}
              <span className="font-medium text-text-primary">
                {(profile.user as ProfileData["user"] & { email?: string }).email ?? "Not available"}
              </span>
            </p>
          )}
          <InlineMessage
            state={contactState}
            successText="Contact visibility updated!"
            errorText={contactError || "Failed to save"}
          />
          <div className="mt-3 flex justify-end">
            <SaveButton
              state={contactState}
              onClick={saveContactInfo}
              label="Save"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Coach Status */}
        <div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isCoach}
                onChange={(e) => setIsCoach(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full border border-border bg-surface-tertiary transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-brand/20" />
            </label>
            <div>
              <span className="text-sm font-medium text-text-primary">
                I am a coach
              </span>
              <p className="text-xs text-text-muted">
                Enable this if you offer bowling coaching services.
              </p>
            </div>
          </div>
          <InlineMessage
            state={coachState}
            successText="Coach status updated!"
            errorText={coachError || "Failed to save"}
          />
          <div className="mt-3 flex justify-end">
            <SaveButton
              state={coachState}
              onClick={saveCoachStatus}
              label="Save"
            />
          </div>
        </div>
      </SectionCard>

      {/* Bottom spacer for mobile nav */}
      <div className="h-4" />
    </div>
  );
}
