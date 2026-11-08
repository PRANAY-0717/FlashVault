"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Flame, Shield, ArrowLeft, Eye } from "lucide-react";
import { BlurFade } from "@/components/magic/BlurFade";
import { BorderBeam } from "@/components/magic/BorderBeam";
import { toast } from "@/components/ui/toaster";

export default function SecretGatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleReveal = async () => {
    if (confirmed) return;
    setConfirmed(true);
    setLoading(true);

    try {
      const res = await fetch(`/api/text-json/${id}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404 || res.status === 410) {
          router.push("/error");
        } else if (res.status === 408) {
          router.push("/expire");
        } else {
          router.push("/error");
        }
        return;
      }

      // Store in sessionStorage for the reveal page (never persisted)
      sessionStorage.setItem(`fv_secret_${id}`, JSON.stringify({
        secret: data.secret,
        limitTime: data.limitTime,
      }));
      router.push(`/reveal/${id}`);
    } catch {
      toast("Failed to retrieve secret. Please try again.", "error");
      setConfirmed(false);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
      {/* Danger ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-danger/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg">
        <BlurFade delay={0.1}>
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full glass border border-amber-DEFAULT/30 flex items-center justify-center">
                <Flame className="w-12 h-12 text-amber-DEFAULT" strokeWidth={1.5} />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-amber-DEFAULT/15"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-3">
              A Secret <span className="text-amber-DEFAULT">Awaits</span>
            </h1>
            <p className="text-muted">
              Someone has shared a one-time encrypted secret with you.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.25}>
          <div className="relative glass rounded-2xl border border-white/5 overflow-hidden mb-5">
            <BorderBeam duration={12} colorFrom="#f59e0b" colorTo="#ef4444" />
            <div className="p-6 space-y-4">
              {/* Warnings */}
              <div className="space-y-3">
                {[
                  { icon: Eye, text: "This secret can only be viewed ONCE — by you, right now." },
                  { icon: Flame, text: "It will be permanently destroyed the moment you reveal it." },
                  { icon: AlertTriangle, text: "Do not share this link. The window may already be open elsewhere." },
                  { icon: Shield, text: "Save or screenshot the content before closing this tab." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <item.icon className="w-4 h-4 text-amber-DEFAULT flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-sm text-muted leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.4}>
          {/* Destroy & Reveal Button */}
          <motion.button
            onClick={handleReveal}
            disabled={loading || confirmed}
            whileHover={!confirmed ? { scale: 1.02 } : {}}
            whileTap={!confirmed ? { scale: 0.97 } : {}}
            className="relative w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.1))",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            {/* Pulse ring */}
            {!loading && !confirmed && (
              <motion.div
                className="absolute inset-0 rounded-2xl border border-danger/30"
                animate={{ scale: [1, 1.03, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-danger/30 border-t-danger rounded-full"
                />
                Retrieving & Destroying…
              </>
            ) : confirmed ? (
              <>
                <Shield className="w-6 h-6" />
                Redirecting…
              </>
            ) : (
              <>
                <Flame className="w-6 h-6" />
                Reveal & Destroy Secret
              </>
            )}
          </motion.button>

          <div className="text-center mt-5">
            <Link href="/" className="text-sm text-muted hover:text-white transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              I don't want to see this
            </Link>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}

