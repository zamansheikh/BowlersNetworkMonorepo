import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = "https://base.bowlersnetwork.com";

export const metadata: Metadata = {
  title: {
    default: "BowlersNetwork — The Everything App for Bowling",
    template: "%s | BowlersNetwork",
  },
  description:
    "Score games frame-by-frame, track your stats, connect with bowlers, enter tournaments, build teams, and grow your reputation — all in one platform.",
  keywords: [
    "bowling",
    "bowling score tracker",
    "bowling stats",
    "bowling tournaments",
    "bowling league",
    "bowling community",
    "bowler profile",
    "bowling analytics",
    "BowlersNetwork",
  ],
  authors: [{ name: "BowlersNetwork, Inc." }],
  creator: "BowlersNetwork, Inc.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "BowlersNetwork",
    title: "BowlersNetwork — The Everything App for Bowling",
    description:
      "Score games, track stats, connect with bowlers, enter tournaments, and build your reputation.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "BowlersNetwork Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "BowlersNetwork — The Everything App for Bowling",
    description:
      "Score games, track stats, connect with bowlers, enter tournaments, and build your reputation.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
