"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  AlertTriangle,
  Flame,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { toast } from "@/components/ui/toaster";

export default function RevealSecretPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [secret, setSecret] = useState<string | null>(null);
  const [limitTime, setLimitTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [destroyed, setDestroyed] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and retrieve secret
  useEffect(() => {
    const sessionKey = `fv_secret_${id}`;
    const cached = sessionStorage.getItem(sessionKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSecret(parsed.secret);
        if (parsed.limitTime) {
          const ms = Number(parsed.limitTime);
          if (!isNaN(ms) && ms > 0) {
            setLimitTime(ms);
            setTimeLeft(ms);
          }
        }
        // Immediately purge from sessionStorage so page refresh or back navigation cannot retrieve it
        sessionStorage.removeItem(sessionKey);
        setLoading(false);
        return;
      } catch (err) {
        console.error("Failed to parse cached secret:", err);
      }
    }

    // Fallback: Fetch directly from API if not loaded via secret gate
    fetch(`/api/text-json/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 408) {
            router.replace("/expire");
          } else {
            router.replace("/error");
          }
          return;
        }
        const data = await res.json();
        setSecret(data.secret);
        if (data.limitTime) {
          const ms = Number(data.limitTime);
          if (!isNaN(ms) && ms > 0) {
            setLimitTime(ms);
            setTimeLeft(ms);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        router.replace("/error");
      });
  }, [id, router]);

  // Handle countdown timer if viewLimit is set
  useEffect(() => {
    if (!limitTime || limitTime <= 0) return;

    const startTime = Date.now();
    const endTime = startTime + limitTime;

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDestroyed(true);
        setSecret(null);
        setTimeout(() => {
          router.replace("/expire");
        }, 1200);
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [limitTime, router]);

  // Anti-tamper & auto-burn protections (preserves behavior from legacy reveal.ejs)
  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast("Right click disabled for secret security", "info");
    };

    // Tab visibility change (burn secret on switch)
    const handleVisibilityChange = () => {
      if (document.hidden && !copied) {
        setDestroyed(true);
        setSecret(null);
        router.replace("/error");
      }
    };

    // DOM purge before unload
    const handleBeforeUnload = () => {
      setSecret(null);
    };

    window.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [copied, router]);

  const handleCopy = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast("Secret copied! Redirecting to secure thank-you...", "success");
      setTimeout(() => {
        router.replace("/thanks");
      }, 1000);
    } catch {
      toast("Failed to copy. Please select and copy manually.", "error");
    }
  };

  const progressPercent =
    limitTime && timeLeft !== null ? Math.max(0, (timeLeft / limitTime) * 100) : 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-emerald-DEFAULT/30 border-t-emerald-DEFAULT rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
      {/* Background glowing aura */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-DEFAULT/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl">
        <BlurFade delay={0.1}>
          {/* Header Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-danger border border-danger/30 text-danger text-sm font-semibold mb-5">
              <Flame className="w-4 h-4 animate-bounce" />
              Burned From Server · Exists Only in This Window
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              Your <span className="text-gradient-emerald">Decrypted Secret</span>
            </h1>
            <p className="text-muted text-sm max-w-md mx-auto">
              This message has been permanently deleted from FlashVault's database. Copy it now.
            </p>
          </div>
        </BlurFade>

        {/* Timer Bar if viewLimit set */}
        {limitTime && timeLeft !== null && (
          <BlurFade delay={0.15}>
            <div className="mb-6 glass rounded-xl p-4 border border-amber-DEFAULT/30">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-2 text-amber-DEFAULT font-medium">
                  <Clock className="w-4 h-4 animate-spin-slow" />
                  Self-destruct timer
                </span>
                <span className="font-mono font-bold text-amber-DEFAULT">
                  {(timeLeft / 1000).toFixed(1)}s remaining
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-DEFAULT via-amber-DEFAULT to-danger"
                  style={{ width: `${progressPercent}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>
          </BlurFade>
        )}

        <BlurFade delay={0.25}>
          {/* Secret Display Card */}
          <div className="relative glass rounded-2xl border border-white/10 overflow-hidden mb-6 shadow-2xl">
            <BorderBeam duration={10} colorFrom="#10b981" colorTo="#6366f1" />

            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-muted uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-emerald-DEFAULT" />
                  Decrypted Payload
                </div>

                <button
                  onClick={() => setRevealed(!revealed)}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
                >
                  {revealed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Reveal
                    </>
                  )}
                </button>
              </div>

              {/* Secret Text Area */}
              <div className="relative min-h-[140px] flex items-center justify-center p-6 bg-black/60 rounded-xl border border-white/5">
                <AnimatePresence mode="wait">
                  {destroyed ? (
                    <motion.div
                      key="destroyed"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-danger font-mono font-bold text-lg text-center"
                    >
                      [TEXT DESTROYED]
                    </motion.div>
                  ) : revealed ? (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, filter: "blur(6px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-base md:text-lg text-emerald-glow whitespace-pre-wrap break-all select-all leading-relaxed w-full"
                    >
                      {secret}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted font-mono tracking-widest text-lg"
                    >
                      ••••••••••••••••••••••••••••••••
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="mt-6">
                <motion.button
                  onClick={handleCopy}
                  disabled={destroyed || copied}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 text-base ${
                    copied
                      ? "bg-emerald-DEFAULT/20 border border-emerald-DEFAULT text-emerald-DEFAULT glow-emerald"
                      : "bg-emerald-DEFAULT hover:bg-emerald-dark text-black shadow-emerald"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied! Redirecting…
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Click to Copy Secret
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Security Warnings Accordion/List */}
        <BlurFade delay={0.35}>
          <div className="glass rounded-xl p-5 border border-white/5 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-DEFAULT" />
              Security Protocol Notice
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted pt-1">
              <p>• Reloading will permanently delete this view.</p>
              <p>• Copying will safely route you away to prevent screen leaks.</p>
              <p>• Switching browser tabs will immediately burn the secret.</p>
              <p>• No copy remains anywhere in FlashVault logs or memory.</p>
            </div>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}

