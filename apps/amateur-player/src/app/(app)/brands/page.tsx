"use client";

import { Tag, Search, Star, ExternalLink } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Brand Card                                                                 */
/* -------------------------------------------------------------------------- */

interface BrandCardProps {
  name: string;
  tagline: string;
  color: string;
  initials: string;
  products: number;
}

function BrandCard({ name, tagline, color, initials, products }: BrandCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-text-inverse"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text-primary">{name}</div>
          <div className="truncate text-xs text-text-muted">{tagline}</div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border-subtle pt-3">
        <span className="text-xs text-text-muted">{products} products</span>
        <button
          disabled
          className="flex items-center gap-1 text-xs font-medium text-brand-dark opacity-50"
        >
          Browse <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Brands Page                                                                */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  { label: "All", active: true },
  { label: "Balls" },
  { label: "Shoes" },
  { label: "Bags" },
  { label: "Accessories" },
  { label: "Apparel" },
];

const SAMPLE_BRANDS: BrandCardProps[] = [
  {
    name: "Storm",
    tagline: "The Bowler's Company",
    color: "#1e40af",
    initials: "ST",
    products: 48,
  },
  {
    name: "Brunswick",
    tagline: "Since 1845",
    color: "#15803d",
    initials: "BR",
    products: 62,
  },
  {
    name: "Motiv",
    tagline: "Innovation in Motion",
    color: "#9333ea",
    initials: "MV",
    products: 35,
  },
  {
    name: "Hammer",
    tagline: "It's Hammer Time",
    color: "#dc2626",
    initials: "HM",
    products: 41,
  },
  {
    name: "Ebonite",
    tagline: "Performance Redefined",
    color: "#0891b2",
    initials: "EB",
    products: 29,
  },
  {
    name: "900 Global",
    tagline: "Making Bowlers Better",
    color: "#ca8a04",
    initials: "9G",
    products: 33,
  },
];

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      {/* Coming Soon Badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand-dark">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Coming Soon
        </span>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
          <Tag className="h-8 w-8 text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Brands
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          Explore bowling equipment from top brands. Compare balls, shoes, bags,
          and accessories.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            disabled
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              c.active
                ? "bg-brand/10 text-brand-dark"
                : "bg-surface-tertiary text-text-muted",
            ].join(" ")}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Preview Area */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-secondary p-6 shadow-sm sm:p-8">
        {/* Shimmer overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/0 via-brand/10 to-brand/0 animate-[shimmer_3s_ease-in-out_infinite]" />

        <div className="relative space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
            <Search className="h-4 w-4 text-text-muted" />
            <span className="text-sm text-text-muted">
              Search brands or products...
            </span>
          </div>

          {/* Brand Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_BRANDS.map((b) => (
              <BrandCard key={b.name} {...b} />
            ))}
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Tag, label: "Product Catalog", desc: "Detailed specs and reviews" },
          { icon: Star, label: "User Ratings", desc: "Community-driven reviews" },
          { icon: Search, label: "Smart Compare", desc: "Side-by-side comparisons" },
        ].map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs"
          >
            <f.icon className="h-5 w-5 shrink-0 text-brand" />
            <div>
              <div className="text-sm font-semibold text-text-primary">{f.label}</div>
              <div className="text-xs text-text-muted">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
