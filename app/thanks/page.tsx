"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Plus, MessageSquareHeart, ArrowRight } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { ShimmerButton } from "@/components/magic/ShimmerButton";

export default function ThanksPage() {
  return (
    <div className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16 w-full overflow-hidden">
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[300px] bg-emerald-DEFAULT/8 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg mx-auto text-center flex flex-col items-center">
        <BlurFade delay={0.1}>
          <div className="flex justify-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full glass-emerald border border-emerald-DEFAULT/30 flex items-center justify-center glow-emerald">
                <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-DEFAULT" strokeWidth={1.5} />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-emerald-DEFAULT/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </div>

          <div className="text-center mb-6 sm:mb-8 px-2 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3">
              Secret <span className="text-gradient-emerald">Destroyed!</span>
            </h1>
            <p className="text-muted max-w-md mx-auto text-xs sm:text-sm">
              The secret has been permanently purged from server memory. No traces or digital logs remain.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.25} className="w-full">
          <div className="relative glass rounded-2xl border border-white/5 p-5 sm:p-7 md:p-8 mb-6 overflow-hidden w-full">
            <BorderBeam duration={14} colorFrom="#10b981" colorTo="#6366f1" />

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-1.5 text-emerald-DEFAULT text-xs sm:text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero-Knowledge Destruction Confirmed</span>
              </div>
              <p className="text-muted text-[11px] sm:text-xs leading-relaxed max-w-sm mx-auto">
                No copies or database rows exist. The link will no longer resolve for anyone.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
                <Link href="/new" className="flex-1 w-full">
                  <ShimmerButton className="w-full py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                    <span>Create New Secret</span>
                  </ShimmerButton>
                </Link>

                <a
                  href="https://forms.gle/FWDUSkTJbQgU1sdVA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 w-full"
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 sm:py-3.5 rounded-xl glass border border-white/10 text-white hover:border-emerald-DEFAULT/30 text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    <MessageSquareHeart className="w-4 h-4 text-emerald-DEFAULT" />
                    <span>Give Feedback</span>
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
            <span>Return to FlashVault Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </BlurFade>
      </div>
    </div>
  );
}
