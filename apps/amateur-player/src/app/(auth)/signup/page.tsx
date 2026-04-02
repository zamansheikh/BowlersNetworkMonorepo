"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mail,
} from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

type Step = "form" | "otp" | "success";

export default function SignUpPage() {
  const [step, setStep] = useState<Step>("form");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP
  const [otp, setOtp] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ---------- Step 1: Submit registration form & request OTP ----------
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !username.trim() ||
      !password
    ) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.detail ??
            data?.message ??
            "Could not send verification email. Please try again."
        );
        return;
      }

      setStep("otp");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // ---------- Step 2: Verify OTP & complete signup ----------
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signup_data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            username: username.trim(),
            password,
          },
          verification_code: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.detail ??
            data?.message ??
            "Verification failed. Please check the code and try again."
        );
        return;
      }

      localStorage.setItem("access_token", data.token);
      setStep("success");

      // Redirect after a brief pause so the user sees the success state
      setTimeout(() => {
        window.location.href = "/feed";
      }, 1500);
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // ---------- Resend OTP ----------
  async function handleResendOtp() {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.detail ?? data?.message ?? "Failed to resend code.");
        return;
      }

      setOtp("");
    } catch {
      setError("Could not resend code. Please try again.");
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
            Join the community.
            <br />
            Track every frame.
            <br />
            Level up your game.
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed max-w-sm">
            Create your free account to start scoring games, analyzing trends,
            and connecting with bowlers near you.
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
            {/* ============== Step Indicator ============== */}
            {step !== "success" && (
              <div className="mb-6 flex items-center gap-2">
                {(["form", "otp"] as const).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        step === s
                          ? "bg-brand text-white"
                          : i < (step === "otp" ? 1 : 0)
                            ? "bg-brand-light text-white"
                            : "bg-surface-tertiary text-text-muted"
                      }`}
                    >
                      {i + 1}
                    </div>
                    {i < 1 && (
                      <div
                        className={`h-0.5 w-8 rounded transition-colors ${
                          step === "otp" ? "bg-brand" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ============== STEP 1: Registration Form ============== */}
            {step === "form" && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">
                    Create your account
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Fill in your details to get started
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-error-light px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-1.5 block text-sm font-medium text-text-primary"
                      >
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-input placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-1.5 block text-sm font-medium text-text-primary"
                      >
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-input placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-text-primary"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-input placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-1.5 block text-sm font-medium text-text-primary"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-input placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-medium text-text-primary"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-11 text-sm text-text-input placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {isLoading ? "Sending code..." : "Continue"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-text-secondary">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="font-semibold text-brand hover:text-brand-dark transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </>
            )}

            {/* ============== STEP 2: OTP Verification ============== */}
            {step === "otp" && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">
                    Verify your email
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    We sent a 6-digit code to{" "}
                    <span className="font-medium text-text-primary">
                      {email}
                    </span>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-error-light px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-1.5 block text-sm font-medium text-text-primary"
                    >
                      Verification Code
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-muted" />
                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        autoComplete="one-time-code"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pl-10 text-sm text-text-input tracking-widest placeholder:text-text-muted placeholder:tracking-normal outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {isLoading ? "Creating account..." : "Create Account"}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setOtp("");
                      setStep("form");
                    }}
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sm font-medium text-brand hover:text-brand-dark transition-colors disabled:opacity-60"
                  >
                    Resend code
                  </button>
                </div>
              </>
            )}

            {/* ============== STEP 3: Success ============== */}
            {step === "success" && (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                  <CheckCircle2 className="h-8 w-8 text-brand" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Welcome to BowlersNetwork!
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Your account has been created. Redirecting you to your feed...
                </p>
                <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-brand" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
