import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "FlashVault — Encrypted One-Time Secrets",
  description:
    "Share sensitive data securely. Military-grade AES-256 encryption. Self-destructs after one view. No logs. No traces.",
  keywords: ["secret sharing", "encrypted", "one-time link", "secure", "privacy"],
  openGraph: {
    title: "FlashVault — Encrypted One-Time Secrets",
    description: "Share passwords, keys and secrets that self-destruct after one view.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-white antialiased">
        <div className="relative min-h-screen flex flex-col">
          {/* Global cyber grid background */}
          <div className="fixed inset-0 cyber-grid-bg opacity-100 pointer-events-none z-0" />
          {/* Radial gradient overlay */}
          <div className="fixed inset-0 bg-gradient-radial from-transparent via-transparent to-background pointer-events-none z-0" />
          {/* Subtle emerald ambient top glow */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-DEFAULT/5 blur-[120px] rounded-full pointer-events-none z-0" />

          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}

