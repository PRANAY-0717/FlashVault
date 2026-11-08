"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Zap } from "lucide-react";

export function Navbar() {
  return (
    <header className="relative z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-md">
      <motion.nav
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 py-3.5"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Shield
              className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-DEFAULT transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              strokeWidth={1.5}
            />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-DEFAULT rounded-full animate-pulse" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight">
            Flash<span className="text-gradient-emerald">Vault</span>
          </span>
        </Link>

        {/* CTA */}
        <Link href="/new">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg glass-emerald text-emerald-DEFAULT text-xs sm:text-sm font-medium hover:glow-emerald transition-all duration-300"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Create Secret</span>
          </motion.button>
        </Link>
      </motion.nav>
    </header>
  );
}
