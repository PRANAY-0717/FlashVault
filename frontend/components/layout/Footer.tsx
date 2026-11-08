"use client";

import Link from "next/link";
import { Shield, Heart, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/5 px-6 py-8 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Shield className="w-4 h-4 text-emerald-DEFAULT" strokeWidth={1.5} />
          <span>AES-256-CBC encrypted · Zero-knowledge · Burn-on-read</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-danger fill-danger" />
          <span>by Pranay</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted">
          <Link href="/" className="hover:text-emerald-DEFAULT transition-colors">Home</Link>
          <Link href="/new" className="hover:text-emerald-DEFAULT transition-colors">Create</Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-DEFAULT transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

