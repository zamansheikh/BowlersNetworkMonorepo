"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Mail,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");

  // Fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ---------- Step 1: Request OTP ----------
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/access/recovery/initiate/otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.detail ??
            data?.message ??
            "Could not send recovery code. Please try again."
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

  // ---------- Step 2: Validate OTP ----------
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/access/recovery/validate/otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.detail ??
            data?.message ??
            "Invalid code. Please try again."
        );
        return;
      }

      setStep("reset");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // ---------- Step 3: Reset password ----------
  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/access/recovery/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.detail ??
            data?.message ??
            "Could not reset password. Please try again."
        );
        return;
      }

      setStep("success");
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
      const res = await fetch(
        `${BASE_URL}/api/access/recovery/initiate/otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

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

  // Active step index for the progress indicator
  const stepIndex = step === "email" ? 0 : step === "otp" ? 1 : 2;

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
            Don&apos;t worry,
            <br />
            we&apos;ll get you
            <br />
            back on the lanes.
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed max-w-sm">
            Reset your password in three quick steps and get back to tracking
            your games.
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
                {(["email", "otp", "reset"] as const).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        stepIndex === i
                          ? "bg-brand text-white"
                          : i < stepIndex
                            ? "bg-brand-light text-white"
                            : "bg-surface-tertiary text-text-muted"
                      }`}
                    >
                      {i + 1}
                    </div>
                    {i < 2 && (
                      <div
                        className={`h-0.5 w-8 rounded transition-colors ${
                          i < stepIndex ? "bg-brand" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ============== STEP 1: Enter Email ============== */}
            {step === "email" && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">
                    Forgot password?
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Enter the email address associated with your account and
                    we&apos;ll send you a verification code.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-error-light px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-text-primary"
                    >
                      Email Address
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
                    {isLoading ? "Sending code..." : "Send Verification Code"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-text-secondary">
                  Remember your password?{" "}
                  <Link
                    href="/signin"
                    className="font-semibold text-brand hover:text-brand-dark transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </>
            )}

            {/* ============== STEP 2: Enter OTP ============== */}
            {step === "otp" && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">
                    Check your email
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    We sent a verification code to{" "}
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
                          setOtp(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
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
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setOtp("");
                      setStep("email");
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

            {/* ============== STEP 3: New Password ============== */}
            {step === "reset" && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">
                    Set new password
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Choose a strong password that you haven&apos;t used before.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-error-light px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-1.5 block text-sm font-medium text-text-primary"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-muted" />
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pl-10 pr-11 text-sm text-text-input placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
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

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-sm font-medium text-text-primary"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-muted" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pl-10 pr-11 text-sm text-text-input placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-brand/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
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
                      <KeyRound className="h-4 w-4" />
                    )}
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("otp");
                    }}
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                </div>
              </>
            )}

            {/* ============== STEP 4: Success ============== */}
            {step === "success" && (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                  <CheckCircle2 className="h-8 w-8 text-brand" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Password reset!
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Your password has been successfully updated. You can now sign
                  in with your new password.
                </p>
                <Link
                  href="/signin"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Continue to Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
