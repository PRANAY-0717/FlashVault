"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Plus, MessageSquareHeart, ArrowRight, Lock } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { ShimmerButton } from "@/components/magic/ShimmerButton";

export default function ThanksPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-DEFAULT/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg text-center">
        <BlurFade delay={0.1}>
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full glass-emerald border border-emerald-DEFAULT/30 flex items-center justify-center glow-emerald">
                <ShieldCheck className="w-12 h-12 text-emerald-DEFAULT" strokeWidth={1.5} />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-emerald-DEFAULT/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Secret <span className="text-gradient-emerald">Transferred!</span>
          </h1>
          <p className="text-muted max-w-md mx-auto mb-8 text-base">
            The data has been copied safely to your clipboard and permanently purged from server memory.
          </p>
        </BlurFade>

        <BlurFade delay={0.25}>
          <div className="relative glass rounded-2xl border border-white/5 p-6 md:p-8 mb-6 overflow-hidden">
            <BorderBeam duration={14} colorFrom="#10b981" colorTo="#6366f1" />

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-DEFAULT text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Zero-Knowledge Destruction Confirmed
              </div>
              <p className="text-muted text-xs leading-relaxed max-w-sm mx-auto">
                No logs, copies, or database rows remain. The link will no longer resolve for anyone.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link href="/new" className="flex-1">
                  <ShimmerButton className="w-full py-3.5 rounded-xl text-sm">
                    <Plus className="w-4 h-4" />
                    Create New Secret
                  </ShimmerButton>
                </Link>

                <a
                  href="https://forms.gle/FWDUSkTJbQgU1sdVA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl glass border border-white/10 text-white hover:border-emerald-DEFAULT/30 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MessageSquareHeart className="w-4 h-4 text-emerald-DEFAULT" />
                    Give Feedback
                  </motion.button>
                </a>
              </div>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.35}>
          <Link
            href="/"
            className="text-xs text-muted hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            Return to FlashVault Home <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </BlurFade>
      </div>
    </div>
  );
}

