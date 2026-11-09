"use client";

import { useMemo } from "react";
import { AntiCaptureCanvas } from "./AntiCaptureCanvas";

interface SecretDisplayProps {
  secret: string;
  sessionId: string;
  revealed: boolean;
}

/**
 * SecretDisplay
 *
 * Renders the secret text with two simultaneous anti-capture layers:
 *
 * 1. AntiCaptureCanvas — 60-fps rolling-shutter canvas behind the text.
 *    This is the primary anti-camera mechanism. The 60Hz phase-inverting
 *    stripe grid causes severe banding in any camera capture.
 *
 * 2. Typographic fingerprinting — each character gets:
 *    - A micro letter-spacing variation (±0.02 em) derived from sessionId
 *    - A 1-LSB color shift between two near-identical emerald tones
 *      (#6ee7b6 vs #6ee7b7) that encode sessionId bit pattern
 *    These are imperceptible to the human eye but recoverable forensically.
 *
 * NOTE: Text must remain human-readable. The anti-capture effect comes
 * entirely from the canvas grid, NOT from low-contrast text color.
 */
export function SecretDisplay({ secret, sessionId, revealed }: SecretDisplayProps) {
  const fingerprinted = useMemo(() => {
    if (!secret) return [];

    // Derive a numeric seed from sessionId UUID hex digits
    const seed = sessionId.replace(/-/g, "");

    return Array.from(secret).map((char, i) => {
      const nibble1 = parseInt(seed[(i * 2) % seed.length], 16);
      const nibble2 = parseInt(seed[(i * 2 + 1) % seed.length], 16);

      // letterSpacing: map [0,15] → [-0.02em, +0.02em]
      const spacingOffset = ((nibble1 / 15) * 0.04 - 0.02).toFixed(4);

      // 1-LSB color shift on the green channel of emerald:
      // #6ee7b6 (rgb 110,231,182) vs #6ee7b7 (rgb 110,231,183)
      // Encodes one bit of sessionId per character — forensically detectable,
      // visually indistinguishable (1 step out of 255 on one channel).
      const color = nibble2 & 1 ? "#6ee7b7" : "#6ee7b6";

      return { char, letterSpacing: `${spacingOffset}em`, color };
    });
  }, [secret, sessionId]);

  return (
    <div
      className="relative rounded-xl overflow-hidden select-none no-copy-shield"
      style={{
        isolation: "isolate",
        background: "#0a0a0a",
        minHeight: "120px",
      }}
    >
      {/* Layer 1: Anti-capture canvas sits at z-index 0 behind text */}
      <AntiCaptureCanvas sessionId={sessionId} active={revealed} />

      {/* Layer 2: Text at z-index 1 — always readable, forensically fingerprinted */}
      <div
        className="relative flex items-center justify-center p-4 sm:p-6 w-full"
        style={{ zIndex: 1, minHeight: "120px" }}
      >
        {revealed ? (
          <p
            className="font-mono text-sm sm:text-base md:text-lg whitespace-pre-wrap break-all leading-relaxed w-full text-center sm:text-left"
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
            aria-label="Secret content"
          >
            {fingerprinted.map(({ char, letterSpacing, color }, i) => (
              <span
                key={i}
                style={{
                  letterSpacing,
                  color,
                  // Micro-opacity variation (0.97–1.0) encodes a third fingerprinting dimension
                  opacity:
                    0.97 +
                    ((parseInt(sessionId[i % sessionId.length] || "0", 16) % 4) / 4) * 0.03,
                }}
              >
                {char}
              </span>
            ))}
          </p>
        ) : (
          <p
            className="font-mono tracking-widest text-base sm:text-lg text-center text-muted"
          >
            ••••••••••••••••••••••••••••••••
          </p>
        )}
      </div>
    </div>
  );
}


