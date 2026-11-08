"use client";

import Link from "next/link";
import { Shield, Heart, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 mt-16 sm:mt-24 border-t border-white/5 px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted">
          <Shield className="w-4 h-4 text-emerald-DEFAULT shrink-0" strokeWidth={1.5} />
          <span>AES-256-CBC · Zero-knowledge · Burn-on-read</span>
        </div>

        <div className="flex items-center justify-center gap-1 text-xs sm:text-sm text-muted">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-danger fill-danger" />
          <span>by Pranay</span>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-muted">
          <Link href="/" className="hover:text-emerald-DEFAULT transition-colors">Home</Link>
          <Link href="/new" className="hover:text-emerald-DEFAULT transition-colors">Create</Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="hover:text-emerald-DEFAULT transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
