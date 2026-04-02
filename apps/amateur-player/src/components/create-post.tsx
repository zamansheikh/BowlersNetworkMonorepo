"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type Audience = "public" | "followers" | "center" | "private";

const AUDIENCE_OPTIONS: { value: Audience; label: string; icon: typeof Globe; description: string }[] = [
  { value: "public", label: "Public", icon: Globe, description: "Anyone on BowlersNetwork" },
  { value: "followers", label: "Followers", icon: Users, description: "People who follow you" },
  { value: "center", label: "Center", icon: Building2, description: "Your bowling center community" },
  { value: "private", label: "Private", icon: Lock, description: "Only you" },
];

const ACTION_BUTTONS = [
  { icon: ImageIcon, label: "Photo", color: "text-brand" },
  { icon: Video, label: "Video", color: "text-info" },
  { icon: Target, label: "Score", color: "text-fire" },
  { icon: BarChart2, label: "Poll", color: "text-wow" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<Audience>("public");
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Auto-resize the textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [caption]);

  /* Close when clicking outside */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isExpanded &&
        caption.trim() === "" &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, caption]);

  /* Close audience dropdown on outside click */
  useEffect(() => {
    function handleClick() {
      if (showAudienceMenu) setShowAudienceMenu(false);
    }
    if (showAudienceMenu) {
      setTimeout(() => document.addEventListener("click", handleClick), 0);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showAudienceMenu]);

  async function handleSubmit() {
    if (!caption.trim() || isPosting) return;
    setIsPosting(true);

    // Simulated API call — replace with real fetch when ready
    await new Promise((r) => setTimeout(r, 800));

    setCaption("");
    setIsExpanded(false);
    setIsPosting(false);
    onPostCreated?.();
  }

  const selectedAudience = AUDIENCE_OPTIONS.find((o) => o.value === audience)!;
  const SelectedAudienceIcon = selectedAudience.icon;

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
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
                  onClick={() => setShowAudienceMenu(!showAudienceMenu)}
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
                            audience === opt.value ? "bg-brand-50 text-brand-dark" : "text-text-secondary"
                          }`}
                        >
                          <OptIcon className="h-4 w-4 shrink-0" />
                          <div>
                            <div className="text-sm font-medium">{opt.label}</div>
                            <div className="text-xs text-text-muted">{opt.description}</div>
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
                placeholder="What's on your mind?"
                rows={3}
                className="w-full resize-none rounded-lg bg-transparent text-[15px] leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* ---- Divider ---- */}
      <div className="mx-4 border-t border-border" />

      {/* ---- Bottom action bar ---- */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          {ACTION_BUTTONS.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              title={label}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-secondary ${color}`}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden sm:inline text-text-secondary font-medium">{label}</span>
            </button>
          ))}
        </div>

        {isExpanded && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCaption("");
                setIsExpanded(false);
              }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!caption.trim() || isPosting}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPosting && <Loader2 className="h-4 w-4 animate-spin" />}
              Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
