"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldX, AlertOctagon, Plus, ArrowLeft } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { ShimmerButton } from "@/components/magic/ShimmerButton";

export default function ErrorPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
      {/* Danger glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-danger/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg text-center">
        <BlurFade delay={0.1}>
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full glass-danger border border-danger/40 flex items-center justify-center glow-danger">
                <ShieldX className="w-12 h-12 text-danger" strokeWidth={1.5} />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-danger/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-danger border border-danger/30 text-danger text-xs font-semibold mb-4">
            <AlertOctagon className="w-3.5 h-3.5" />
            Payload Inaccessible or Erased
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Already <span className="text-danger">Destroyed</span>
          </h1>
          <p className="text-muted max-w-md mx-auto mb-8 text-sm leading-relaxed">
            This secret was already viewed and burned, or the link never existed. Because of our strict
            zero-knowledge policy, it can never be recovered.
          </p>
        </BlurFade>

        <BlurFade delay={0.25}>
          <div className="relative glass rounded-2xl border border-white/5 p-6 mb-6 overflow-hidden">
            <BorderBeam duration={12} colorFrom="#ef4444" colorTo="#f59e0b" />
            <p className="text-xs text-muted leading-relaxed">
              If you did not open this link yourself, notify the sender immediately — someone or an
              automated crawler may have triggered the one-time burn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/new" className="flex-1">
              <ShimmerButton
                shimmerColor="#ef4444"
                background="rgba(239,68,68,0.12)"
                className="w-full py-3.5 rounded-xl text-sm border-danger/40 text-white"
              >
                <Plus className="w-4 h-4 text-danger" />
                Create New Secret
              </ShimmerButton>
            </Link>

            <Link href="/" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl glass border border-white/10 text-muted hover:text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </motion.button>
            </Link>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}

