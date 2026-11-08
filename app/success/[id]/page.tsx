"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Check, ArrowRight, AlertTriangle, Shield } from "lucide-react";
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

  const handleCopyLink = async () => {
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
    <div className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16 w-full overflow-hidden">
      {/* Success glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[300px] bg-emerald-DEFAULT/8 blur-[90px] sm:blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center">
        <BlurFade delay={0.1}>
          {/* Success icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full glass-emerald border border-emerald-DEFAULT/30 flex items-center justify-center glow-emerald">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-DEFAULT" strokeWidth={1.5} />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-emerald-DEFAULT/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>
          </div>

          <div className="text-center mb-6 sm:mb-8 px-2 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-black mb-2 sm:mb-3">
              Secret <span className="text-gradient-emerald">Created!</span>
            </h1>
            <p className="text-muted text-xs sm:text-sm max-w-sm mx-auto">
              Your encrypted link is ready. Share it — once opened, it self-destructs permanently.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.3} className="w-full">
          {/* Link Card */}
          <div className="relative glass rounded-2xl border border-white/5 overflow-hidden mb-5 w-full">
            <BorderBeam duration={15} colorFrom="#10b981" colorTo="#6366f1" />
            <div className="p-4 sm:p-6 text-left">
              <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm text-muted">
                <Shield className="w-4 h-4 text-emerald-DEFAULT shrink-0" strokeWidth={1.5} />
                <span>Your one-time secret link</span>
              </div>

              {/* Link display */}
              <div className="bg-black/40 border border-white/8 rounded-xl p-3 sm:px-4 sm:py-3 font-mono text-xs sm:text-sm text-emerald-DEFAULT break-all mb-4 select-all text-center sm:text-left">
                {secretLink}
              </div>

              {/* Copy button */}
              <motion.button
                type="button"
                onClick={handleCopyLink}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  copied
                    ? "bg-emerald-DEFAULT/20 border border-emerald-DEFAULT/40 text-emerald-DEFAULT glow-emerald"
                    : "bg-white/5 border border-white/10 text-white hover:border-emerald-DEFAULT/30 hover:bg-emerald-DEFAULT/5 hover:text-emerald-DEFAULT"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link to Share</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.4} className="w-full">
          {/* Warning */}
          <div className="glass-danger rounded-xl p-3.5 sm:p-4 border border-danger/20 mb-6 text-left w-full">
            <div className="flex gap-2.5 sm:gap-3 items-start">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-DEFAULT shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="text-white font-medium mb-1">One-time use only</p>
                <p className="text-muted leading-relaxed">
                  This link will be permanently destroyed the moment the recipient views it.
                  Copying of the text itself is disabled to preserve confidential viewing.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/new" className="flex-1 w-full">
              <ShimmerButton className="w-full py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center">
                <span>Create Another</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </ShimmerButton>
            </Link>
            <Link href="/" className="flex-1 w-full">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-3.5 rounded-xl glass border border-white/10 text-muted hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center"
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
