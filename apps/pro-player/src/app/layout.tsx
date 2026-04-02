import type { Metadata } from "next";
import { AuthProvider } from "@bowlersnetwork/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "BowlersNetwork — Pro Player",
  description: "Build your brand, engage fans, and monetize your bowling career.",
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
