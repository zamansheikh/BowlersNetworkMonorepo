import type { Metadata } from "next";
import { AuthProvider } from "@bowlersnetwork/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "BowlersNetwork — Manufacturers",
  description: "Manage products, inventory, and dealer relationships.",
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
