"use client";

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from "react";
import {
  Play,
  Film,
  ImageIcon,
  Plus,
  Heart,
  MessageSquare,
  Bookmark,
  Eye,
  Loader2,
  X,
  Send,
  ArrowLeft,
  Upload,
  Clock,
} from "lucide-react";
import { uploadFile } from "@/lib/upload";

/* -------------------------------------------------------------------------- */
/*  API helpers                                                                */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

function getToken() {
  return localStorage.getItem("access_token");
}

async function api(
  path: string,
  opts: { method?: string; body?: unknown } = {},
) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });
  if (res.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/signin";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.errors?.[0] ?? err?.detail ?? "Request failed");
  }
  return res.json();
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type Author = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url: string | null;
  is_pro: boolean;
};

type Video = {
  id: number;
  uid: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_display: string;
  audience: string;
  author: Author;
  likes_count: number;
  comments_count: number;
  views_count: number;
  saves_count: number;
  has_liked?: boolean;
  has_saved?: boolean;
  is_mine?: boolean;
  is_pinned: boolean;
  created_at: string;
};

type Split = {
  id: number;
  uid: string;
  caption: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_display: string;
  audio_label: string;
  audience: string;
  author: Author;
  likes_count: number;
  comments_count: number;
  views_count: number;
  saves_count: number;
  has_liked?: boolean;
  has_saved?: boolean;
  is_mine?: boolean;
  created_at: string;
};

type Album = {
  id: number;
  uid: string;
  name: string;
  description: string;
  cover_url: string | null;
  audience: string;
  owner: Author;
  image_count: number;
  likes_count: number;
  comments_count: number;
  views_count: number;
  saves_count: number;
  has_liked?: boolean;
  has_saved?: boolean;
  is_mine?: boolean;
  created_at: string;
};

type GalleryImage = {
  id: number;
  uid: string;
  image_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  has_liked?: boolean;
  is_mine?: boolean;
  created_at: string;
};

type MediaComment = {
  id: number;
  text: string;
  author: { id: number; first_name: string; username: string };
  likes_count: number;
  is_pinned: boolean;
  has_liked?: boolean;
  is_mine?: boolean;
  created_at: string;
};

type Tab = "videos" | "splits" | "gallery";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatCount(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function AuthorAvatar({ author, size = 8 }: { author: Author; size?: number }) {
  const initials = `${author.first_name?.[0] ?? ""}${author.last_name?.[0] ?? ""}`;
  const cls = `h-${size} w-${size}`;
  if (author.profile_picture_url) {
    return <img src={author.profile_picture_url} alt="" className={`${cls} rounded-full object-cover`} />;
  }
  return (
    <span className={`${cls} flex items-center justify-center rounded-full bg-brand text-xs font-semibold text-white`}>
      {initials}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Comments panel (shared by all media types)                                 */
/* -------------------------------------------------------------------------- */

function CommentsPanel({
  contentType,
  contentUid,
}: {
  contentType: "videos" | "splits" | "albums" | "images";
  contentUid: string;
}) {
  const [comments, setComments] = useState<MediaComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api(`/api/media/${contentType}/${contentUid}/comments?page_size=50`);
      setComments(data.comments ?? data.results ?? data);
    } catch { setComments([]); }
    finally { setLoading(false); }
  }, [contentType, contentUid]);

  useEffect(() => { fetch_(); }, [fetch_]);

  async function submit() {
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      await api(`/api/media/${contentType}/${contentUid}/comments`, {
        method: "POST",
        body: { text: text.trim() },
      });
      setText("");
      fetch_();
    } catch { /* ignore */ }
    finally { setPosting(false); }
  }

  async function likeComment(id: number) {
    try {
      await api(`/api/media/comments/${id}/like`, { method: "POST" });
      fetch_();
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-3">
      {/* Post comment */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || posting}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-brand" /></div>
      ) : comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-muted">No comments yet</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className={`flex gap-2 rounded-lg p-2.5 ${c.is_pinned ? "bg-brand/5 border border-brand/20" : ""}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-[10px] font-semibold text-text-muted">
              {c.author.first_name?.[0] ?? "?"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="font-medium text-text-secondary">{c.author.first_name}</span>
                <span>{timeAgo(c.created_at)}</span>
              </div>
              <p className="mt-0.5 text-sm text-text-primary">{c.text}</p>
            </div>
            <button
              onClick={() => likeComment(c.id)}
              className={`shrink-0 flex items-center gap-1 text-xs ${c.has_liked ? "text-error" : "text-text-muted hover:text-error"}`}
            >
              <Heart size={12} fill={c.has_liked ? "currentColor" : "none"} />
              {c.likes_count > 0 && c.likes_count}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Upload modal                                                               */
/* -------------------------------------------------------------------------- */

function UploadModal({
  type,
  onClose,
  onSuccess,
}: {
  type: "video" | "split";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("public");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!file || uploading) return;
    if (type === "video" && !title.trim()) { setError("Title is required"); return; }

    setUploading(true);
    setError("");
    try {
      const upload = await uploadFile(file);
      if (!upload.ok) throw new Error(upload.error ?? "Upload failed");

      if (type === "video") {
        await api("/api/media/videos/create", {
          method: "POST",
          body: { title: title.trim(), video_url: upload.url, description: description.trim(), audience },
        });
      } else {
        await api("/api/media/splits/create", {
          method: "POST",
          body: { video_url: upload.url, caption: title.trim(), audience },
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            Upload {type === "video" ? "Video" : "Split"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
        </div>

        {error && <div className="mb-3 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</div>}

        <div className="space-y-4">
          {/* File picker */}
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
          {!file ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-12 text-text-muted transition-colors hover:border-brand hover:text-brand"
            >
              <Upload size={32} />
              <span className="text-sm font-medium">Choose a video file</span>
            </button>
          ) : (
            <div className="relative rounded-lg overflow-hidden">
              <video src={preview} className="max-h-48 w-full rounded-lg object-cover" controls />
              <button
                onClick={() => { setFile(null); setPreview(""); }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Title / Caption */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              {type === "video" ? "Title" : "Caption"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "video" ? "Give your video a title" : "Add a caption..."}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-input placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Description (video only) */}
          {type === "video" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe your video..."
                className="w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-input placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          )}

          {/* Audience */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-input focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="public">Public</option>
              <option value="followers">Followers</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted hover:text-text-secondary">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!file || uploading || (type === "video" && !title.trim())}
              className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {uploading && <Loader2 size={16} className="animate-spin" />}
              {uploading ? "Uploading..." : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Video Detail                                                               */
/* -------------------------------------------------------------------------- */

function VideoDetail({ video, onBack }: { video: Video; onBack: () => void }) {
  const [v, setV] = useState(video);

  async function like() {
    try {
      await api(`/api/media/videos/${v.uid}/like`, { method: "POST" });
      setV((prev) => ({
        ...prev,
        has_liked: !prev.has_liked,
        likes_count: prev.likes_count + (prev.has_liked ? -1 : 1),
      }));
    } catch { /* ignore */ }
  }

  async function save() {
    try {
      await api(`/api/media/videos/${v.uid}/save`, { method: "POST" });
      setV((prev) => ({ ...prev, has_saved: !prev.has_saved }));
    } catch { /* ignore */ }
  }

  useEffect(() => {
    api(`/api/media/videos/${v.uid}/view`, { method: "POST", body: { watch_duration_seconds: 0, source: "direct_link" } }).catch(() => {});
  }, [v.uid]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Video player */}
      <div className="overflow-hidden rounded-xl bg-black">
        <video src={v.video_url} poster={v.thumbnail_url ?? undefined} controls className="mx-auto max-h-[500px] w-full" />
      </div>

      {/* Info */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h1 className="text-lg font-bold text-text-primary">{v.title}</h1>
        <div className="mt-2 flex items-center gap-3">
          <AuthorAvatar author={v.author} size={8} />
          <div>
            <p className="text-sm font-semibold text-text-primary">{v.author.first_name} {v.author.last_name}</p>
            <p className="text-xs text-text-muted">@{v.author.username}</p>
          </div>
        </div>

        {v.description && (
          <p className="mt-3 text-sm text-text-secondary whitespace-pre-wrap">{v.description}</p>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
          <button onClick={like} className={`flex items-center gap-1.5 text-sm font-medium ${v.has_liked ? "text-error" : "text-text-muted hover:text-error"}`}>
            <Heart size={18} fill={v.has_liked ? "currentColor" : "none"} /> {formatCount(v.likes_count)}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-text-muted">
            <MessageSquare size={18} /> {formatCount(v.comments_count)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-text-muted">
            <Eye size={18} /> {formatCount(v.views_count)}
          </span>
          <button onClick={save} className={`flex items-center gap-1.5 text-sm font-medium ${v.has_saved ? "text-brand" : "text-text-muted hover:text-brand"}`}>
            <Bookmark size={18} fill={v.has_saved ? "currentColor" : "none"} /> Save
          </button>
          <span className="ml-auto text-xs text-text-muted">{timeAgo(v.created_at)}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">Comments</h3>
        <CommentsPanel contentType="videos" contentUid={v.uid} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Media Card (reusable for Videos/Splits/Gallery)                            */
/* -------------------------------------------------------------------------- */

function MediaCard({
  thumbnail,
  title,
  subtitle,
  duration,
  stats,
  onClick,
}: {
  thumbnail: string | null;
  title: string;
  subtitle: string;
  duration?: string;
  stats: { icon: typeof Heart; value: string }[];
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group text-left rounded-xl border border-border bg-surface overflow-hidden transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-surface-tertiary">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play size={32} className="text-text-muted" />
          </div>
        )}
        {duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-text-primary group-hover:text-brand">{title}</h3>
        <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
        <div className="mt-2 flex items-center gap-3">
          {stats.map((s, i) => (
            <span key={i} className="flex items-center gap-1 text-xs text-text-muted">
              <s.icon size={12} /> {s.value}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Media Page                                                            */
/* -------------------------------------------------------------------------- */

export default function MediaPage() {
  const [tab, setTab] = useState<Tab>("videos");
  const [uploadType, setUploadType] = useState<"video" | "split" | null>(null);

  /* ---- Videos ---- */
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  /* ---- Splits ---- */
  const [splits, setSplits] = useState<Split[]>([]);
  const [splitsLoading, setSplitsLoading] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<Split | null>(null);

  /* ---- Gallery ---- */
  const [albums, setAlbums] = useState<Album[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumImages, setAlbumImages] = useState<GalleryImage[]>([]);

  /* ---- Fetch functions ---- */
  const fetchVideos = useCallback(async () => {
    setVideosLoading(true);
    try {
      const data = await api("/api/media/videos?page_size=20");
      setVideos(data.videos ?? data.results ?? data);
    } catch { setVideos([]); }
    finally { setVideosLoading(false); }
  }, []);

  const fetchSplits = useCallback(async () => {
    setSplitsLoading(true);
    try {
      const data = await api("/api/media/splits?page_size=20");
      setSplits(data.splits ?? data.results ?? data);
    } catch { setSplits([]); }
    finally { setSplitsLoading(false); }
  }, []);

  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const data = await api("/api/media/gallery?page_size=20");
      setAlbums(data.albums ?? data.results ?? data);
    } catch { setAlbums([]); }
    finally { setGalleryLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "videos") fetchVideos();
    else if (tab === "splits") fetchSplits();
    else fetchGallery();
  }, [tab, fetchVideos, fetchSplits, fetchGallery]);

  /* ---- Album detail ---- */
  async function openAlbum(album: Album) {
    setSelectedAlbum(album);
    try {
      const data = await api(`/api/media/albums/${album.uid}`);
      if (data.images) setAlbumImages(data.images);
      else {
        // Fetch images separately if not included
        setAlbumImages([]);
      }
    } catch { setAlbumImages([]); }
  }

  async function likeAlbum() {
    if (!selectedAlbum) return;
    try {
      await api(`/api/media/albums/${selectedAlbum.uid}/like`, { method: "POST" });
      setSelectedAlbum((prev) => prev ? {
        ...prev,
        has_liked: !prev.has_liked,
        likes_count: prev.likes_count + (prev.has_liked ? -1 : 1),
      } : prev);
    } catch { /* ignore */ }
  }

  /* ---- Split detail ---- */
  function SplitDetail({ split, onBack }: { split: Split; onBack: () => void }) {
    const [s, setS] = useState(split);

    async function like() {
      try {
        await api(`/api/media/splits/${s.uid}/like`, { method: "POST" });
        setS((prev) => ({ ...prev, has_liked: !prev.has_liked, likes_count: prev.likes_count + (prev.has_liked ? -1 : 1) }));
      } catch { /* ignore */ }
    }

    useEffect(() => {
      api(`/api/media/splits/${s.uid}/view`, { method: "POST", body: { watch_duration_seconds: 0, source: "feed" } }).catch(() => {});
    }, [s.uid]);

    return (
      <div className="mx-auto max-w-lg space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="overflow-hidden rounded-xl bg-black">
          <video src={s.video_url} poster={s.thumbnail_url ?? undefined} controls autoPlay muted className="mx-auto max-h-[600px] w-full" />
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <AuthorAvatar author={s.author} size={8} />
            <div>
              <p className="text-sm font-semibold text-text-primary">{s.author.first_name} {s.author.last_name}</p>
              <p className="text-xs text-text-muted">{timeAgo(s.created_at)}</p>
            </div>
          </div>
          {s.caption && <p className="mt-2 text-sm text-text-secondary">{s.caption}</p>}
          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
            <button onClick={like} className={`flex items-center gap-1.5 text-sm ${s.has_liked ? "text-error" : "text-text-muted hover:text-error"}`}>
              <Heart size={16} fill={s.has_liked ? "currentColor" : "none"} /> {formatCount(s.likes_count)}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-text-muted"><MessageSquare size={16} /> {formatCount(s.comments_count)}</span>
            <span className="flex items-center gap-1.5 text-sm text-text-muted"><Eye size={16} /> {formatCount(s.views_count)}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Comments</h3>
          <CommentsPanel contentType="splits" contentUid={s.uid} />
        </div>
      </div>
    );
  }

  /* ---- Detail views ---- */
  if (selectedVideo) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <VideoDetail video={selectedVideo} onBack={() => setSelectedVideo(null)} />
      </div>
    );
  }

  if (selectedSplit) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <SplitDetail split={selectedSplit} onBack={() => setSelectedSplit(null)} />
      </div>
    );
  }

  if (selectedAlbum) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6">
        <button onClick={() => { setSelectedAlbum(null); setAlbumImages([]); }} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h1 className="text-lg font-bold text-text-primary">{selectedAlbum.name}</h1>
          {selectedAlbum.description && <p className="mt-1 text-sm text-text-secondary">{selectedAlbum.description}</p>}
          <div className="mt-3 flex items-center gap-3">
            <AuthorAvatar author={selectedAlbum.owner} size={8} />
            <span className="text-sm font-medium text-text-primary">{selectedAlbum.owner.first_name} {selectedAlbum.owner.last_name}</span>
          </div>
          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
            <button onClick={likeAlbum} className={`flex items-center gap-1.5 text-sm ${selectedAlbum.has_liked ? "text-error" : "text-text-muted hover:text-error"}`}>
              <Heart size={16} fill={selectedAlbum.has_liked ? "currentColor" : "none"} /> {formatCount(selectedAlbum.likes_count)}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-text-muted"><ImageIcon size={16} /> {selectedAlbum.image_count} photos</span>
          </div>
        </div>

        {/* Image grid */}
        {albumImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {albumImages.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg">
                <img src={img.image_url} alt={img.caption} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="line-clamp-1 text-xs text-white">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface py-12 text-center text-sm text-text-muted">
            No photos in this album yet
          </div>
        )}

        {/* Album comments */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Comments</h3>
          <CommentsPanel contentType="albums" contentUid={selectedAlbum.uid} />
        </div>
      </div>
    );
  }

  /* ================================================================== */
  /*  Main list view                                                     */
  /* ================================================================== */

  const TABS: { value: Tab; label: string; icon: typeof Play }[] = [
    { value: "videos", label: "Videos", icon: Play },
    { value: "splits", label: "Splits", icon: Film },
    { value: "gallery", label: "Gallery", icon: ImageIcon },
  ];

  const isLoading = tab === "videos" ? videosLoading : tab === "splits" ? splitsLoading : galleryLoading;

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Media</h1>
          <p className="mt-1 text-sm text-text-secondary">Explore videos, splits, and photo galleries</p>
        </div>
        {tab !== "gallery" && (
          <button
            onClick={() => setUploadType(tab === "videos" ? "video" : "split")}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Plus size={18} />
            Upload {tab === "videos" ? "Video" : "Split"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.value
                  ? "border-b-2 border-brand text-brand"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-brand" />
        </div>
      ) : (
        <>
          {/* Videos */}
          {tab === "videos" && (
            videos.length === 0 ? (
              <EmptyState icon={Play} label="No videos yet" action="Upload Video" onAction={() => setUploadType("video")} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((v) => (
                  <MediaCard
                    key={v.uid}
                    thumbnail={v.thumbnail_url}
                    title={v.title}
                    subtitle={`${v.author.first_name} ${v.author.last_name}`}
                    duration={v.duration_display}
                    stats={[
                      { icon: Eye, value: formatCount(v.views_count) },
                      { icon: Heart, value: formatCount(v.likes_count) },
                      { icon: Clock, value: timeAgo(v.created_at) },
                    ]}
                    onClick={() => setSelectedVideo(v)}
                  />
                ))}
              </div>
            )
          )}

          {/* Splits */}
          {tab === "splits" && (
            splits.length === 0 ? (
              <EmptyState icon={Film} label="No splits yet" action="Upload Split" onAction={() => setUploadType("split")} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {splits.map((s) => (
                  <MediaCard
                    key={s.uid}
                    thumbnail={s.thumbnail_url}
                    title={s.caption || "Untitled split"}
                    subtitle={`${s.author.first_name} ${s.author.last_name}`}
                    duration={s.duration_display}
                    stats={[
                      { icon: Eye, value: formatCount(s.views_count) },
                      { icon: Heart, value: formatCount(s.likes_count) },
                      { icon: Clock, value: timeAgo(s.created_at) },
                    ]}
                    onClick={() => setSelectedSplit(s)}
                  />
                ))}
              </div>
            )
          )}

          {/* Gallery */}
          {tab === "gallery" && (
            albums.length === 0 ? (
              <EmptyState icon={ImageIcon} label="No albums yet" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((a) => (
                  <MediaCard
                    key={a.uid}
                    thumbnail={a.cover_url}
                    title={a.name}
                    subtitle={`${a.owner.first_name} ${a.owner.last_name} · ${a.image_count} photos`}
                    stats={[
                      { icon: Heart, value: formatCount(a.likes_count) },
                      { icon: Eye, value: formatCount(a.views_count) },
                      { icon: Clock, value: timeAgo(a.created_at) },
                    ]}
                    onClick={() => openAlbum(a)}
                  />
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Upload modal */}
      {uploadType && (
        <UploadModal
          type={uploadType}
          onClose={() => setUploadType(null)}
          onSuccess={() => {
            if (uploadType === "video") fetchVideos();
            else fetchSplits();
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({
  icon: Icon,
  label,
  action,
  onAction,
}: {
  icon: typeof Play;
  label: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16">
      <Icon className="mb-3 h-10 w-10 text-text-muted" />
      <p className="text-sm text-text-muted">{label}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-4 flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <Plus size={16} />
          {action}
        </button>
      )}
    </div>
  );
}
