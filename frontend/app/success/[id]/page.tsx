"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Check, ArrowRight, AlertTriangle, Shield, Share2 } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { ShimmerButton } from "@/components/magic/ShimmerButton";
import { toast } from "@/components/ui/toaster";

export default function SuccessPage() {
  const params = useParams();
  const id = params.id as string;
  const [copied, setCopied] = useState(false);

  // Build the shareable link
  const secretLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/secret/${id}`
      : `/secret/${id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secretLink);
      setCopied(true);
      toast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast("Failed to copy. Please copy manually.", "error");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
      {/* Success glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-DEFAULT/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl">
        <BlurFade delay={0.1}>
          {/* Success icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full glass-emerald border border-emerald-DEFAULT/30 flex items-center justify-center glow-emerald">
                <CheckCircle2 className="w-12 h-12 text-emerald-DEFAULT" strokeWidth={1.5} />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-emerald-DEFAULT/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-3">
              Secret <span className="text-gradient-emerald">Created!</span>
            </h1>
            <p className="text-muted">
              Your encrypted link is ready. Share it — once opened, it self-destructs permanently.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.3}>
          {/* Link Card */}
          <div className="relative glass rounded-2xl border border-white/5 overflow-hidden mb-5">
            <BorderBeam duration={15} colorFrom="#10b981" colorTo="#6366f1" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 text-sm text-muted">
                <Shield className="w-4 h-4 text-emerald-DEFAULT" strokeWidth={1.5} />
                Your one-time secret link
              </div>

              {/* Link display */}
              <div className="bg-black/40 border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-emerald-DEFAULT break-all mb-4 select-all">
                {secretLink}
              </div>

              {/* Copy button */}
              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  copied
                    ? "bg-emerald-DEFAULT/20 border border-emerald-DEFAULT/40 text-emerald-DEFAULT glow-emerald"
                    : "bg-white/5 border border-white/10 text-white hover:border-emerald-DEFAULT/30 hover:bg-emerald-DEFAULT/5 hover:text-emerald-DEFAULT"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.4}>
          {/* Warning */}
          <div className="glass-danger rounded-xl p-4 border border-danger/20 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-DEFAULT flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-white font-medium mb-1">One-time use only</p>
                <p className="text-muted leading-relaxed">
                  This link will be permanently destroyed the moment the recipient views it.
                  You cannot retrieve the secret again — not even you.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/new" className="flex-1">
              <ShimmerButton className="w-full py-3.5 rounded-xl text-sm">
                Create Another Secret
                <ArrowRight className="w-4 h-4" />
              </ShimmerButton>
            </Link>
            <Link href="/" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl glass border border-white/10 text-muted hover:text-white text-sm font-medium transition-all duration-200"
              >
                Back to Home
              </motion.button>
            </Link>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}

