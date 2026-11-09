"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock,
  Lock,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { toast } from "@/components/ui/toaster";
import { SecretDisplay } from "@/components/security/SecretDisplay";

export default function RevealSecretPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [secret, setSecret] = useState<string | null>(null);
  const [limitTime, setLimitTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [destroyed, setDestroyed] = useState(false);

  // Unique session ID for forensic watermarking + typographic fingerprinting
  const [sessionId] = useState<string>(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-fallback`
  );

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
        }, 800);
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [limitTime, router]);

  // Anti-tamper & strict no-copy protections
  useEffect(() => {
    // Block right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast("Right click disabled for secret security", "info");
    };

    // Block keyboard copy shortcut (Ctrl+C, Cmd+C) & copy events
    const handleCopyAttempt = (e: ClipboardEvent) => {
      e.preventDefault();
      toast("Copying is disabled for confidential viewing", "error");
    };

    // Tab visibility change (burn secret on switch)
    const handleVisibilityChange = () => {
      if (document.hidden && !destroyed) {
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
    document.addEventListener("copy", handleCopyAttempt);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyAttempt);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [destroyed, router]);

  const handleFinishReading = () => {
    setDestroyed(true);
    setSecret(null);
    router.replace("/thanks");
  };

  const progressPercent =
    limitTime && timeLeft !== null ? Math.max(0, (timeLeft / limitTime) * 100) : 100;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-9 h-9 border-2 border-emerald-DEFAULT/30 border-t-emerald-DEFAULT rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16 w-full overflow-hidden">
      {/* Background glowing aura */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[350px] sm:w-[550px] h-[300px] bg-emerald-DEFAULT/10 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
        <BlurFade delay={0.1}>
          {/* Header Badge */}
          <div className="text-center mb-6 sm:mb-8 px-2 flex flex-col items-center">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full glass-danger border border-danger/30 text-danger text-xs font-semibold mb-3 sm:mb-4 max-w-full">
              <Flame className="w-3.5 h-3.5 animate-bounce shrink-0" />
              <span>Burned From Server · Read-Only View</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3">
              Your <span className="text-gradient-emerald">Decrypted Secret</span>
            </h1>
            <p className="text-muted text-xs sm:text-sm max-w-md mx-auto">
              This message has been erased from FlashVault servers. Read it now before closing this tab.
            </p>
          </div>
        </BlurFade>

        {/* Timer Bar if viewLimit set */}
        {limitTime && timeLeft !== null && (
          <BlurFade delay={0.15} className="w-full mb-4 sm:mb-6">
            <div className="glass rounded-xl p-3 sm:p-4 border border-amber-DEFAULT/30 w-full text-left">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                <span className="flex items-center gap-1.5 text-amber-DEFAULT font-medium">
                  <Clock className="w-3.5 h-3.5 animate-spin-slow shrink-0" />
                  <span>Self-destruct timer</span>
                </span>
                <span className="font-mono font-bold text-amber-DEFAULT">
                  {(timeLeft / 1000).toFixed(1)}s
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

        <BlurFade delay={0.25} className="w-full">
          {/* Secret Display Card */}
          <div className="relative glass rounded-2xl border border-white/10 overflow-hidden mb-5 sm:mb-6 shadow-2xl w-full">
            <BorderBeam duration={10} colorFrom="#10b981" colorTo="#6366f1" />

            <div className="p-4 sm:p-7 md:p-8">
              <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-white/5 pb-2.5 sm:pb-3">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-muted uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-emerald-DEFAULT shrink-0" />
                  <span>Confidential View</span>
                </div>

                <button
                  type="button"
                  onClick={() => setRevealed(!revealed)}
                  className="flex items-center gap-1 text-[11px] sm:text-xs text-muted hover:text-white transition-colors"
                >
                  {revealed ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Reveal</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secret Text Area — Anti-capture protected */}
              <div
                className="relative rounded-xl border border-white/5 overflow-hidden no-copy-shield"
                onCopy={(e) => {
                  e.preventDefault();
                  toast("Copying is disabled for confidential viewing", "error");
                }}
              >
                <AnimatePresence mode="wait">
                  {destroyed ? (
                    <motion.div
                      key="destroyed"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-danger font-mono font-bold text-base sm:text-lg text-center min-h-[120px] sm:min-h-[140px] flex items-center justify-center bg-black/60 rounded-xl"
                    >
                      [TEXT DESTROYED]
                    </motion.div>
                  ) : (
                    <motion.div
                      key="secret-display"
                      initial={{ opacity: 0, filter: "blur(6px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Full-screen environment dimming when revealed */}
                      {revealed && (
                        <div
                          aria-hidden="true"
                          className="fixed inset-0 pointer-events-none"
                          style={{
                            background: "rgba(0,0,0,0.65)",
                            backdropFilter: "brightness(0.5)",
                            WebkitBackdropFilter: "brightness(0.5)",
                            zIndex: 10,
                          }}
                        />
                      )}
                      <SecretDisplay
                        secret={secret ?? ""}
                        sessionId={sessionId}
                        revealed={revealed}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Button: I've Read It / Destroy Now (Replacing Copy button) */}
              <div className="mt-5 sm:mt-6">
                <motion.button
                  type="button"
                  onClick={handleFinishReading}
                  disabled={destroyed}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-base glass border border-danger/30 text-danger hover:bg-danger/10 shadow-sm"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>I've Read the Secret — Destroy View</span>
                </motion.button>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Security Notice */}
        <BlurFade delay={0.35} className="w-full">
          <div className="glass rounded-xl p-4 sm:p-5 border border-white/5 space-y-2 text-left w-full">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-DEFAULT shrink-0" />
              <span>Confidentiality Notice</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted pt-1">
              <p>• Copying is disabled to enforce confidential, read-only viewing.</p>
              <p>• Reloading will permanently delete this view.</p>
              <p>• Switching browser tabs will instantly destroy the secret.</p>
              <p>• No copy remains anywhere in FlashVault logs or memory.</p>
              <p>• Anti-capture canvas active — screenshots &amp; photos are protected.</p>
              <p>• Forensic watermark embedded — session fingerprinted for audit.</p>
            </div>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
