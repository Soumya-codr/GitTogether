import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AuthSync from "@/components/shared/AuthSync";

export const metadata: Metadata = {
  title: "GitTogether — Connect Through Code",
  description: "GitTogether connects developers based on GitHub profiles. Network, collaborate, and vibe through code.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <AuthSync>{children}</AuthSync>
        </Providers>
      </body>
    </html>
  );
}
