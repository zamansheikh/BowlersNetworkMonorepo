"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

export default function SignInPage() {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!credential.trim() || !password) {
      setError("Please enter your email/username and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credential.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.detail ??
            data?.message ??
            "Invalid credentials. Please try again."
        );
        return;
      }

      localStorage.setItem("access_token", data.token);
      window.location.href = "/feed";
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Branding Panel — desktop only */}
      <div className="hidden lg:flex lg:w-120 bg-brand flex-col justify-between p-10 text-white">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="BowlersNetwork" width={44} height={44} className="rounded-xl" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BowlersNetwork</h1>
            <p className="text-brand-lighter text-sm font-medium">Amateur Player</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold leading-snug">
            Track your game.
            <br />
            Connect with bowlers.
            <br />
            Grow your skills.
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed max-w-sm">
            Frame-by-frame scoring, career analytics, team management, and
            tournament registration — all in one place.
          </p>
        </div>

        <p className="text-xs text-brand-200">
          &copy; {new Date().getFullYear()} BowlersNetwork Inc.
        </p>
      </div>

      {/* Form Panel */}
      <div className="flex flex-1 items-center justify-center bg-surface-secondary px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Image src="/logo.png" alt="BowlersNetwork" width={56} height={56} className="rounded-xl mb-3" />
            <h1 className="text-2xl font-bold text-brand">BowlersNetwork</h1>
            <p className="text-sm text-text-secondary">Amateur Player</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-error-light px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email / Username */}
              <div>
                <label
                  htmlFor="credential"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Email or Username
                </label>
                <input
                  id="credential"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-input placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-text-primary"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-brand hover:text-brand-dark transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-11 text-sm text-text-input placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-brand hover:text-brand-dark transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
