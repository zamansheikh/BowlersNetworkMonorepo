"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Target,
  TrendingUp,
  Users,
  Trophy,
  Rss,
  CreditCard,
  ChevronRight,
  UserPlus,
  Crosshair,
  Link2,
  Star,
  ArrowRight,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Landing page — unauthenticated visitors                                   */
/*  Redirects logged-in users to /feed.                                      */
/* -------------------------------------------------------------------------- */

const features = [
  {
    icon: Target,
    title: "Game Scoring",
    description:
      "Track every frame in real time with our intuitive scoring interface. Never lose a score again.",
  },
  {
    icon: Rss,
    title: "Social Feed",
    description:
      "Share highlights, celebrate strikes, and stay connected with the bowling community.",
  },
  {
    icon: Trophy,
    title: "Tournaments",
    description:
      "Discover and register for local and national tournaments. Compete at every level.",
  },
  {
    icon: Users,
    title: "Teams",
    description:
      "Create or join teams, manage rosters, and coordinate league play effortlessly.",
  },
  {
    icon: CreditCard,
    title: "Trading Cards",
    description:
      "Collect and trade digital bowler cards. Showcase your achievements in a whole new way.",
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    description:
      "Deep-dive into your stats with career trends, spare conversion rates, and pin-action insights.",
  },
];

const stats = [
  { value: "10K+", label: "Active Bowlers" },
  { value: "1M+", label: "Games Tracked" },
  { value: "2,500+", label: "Tournaments Hosted" },
  { value: "98%", label: "Uptime Reliability" },
];

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in under a minute. Set up your profile, upload an avatar, and pick your favorite bowling style.",
  },
  {
    number: "02",
    icon: Crosshair,
    title: "Track Your Games",
    description:
      "Score games frame-by-frame, log practice sessions, and watch your stats update automatically.",
  },
  {
    number: "03",
    icon: Link2,
    title: "Connect & Compete",
    description:
      "Follow friends, join teams, enter tournaments, and climb the leaderboard together.",
  },
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {/* ================================================================== */}
      {/*  NAV BAR                                                           */}
      {/* ================================================================== */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo / wordmark */}
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="BowlersNetwork" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">
              Bowlers<span className="text-brand">Network</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-text-secondary transition-colors hover:text-brand">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-text-secondary transition-colors hover:text-brand">
              How It Works
            </a>
            <a href="#stats" className="text-sm text-text-secondary transition-colors hover:text-brand">
              Community
            </a>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <a
                href="/feed"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md"
              >
                Go to Feed
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <>
                <a
                  href="/signin"
                  className="hidden rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:inline-flex"
                >
                  Log In
                </a>
                <a
                  href="/signup"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md"
                >
                  Get Started
                  <ChevronRight className="h-4 w-4" />
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ================================================================== */}
      {/*  HERO                                                              */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden">
        {/* Decorative background blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2"
        >
          <div className="h-150 w-225 rounded-full bg-brand-50 opacity-60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-28 text-center sm:pt-36 lg:pt-44">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-dark">
            <Star className="h-4 w-4" />
            The Everything App for Bowling
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your Bowling Career,{" "}
            <span className="bg-linear-to-r from-brand to-brand-accent bg-clip-text text-transparent">
              All in One Place
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">
            Score games, analyze your stats, connect with other bowlers, enter
            tournaments, and build your reputation — all from a single, beautiful
            platform.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-brand-dark hover:shadow-xl hover:-translate-y-0.5"
            >
              Sign Up Free
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-border-medium bg-white px-8 py-4 text-base font-semibold text-text-primary shadow-sm transition-all hover:border-brand hover:shadow-md hover:-translate-y-0.5"
            >
              Learn More
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          {/* Social proof hint */}
          <p className="mt-8 text-sm text-text-muted">
            Trusted by <span className="font-semibold text-text-secondary">10,000+</span> bowlers
            across the country. Free to get started.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  FEATURE GRID                                                      */}
      {/* ================================================================== */}
      <section id="features" className="bg-surface-secondary py-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Bowl Better
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              From your first frame to tournament day, BowlersNetwork has you covered.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-border bg-surface p-8 shadow-xs transition-all hover:border-brand/40 hover:shadow-md"
              >
                {/* Icon circle */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-text-secondary">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  STATS / SOCIAL PROOF                                              */}
      {/* ================================================================== */}
      <section id="stats" className="bg-surface-dark py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
              Community
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Join the Fastest-Growing Bowling Community
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Real numbers from real bowlers who are leveling up their game every day.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-extrabold tracking-tight text-brand sm:text-5xl">
                  {value}
                </p>
                <p className="mt-2 text-sm font-medium text-gray-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  HOW IT WORKS                                                      */}
      {/* ================================================================== */}
      <section id="how-it-works" className="bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Up and Running in Three Steps
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              No complicated setup. No learning curve. Just bowl.
            </p>
          </div>

          {/* Steps */}
          <div className="mt-16 grid gap-10 lg:grid-cols-3">
            {steps.map(({ number, icon: Icon, title, description }, idx) => (
              <div key={title} className="relative text-center lg:text-left">
                {/* Connector line (desktop only) */}
                {idx < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute right-0 top-10 hidden h-px w-[calc(100%-3rem)] translate-x-1/2 bg-linear-to-r from-brand/40 to-transparent lg:block"
                  />
                )}

                {/* Step number badge */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-brand/20 bg-brand-50 lg:mx-0">
                  <Icon className="h-9 w-9 text-brand" />
                </div>

                <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest text-brand">
                  Step {number}
                </span>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-text-secondary">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  FINAL CTA                                                         */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand via-brand-dark to-brand-darker py-28">
        {/* Decorative circles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Elevate Your Game?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Join thousands of bowlers who track, improve, and compete on
            BowlersNetwork. It is completely free to start.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-dark shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="/signin"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  FOOTER                                                            */}
      {/* ================================================================== */}
      <footer className="border-t border-border bg-surface-secondary">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.png" alt="BowlersNetwork" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-bold tracking-tight">
                  Bowlers<span className="text-brand">Network</span>
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
                The everything app for bowling. Track scores, grow your skills,
                and connect with the community.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                Product
              </h4>
              <ul className="mt-4 space-y-3">
                {["Game Scoring", "Analytics", "Tournaments", "Teams", "Trading Cards"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#features"
                        className="text-sm text-text-secondary transition-colors hover:text-brand"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                Company
              </h4>
              <ul className="mt-4 space-y-3">
                <li><a href="/about" className="text-sm text-text-secondary transition-colors hover:text-brand">About</a></li>
                <li><a href="/help" className="text-sm text-text-secondary transition-colors hover:text-brand">Help</a></li>
                <li><a href="/careers" className="text-sm text-text-secondary transition-colors hover:text-brand">Careers</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                Legal
              </h4>
              <ul className="mt-4 space-y-3">
                <li><a href="/privacy" className="text-sm text-text-secondary transition-colors hover:text-brand">Privacy</a></li>
                <li><a href="/terms" className="text-sm text-text-secondary transition-colors hover:text-brand">Terms</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-text-muted">
              &copy; 2026 BowlersNetwork, Inc.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-text-muted transition-colors hover:text-brand" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="text-text-muted transition-colors hover:text-brand" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="text-text-muted transition-colors hover:text-brand" aria-label="YouTube">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
