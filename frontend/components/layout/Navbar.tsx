"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Zap } from "lucide-react";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative">
          <Shield
            className="w-7 h-7 text-emerald-DEFAULT transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            strokeWidth={1.5}
          />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-DEFAULT rounded-full animate-pulse" />
        </div>
        <span className="text-lg font-bold tracking-tight">
          Flash<span className="text-gradient-emerald">Vault</span>
        </span>
      </Link>

      {/* CTA */}
      <Link href="/new">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass-emerald text-emerald-DEFAULT text-sm font-medium hover:glow-emerald transition-all duration-300"
        >
          <Zap className="w-4 h-4" />
          Create Secret
        </motion.button>
      </Link>
    </motion.nav>
  );
}

