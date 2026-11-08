"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Timer, Eye, ArrowRight, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { ShimmerButton } from "@/components/magic/ShimmerButton";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { toast } from "@/components/ui/toaster";

export default function NewSecretPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [validity, setValidity] = useState("60");
  const [viewLimitSet, setViewLimitSet] = useState(false);
  const [viewLimit, setViewLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    try {
      const body = new URLSearchParams({
        text,
        validity,
        ...(viewLimitSet && viewLimit ? { viewLimitSet: "on", viewLimit } : {}),
      });

      const res = await fetch("/api/secret-json", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!res.ok) throw new Error("Failed to create secret");
      const data = await res.json();
      router.push(`/success/${data.id}`);
    } catch {
      toast("Something went wrong. Please try again.", "error");
      setLoading(false);
    }
  };

  const expiryOptions = [
    { label: "5 minutes", value: "5" },
    { label: "30 minutes", value: "30" },
    { label: "1 hour", value: "60" },
    { label: "6 hours", value: "360" },
    { label: "24 hours", value: "1440" },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-DEFAULT/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl">
        <BlurFade delay={0.1}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-emerald border border-emerald-DEFAULT/20 text-emerald-DEFAULT text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              AES-256 Encrypted
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              Create a <span className="text-gradient-emerald">Secret</span>
            </h1>
            <p className="text-muted">
              Your message will be encrypted and permanently destroyed after one view.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <form onSubmit={handleSubmit}>
            <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
              <BorderBeam duration={18} colorFrom="#6366f1" colorTo="#10b981" />

              <div className="p-6 md:p-8 space-y-6">
                {/* Secret Text Area */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-DEFAULT" strokeWidth={1.5} />
                      Secret Message
                    </label>
                    <span className={`text-xs font-mono ${charCount > MAX_CHARS * 0.9 ? "text-amber-DEFAULT" : "text-muted"}`}>
                      {charCount}/{MAX_CHARS}
                    </span>
                  </div>
                  <textarea
                    required
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setCharCount(e.target.value.length);
                    }}
                    maxLength={MAX_CHARS}
                    rows={6}
                    placeholder="Paste your password, API key, or confidential message here..."
                    className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder:text-muted font-mono text-sm resize-none focus:outline-none focus:border-emerald-DEFAULT/50 focus:bg-white/5 transition-all duration-200"
                  />
                  <p className="text-xs text-muted mt-2 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    Your secret is encrypted on submission — we never store it in plain text.
                  </p>
                </div>

                {/* Expiry */}
                <div>
                  <label className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                    <Timer className="w-4 h-4 text-amber-DEFAULT" strokeWidth={1.5} />
                    Link Validity
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {expiryOptions.map((opt) => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setValidity(opt.value)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          validity === opt.value
                            ? "border-amber-DEFAULT/50 bg-amber-DEFAULT/10 text-amber-DEFAULT"
                            : "border-white/8 bg-white/3 text-muted hover:border-white/15 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* View Limit Toggle */}
                <div>
                  <motion.button
                    type="button"
                    onClick={() => setViewLimitSet(!viewLimitSet)}
                    className="flex items-center gap-3 w-full text-left"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`relative w-10 h-5 rounded-full transition-all duration-300 ${viewLimitSet ? "bg-indigo-DEFAULT" : "bg-white/10"}`}>
                      <motion.div
                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                        animate={{ left: viewLimitSet ? "calc(100% - 18px)" : "2px" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-indigo-DEFAULT" strokeWidth={1.5} />
                        Set View Time Limit
                      </span>
                      <span className="text-xs text-muted">Auto-hide the secret after a set duration</span>
                    </div>
                    {viewLimitSet ? <ChevronUp className="w-4 h-4 text-muted ml-auto" /> : <ChevronDown className="w-4 h-4 text-muted ml-auto" />}
                  </motion.button>

                  <AnimatePresence>
                    {viewLimitSet && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4">
                          <label className="text-xs text-muted mb-2 block">
                            View duration (minutes — e.g., 0.5 = 30 seconds)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="60"
                            value={viewLimit}
                            onChange={(e) => setViewLimit(e.target.value)}
                            placeholder="e.g. 1 (minute)"
                            className="w-full bg-white/3 border border-indigo-DEFAULT/30 rounded-xl px-4 py-3 text-white placeholder:text-muted font-mono text-sm focus:outline-none focus:border-indigo-DEFAULT/60 transition-all duration-200"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit */}
                <ShimmerButton
                  type="submit"
                  disabled={loading || !text.trim()}
                  className="w-full py-4 rounded-xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-emerald-DEFAULT/30 border-t-emerald-DEFAULT rounded-full"
                      />
                      Encrypting & Storing…
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Encrypt & Generate Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </ShimmerButton>
              </div>
            </div>
          </form>
        </BlurFade>

        {/* Security note */}
        <BlurFade delay={0.4}>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-muted">
            {[
              "End-to-end encrypted",
              "One-time access only",
              "No account required",
              "Deleted after reading",
            ].map((note) => (
              <span key={note} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-DEFAULT" />
                {note}
              </span>
            ))}
          </div>
        </BlurFade>
      </div>
    </div>
  );
}

