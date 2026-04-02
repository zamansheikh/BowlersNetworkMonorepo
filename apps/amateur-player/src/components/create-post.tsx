"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import {
  Image as ImageIcon,
  Video,
  Target,
  BarChart2,
  ChevronDown,
  Globe,
  Users,
  Lock,
  Building2,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import { uploadFile } from "@/lib/upload";

/* -------------------------------------------------------------------------- */
/*  API Config                                                                */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleUnauthorized() {
  localStorage.removeItem("access_token");
  window.location.href = "/signin";
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type Audience = "public" | "followers" | "center" | "private";

type PostMode = "text" | "photo" | "video";

type MediaPreview = {
  file: File;
  previewUrl: string;
};

const AUDIENCE_OPTIONS: {
  value: Audience;
  label: string;
  icon: typeof Globe;
  description: string;
}[] = [
  {
    value: "public",
    label: "Public",
    icon: Globe,
    description: "Anyone on BowlersNetwork",
  },
  {
    value: "followers",
    label: "Followers",
    icon: Users,
    description: "People who follow you",
  },
  {
    value: "center",
    label: "Center",
    icon: Building2,
    description: "Your bowling center community",
  },
  {
    value: "private",
    label: "Private",
    icon: Lock,
    description: "Only you",
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function CreatePost({
  onPostCreated,
}: {
  onPostCreated?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<Audience>("public");
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const [postMode, setPostMode] = useState<PostMode>("text");
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  /* Auto-resize the textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [caption]);

  /* Close when clicking outside */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isExpanded &&
        caption.trim() === "" &&
        mediaFiles.length === 0 &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        resetForm();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, caption, mediaFiles.length]);

  /* Close audience dropdown on outside click */
  useEffect(() => {
    function handleClick() {
      if (showAudienceMenu) setShowAudienceMenu(false);
    }
    if (showAudienceMenu) {
      setTimeout(
        () => document.addEventListener("click", handleClick),
        0,
      );
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showAudienceMenu]);

  /* Cleanup preview URLs on unmount */
  useEffect(() => {
    return () => {
      mediaFiles.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    };
  }, [mediaFiles]);

  function resetForm() {
    setCaption("");
    setIsExpanded(false);
    setError("");
    setPostMode("text");
    mediaFiles.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    setMediaFiles([]);
  }

  function handlePhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newFiles: MediaPreview[] = Array.from(files)
      .slice(0, 4 - mediaFiles.length) // max 4 photos
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));

    setMediaFiles((prev) => [...prev, ...newFiles].slice(0, 4));
    setPostMode("photo");
    setIsExpanded(true);
    e.target.value = "";
  }

  function handleVideoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    mediaFiles.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    setMediaFiles([{ file, previewUrl: URL.createObjectURL(file) }]);
    setPostMode("video");
    setIsExpanded(true);
    e.target.value = "";
  }

  function removeMedia(index: number) {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setPostMode("text");
      return next;
    });
  }

  async function handleSubmit() {
    if (isPosting) return;
    if (postMode === "text" && !caption.trim()) return;
    if (postMode !== "text" && mediaFiles.length === 0) return;

    setIsPosting(true);
    setError("");

    try {
      let endpoint = "/api/newsfeed/create/text";
      let body: Record<string, unknown> = {
        caption: caption.trim(),
        audience,
      };

      if (postMode === "photo") {
        /* Upload all photos in parallel */
        const uploads = await Promise.all(
          mediaFiles.map((m) => uploadFile(m.file)),
        );
        const failed = uploads.find((u) => !u.ok);
        if (failed) throw new Error(failed.error ?? "Failed to upload photo");

        endpoint = "/api/newsfeed/create/photo";
        body.media_urls = uploads.map((u) => u.url!);
      } else if (postMode === "video") {
        const upload = await uploadFile(mediaFiles[0].file);
        if (!upload.ok)
          throw new Error(upload.error ?? "Failed to upload video");

        endpoint = "/api/newsfeed/create/video";
        body.video_url = upload.url;
      }

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (res.status === 401) return handleUnauthorized();

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.detail ?? data?.message ?? "Failed to create post",
        );
      }

      resetForm();
      onPostCreated?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsPosting(false);
    }
  }

  const selectedAudience = AUDIENCE_OPTIONS.find(
    (o) => o.value === audience,
  )!;
  const SelectedAudienceIcon = selectedAudience.icon;
  const canPost =
    postMode === "text"
      ? caption.trim().length > 0
      : mediaFiles.length > 0;

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Hidden file inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePhotoSelect}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoSelect}
      />

      {/* ---- Top row ---- */}
      <div className="flex items-start gap-3 p-4">
        {/* User avatar placeholder */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-text-inverse">
          YO
        </div>

        <div className="min-w-0 flex-1">
          {!isExpanded ? (
            <button
              onClick={() => {
                setIsExpanded(true);
                setTimeout(() => textareaRef.current?.focus(), 50);
              }}
              className="w-full rounded-full border border-border bg-surface-secondary px-4 py-2.5 text-left text-sm text-text-muted transition-colors hover:bg-surface-tertiary"
            >
              What&apos;s on your mind?
            </button>
          ) : (
            <div className="space-y-3">
              {/* Audience selector */}
              <div className="relative inline-block">
                <button
                  onClick={() =>
                    setShowAudienceMenu(!showAudienceMenu)
                  }
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-secondary"
                >
                  <SelectedAudienceIcon className="h-3.5 w-3.5" />
                  {selectedAudience.label}
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showAudienceMenu && (
                  <div className="absolute left-0 top-8 z-20 w-56 rounded-lg border border-border bg-surface py-1 shadow-lg">
                    {AUDIENCE_OPTIONS.map((opt) => {
                      const OptIcon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setAudience(opt.value);
                            setShowAudienceMenu(false);
                          }}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-secondary ${
                            audience === opt.value
                              ? "bg-brand-50 text-brand-dark"
                              : "text-text-secondary"
                          }`}
                        >
                          <OptIcon className="h-4 w-4 shrink-0" />
                          <div>
                            <div className="text-sm font-medium">
                              {opt.label}
                            </div>
                            <div className="text-xs text-text-muted">
                              {opt.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={
                  postMode === "text"
                    ? "What's on your mind?"
                    : "Add a caption..."
                }
                rows={postMode === "text" ? 3 : 2}
                className="w-full resize-none rounded-lg bg-transparent text-[15px] leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none"
              />

              {/* ---- Media previews ---- */}
              {mediaFiles.length > 0 && (
                <div
                  className={`grid gap-2 ${
                    postMode === "video" || mediaFiles.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-2"
                  }`}
                >
                  {mediaFiles.map((m, i) => (
                    <div key={i} className="relative overflow-hidden rounded-lg">
                      {postMode === "video" ? (
                        <video
                          src={m.previewUrl}
                          className="max-h-64 w-full rounded-lg object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={m.previewUrl}
                          alt=""
                          className="max-h-48 w-full rounded-lg object-cover"
                        />
                      )}
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add more photos button (max 4) */}
                  {postMode === "photo" && mediaFiles.length < 4 && (
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="flex min-h-30 items-center justify-center rounded-lg border-2 border-dashed border-border text-text-muted transition-colors hover:border-brand hover:text-brand"
                    >
                      <Plus className="h-8 w-8" />
                    </button>
                  )}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
                  <span>{error}</span>
                  <button
                    onClick={() => setError("")}
                    className="ml-auto shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- Divider ---- */}
      <div className="mx-4 border-t border-border" />

      {/* ---- Bottom action bar ---- */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            title="Photo"
            onClick={() => {
              if (postMode === "video") return; // can't mix
              photoInputRef.current?.click();
            }}
            disabled={postMode === "video"}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-secondary disabled:opacity-40 ${
              postMode === "photo" ? "text-brand bg-brand/10" : "text-brand"
            }`}
          >
            <ImageIcon className="h-5 w-5" />
            <span className="hidden font-medium text-text-secondary sm:inline">
              Photo
            </span>
          </button>
          <button
            title="Video"
            onClick={() => {
              if (postMode === "photo") return; // can't mix
              videoInputRef.current?.click();
            }}
            disabled={postMode === "photo"}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-secondary disabled:opacity-40 ${
              postMode === "video" ? "text-info bg-info/10" : "text-info"
            }`}
          >
            <Video className="h-5 w-5" />
            <span className="hidden font-medium text-text-secondary sm:inline">
              Video
            </span>
          </button>
          <button
            title="Score"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-fire transition-colors hover:bg-surface-secondary"
          >
            <Target className="h-5 w-5" />
            <span className="hidden font-medium text-text-secondary sm:inline">
              Score
            </span>
          </button>
          <button
            title="Poll"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-wow transition-colors hover:bg-surface-secondary"
          >
            <BarChart2 className="h-5 w-5" />
            <span className="hidden font-medium text-text-secondary sm:inline">
              Poll
            </span>
          </button>
        </div>

        {isExpanded && (
          <div className="flex items-center gap-2">
            <button
              onClick={resetForm}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canPost || isPosting}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPosting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
