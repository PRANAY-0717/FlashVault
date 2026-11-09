"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Activity, Crosshair, Waves, Tv, Info } from "lucide-react";
import { AntiCaptureCanvas, DefenseMode } from "./AntiCaptureCanvas";

interface SecretDisplayProps {
  secret: string;
  sessionId: string;
  revealed: boolean;
}

export function SecretDisplay({ secret, sessionId, revealed }: SecretDisplayProps) {
  const [focusLost, setFocusLost] = useState(false);
  const [sessionTimestamp] = useState<number>(() => Date.now());
  const [mode, setMode] = useState<DefenseMode>("lens");

  useEffect(() => {
    const onBlur = () => setFocusLost(true);
    const onFocus = () => setFocusLost(false);

    // Veil on OS screenshot shortcuts
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        ((e.metaKey || e.ctrlKey) &&
          e.shiftKey &&
          ["3", "4", "5", "s", "S"].includes(e.key))
      ) {
        setFocusLost(true);
        setTimeout(() => {
          if (document.hasFocus()) setFocusLost(false);
        }, 2000);
      }
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="space-y-3 w-full select-none no-copy-shield">
      {/* Top Security Status Bar */}
      {revealed && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
            <span className="font-semibold">Anti-Camera Defense Active</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted/70">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>SID {sessionId.slice(0, 8)}…</span>
          </div>
        </div>
      )}

      {/* Mode Selector Tabs */}
      {revealed && (
        <div className="flex items-center justify-center p-1 rounded-xl bg-white/5 border border-white/8 gap-1">
          <button
            type="button"
            onClick={() => setMode("lens")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              mode === "lens"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-muted hover:text-white"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 shrink-0" />
            <span>Aperture Lens</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("kinetic")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              mode === "kinetic"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-muted hover:text-white"
            }`}
          >
            <Waves className="w-3.5 h-3.5 shrink-0" />
            <span>Kinetic Motion</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("shutter")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              mode === "shutter"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-muted hover:text-white"
            }`}
          >
            <Tv className="w-3.5 h-3.5 shrink-0" />
            <span>Shutter Jammer</span>
          </button>
        </div>
      )}

      {/* Protected Canvas Container */}
      <div
        className="relative rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl no-copy-shield"
        style={{ isolation: "isolate", background: "#050706" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <AntiCaptureCanvas
          secret={secret}
          sessionId={sessionId}
          sessionTimestamp={sessionTimestamp}
          active={revealed}
          focusLost={focusLost}
          mode={mode}
        />
      </div>

      {/* Explanatory Mode Hint */}
      {revealed && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/3 border border-white/5 text-[11px] text-muted leading-relaxed">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            {mode === "lens" && (
              <span>
                <strong className="text-white">Aperture Lens Mode:</strong> Touch and glide your finger or mouse across the box to decrypt words under your cursor. External cameras cannot photograph the full secret at once.
              </span>
            )}
            {mode === "kinetic" && (
              <span>
                <strong className="text-white">Kinetic Motion Mode:</strong> Text is rendered with high-density dynamic coherent particle streams. 100% visible and readable to human eyes, while counter-drifting decoy particles disrupt camera snapshots.
              </span>
            )}
            {mode === "shutter" && (
              <span>
                <strong className="text-white">Shutter Jammer Mode:</strong> Kaleido chromatic decomposition + 70% opaque moving shutter guillotine. Human vision blends the text smoothly, but camera snapshots capture only sliced 30% ribbons with heavy chromatic banding.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
