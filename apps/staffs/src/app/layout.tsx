import type { Metadata } from "next";
import { AuthProvider } from "@bowlersnetwork/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "BowlersNetwork — Staff Portal",
  description: "Internal operations: brands, users, content moderation, and team management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
