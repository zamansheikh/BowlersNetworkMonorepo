"use client";

import { useState } from "react";
import { TrendingUp, UserPlus, Hash, Flame } from "lucide-react";
import CreatePost from "@/components/create-post";
import PostCard, { type Post } from "@/components/post-card";

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                 */
/* -------------------------------------------------------------------------- */

const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    author_name: "Marcus Williams",
    author_username: "mwilliams",
    author_initials: "MW",
    avatar_color: "#5145cd",
    timestamp: "2h ago",
    audience: "public",
    content:
      "Just rolled my first 300 game at Sunset Lanes! Been chasing this for 3 years and it finally happened. The whole house erupted when that last pin fell. Shoutout to my teammates for keeping the energy up all night. Can't stop shaking! 🎳🔥",
    media_url: null,
    reactions: { like: 142, fire: 87, strike: 234, clap: 56, wow: 31 },
    comment_count: 48,
    share_count: 12,
    comments: [
      {
        id: "c1",
        author_name: "Sarah Chen",
        author_username: "schen",
        author_initials: "SC",
        avatar_color: "#e11d48",
        text: "Congrats Marcus! That's incredible. Next stop: 800 series!",
        timestamp: "1h ago",
      },
      {
        id: "c2",
        author_name: "Jake Torres",
        author_username: "jtorres",
        author_initials: "JT",
        avatar_color: "#0891b2",
        text: "I was there! The energy was unreal. Well deserved 🙌",
        timestamp: "45m ago",
      },
    ],
    user_reaction: null,
  },
  {
    id: "p2",
    author_name: "ProShop Dave",
    author_username: "proshop_dave",
    author_initials: "PD",
    avatar_color: "#d97706",
    timestamp: "4h ago",
    audience: "public",
    content:
      "New ball review: Storm Phaze V. Took it for a spin on a medium-heavy pattern tonight and I'm genuinely impressed. The midlane read is incredibly smooth, and the backend is controlled but powerful. If you liked the Phaze IV you're going to love this. Full writeup coming this weekend with video footage and comparison charts.",
    media_url: "https://placehold.co/800x400/f3f4f6/99a1af?text=Storm+Phaze+V+Review",
    reactions: { like: 89, fire: 45, strike: 12, clap: 23, wow: 8 },
    comment_count: 31,
    share_count: 7,
    comments: [
      {
        id: "c3",
        author_name: "Amy Rodriguez",
        author_username: "amyrodz",
        author_initials: "AR",
        avatar_color: "#7c3aed",
        text: "Been waiting for this review! How does it compare to the IQ Tour?",
        timestamp: "3h ago",
      },
    ],
    user_reaction: "like",
  },
  {
    id: "p3",
    author_name: "Sunset Lanes",
    author_username: "sunsetlanes",
    author_initials: "SL",
    avatar_color: "#059669",
    timestamp: "6h ago",
    audience: "public",
    content:
      "🏆 League Registration Open! Our Fall Classic league starts September 15th. 16-week season, Tuesday nights, 7pm start. Handicapped format — all skill levels welcome. Teams of 4. Early bird discount ends September 1st. DM us or stop by the front desk to register!",
    media_url: null,
    reactions: { like: 34, fire: 12, strike: 5, clap: 18, wow: 2 },
    comment_count: 15,
    share_count: 22,
    comments: [
      {
        id: "c4",
        author_name: "Tony Kim",
        author_username: "tkim",
        author_initials: "TK",
        avatar_color: "#2563eb",
        text: "Signing up tonight! Anyone looking for a 4th?",
        timestamp: "5h ago",
      },
      {
        id: "c5",
        author_name: "Lisa Park",
        author_username: "lisap",
        author_initials: "LP",
        avatar_color: "#db2777",
        text: "Count me in. What's the cost per person?",
        timestamp: "4h ago",
      },
    ],
    user_reaction: null,
  },
  {
    id: "p4",
    author_name: "Sarah Chen",
    author_username: "schen",
    author_initials: "SC",
    avatar_color: "#e11d48",
    timestamp: "8h ago",
    audience: "followers",
    content:
      "Working on my spare game this week. Changed my approach angle for the 10-pin and hit 9 out of 10 tonight. Small wins add up. 📈",
    media_url: null,
    reactions: { like: 56, fire: 8, strike: 3, clap: 42, wow: 1 },
    comment_count: 9,
    share_count: 1,
    comments: [
      {
        id: "c6",
        author_name: "Marcus Williams",
        author_username: "mwilliams",
        author_initials: "MW",
        avatar_color: "#5145cd",
        text: "That 10-pin is a menace. What angle are you throwing now?",
        timestamp: "7h ago",
      },
    ],
    user_reaction: "clap",
  },
  {
    id: "p5",
    author_name: "BowlersNetwork",
    author_username: "bowlersnetwork",
    author_initials: "BN",
    avatar_color: "#6fa332",
    timestamp: "12h ago",
    audience: "public",
    content:
      "📊 Weekend Stats Recap: Over 2,400 games logged this weekend across the network. Average score: 178. Top performer: @mwilliams with a perfect 300! The community is growing fast — welcome to all 150+ new bowlers who joined this week. Keep those strikes coming!",
    media_url: "https://placehold.co/800x400/f3f4f6/99a1af?text=Weekend+Stats+Dashboard",
    reactions: { like: 203, fire: 67, strike: 89, clap: 45, wow: 23 },
    comment_count: 72,
    share_count: 34,
    comments: [
      {
        id: "c7",
        author_name: "Jake Torres",
        author_username: "jtorres",
        author_initials: "JT",
        avatar_color: "#0891b2",
        text: "Love these weekly recaps! Can you add average by lane condition?",
        timestamp: "11h ago",
      },
      {
        id: "c8",
        author_name: "ProShop Dave",
        author_username: "proshop_dave",
        author_initials: "PD",
        avatar_color: "#d97706",
        text: "The growth is real. Excited to see where this goes!",
        timestamp: "10h ago",
      },
    ],
    user_reaction: null,
  },
];

const MOCK_SUGGESTIONS = [
  {
    id: "s1",
    name: "Jake Torres",
    username: "jtorres",
    initials: "JT",
    color: "#0891b2",
    bio: "League bowler at Sunset Lanes",
  },
  {
    id: "s2",
    name: "Amy Rodriguez",
    username: "amyrodz",
    initials: "AR",
    color: "#7c3aed",
    bio: "Sport shot enthusiast | 215 avg",
  },
];

const MOCK_TRENDING = [
  { id: "t1", tag: "PerfectGame", posts: 342 },
  { id: "t2", tag: "FallLeagues2026", posts: 218 },
  { id: "t3", tag: "StormPhaseV", posts: 156 },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function FeedPage() {
  const [posts] = useState<Post[]>(MOCK_POSTS);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex gap-6">
        {/* ================================================================= */}
        {/*  Main Feed Column                                                 */}
        {/* ================================================================= */}
        <main className="min-w-0 flex-1 space-y-4">
          {/* Create Post Composer */}
          <CreatePost />

          {/* Feed */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* End of feed */}
          <div className="py-8 text-center text-sm text-text-muted">
            You&apos;re all caught up! Check back later for new posts.
          </div>
        </main>

        {/* ================================================================= */}
        {/*  Right Sidebar                                                    */}
        {/* ================================================================= */}
        <aside className="hidden w-80 shrink-0 space-y-4 lg:block">
          {/* ---- Who to Follow ---- */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <UserPlus className="h-4 w-4 text-brand" />
              Who to Follow
            </h3>
            <div className="space-y-3">
              {MOCK_SUGGESTIONS.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-text-inverse"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text-primary">{user.name}</div>
                    <div className="truncate text-xs text-text-muted">{user.bio}</div>
                  </div>
                  <button className="shrink-0 rounded-full border border-brand px-3 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-text-inverse">
                    Follow
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-3 text-sm font-medium text-brand-dark hover:underline">
              Show more
            </button>
          </div>

          {/* ---- Trending Topics ---- */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <TrendingUp className="h-4 w-4 text-fire" />
              Trending Topics
            </h3>
            <div className="space-y-3">
              {MOCK_TRENDING.map((topic, i) => (
                <button
                  key={topic.id}
                  className="flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-secondary"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
                    {i === 0 ? (
                      <Flame className="h-4 w-4 text-fire" />
                    ) : (
                      <Hash className="h-4 w-4 text-text-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-primary">#{topic.tag}</div>
                    <div className="text-xs text-text-muted">{topic.posts} posts</div>
                  </div>
                </button>
              ))}
            </div>
            <button className="mt-3 text-sm font-medium text-brand-dark hover:underline">
              Show more
            </button>
          </div>

          {/* ---- Footer links ---- */}
          <div className="px-2 text-xs text-text-muted">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <a href="#" className="hover:underline">About</a>
              <a href="#" className="hover:underline">Help</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
            </div>
            <p className="mt-2">&copy; 2026 BowlersNetwork, Inc.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
