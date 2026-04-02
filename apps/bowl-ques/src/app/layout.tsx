import type { Metadata } from "next";
import { AuthProvider } from "@bowlersnetwork/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "BowlersNetwork — Bowl Ques",
  description: "Admin tool for pro player onboarding surveys and beta tester management.",
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
