"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, TimerOff, Plus, ArrowLeft } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { ShimmerButton } from "@/components/magic/ShimmerButton";

export default function ExpirePage() {
  return (
    <div className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16 w-full overflow-hidden">
      {/* Amber/danger ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[300px] bg-amber-DEFAULT/10 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg mx-auto text-center flex flex-col items-center">
        <BlurFade delay={0.1}>
          <div className="flex justify-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full glass border border-amber-DEFAULT/40 flex items-center justify-center">
                <TimerOff className="w-10 h-10 sm:w-12 sm:h-12 text-amber-DEFAULT" strokeWidth={1.5} />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-amber-DEFAULT/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>
          </div>

          <div className="text-center mb-6 sm:mb-8 px-2 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-amber-DEFAULT/30 text-amber-DEFAULT text-xs font-semibold mb-3 sm:mb-4">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Time Limit Exceeded</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3">
              Link <span className="text-amber-DEFAULT">Expired</span>
            </h1>
            <p className="text-muted max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
              The sender configured this secret to expire after a set duration. The time window has
              passed, and the encrypted payload was automatically purged.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.25} className="w-full">
          <div className="relative glass rounded-2xl border border-white/5 p-4 sm:p-6 mb-6 overflow-hidden w-full">
            <BorderBeam duration={12} colorFrom="#f59e0b" colorTo="#ef4444" />
            <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
              To view the data, ask the sender to generate a fresh link with a longer validity window.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/new" className="flex-1 w-full">
              <ShimmerButton
                shimmerColor="#f59e0b"
                background="rgba(245,158,11,0.12)"
                className="w-full py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm border-amber-DEFAULT/40 text-white flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-amber-DEFAULT" />
                <span>Create New Secret</span>
              </ShimmerButton>
            </Link>

            <Link href="/" className="flex-1 w-full">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-3.5 rounded-xl glass border border-white/10 text-muted hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </motion.button>
            </Link>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
