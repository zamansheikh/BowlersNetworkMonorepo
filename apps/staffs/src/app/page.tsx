"use client";

import { Button, PageHeader } from "@bowlersnetwork/ui";
import { useAuth } from "@bowlersnetwork/auth";
import { Tags, UsersRound, BarChart3, Shield } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-10">
      <PageHeader
        title="Staff Portal"
        description="Internal operations: brands, users, content moderation, and team management."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Tags, label: "Brands", desc: "Manage brand catalog" },
          { icon: UsersRound, label: "Team", desc: "Office staff management" },
          { icon: BarChart3, label: "User Analytics", desc: "Signups & growth" },
          { icon: Shield, label: "Moderation", desc: "Discussion topics" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="rounded-lg border border-border p-5 hover:border-brand transition-colors">
            <Icon className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-text-primary">{label}</h3>
            <p className="text-sm text-text-secondary mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-surface-secondary border border-border p-6">
        <h2 className="text-lg font-semibold mb-2">Auth Status</h2>
        {isLoading ? (
          <p className="text-text-secondary">Checking session...</p>
        ) : isAuthenticated ? (
          <p className="text-success">Signed in as <strong>{user?.username}</strong></p>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-text-secondary">Not signed in</p>
            <Button size="sm">Sign In</Button>
          </div>
        )}
      </div>
    </main>
  );
}
