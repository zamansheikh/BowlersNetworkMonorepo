import type { Metadata } from "next";
import { AuthProvider } from "@bowlersnetwork/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "BowlersNetwork — Tournament Director",
  description: "Create and manage tournaments, leagues, and bowling events.",
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
