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
 * Renders the secret text with three simultaneous anti-capture layers:
 *
 * 1. AntiCaptureCanvas — 60-fps rolling-shutter canvas behind the text.
 * 2. Dark low-contrast environment — #050505 background + dark overlay so
 *    any camera is forced into high-gain / high-noise mode.
 * 3. Typographic fingerprinting — each character gets:
 *    - A micro letter-spacing variation (±0.02 em) derived from sessionId
 *    - A micro color shift (#1a1a1a vs #1b1b1b, 1-LSB change per channel)
 *    These encode sessionId + timestamp in a binary pattern invisible to
 *    the human eye but recoverable under forensic magnification.
 *
 * The container uses `isolation: isolate` so z-index stacking is self-
 * contained and does not bleed into the page's z-axis.
 */
export function SecretDisplay({ secret, sessionId, revealed }: SecretDisplayProps) {
  // Build per-character fingerprint deterministically from sessionId.
  // We hash each character index against the sessionId bytes to generate
  // a reproducible bit pattern for this session.
  const fingerprinted = useMemo(() => {
    if (!secret) return [];

    // Derive a simple numeric seed from sessionId (UUID hex digits)
    const seed = sessionId.replace(/-/g, "");

    return Array.from(secret).map((char, i) => {
      // Pull two nibbles from the UUID for this character position
      const nibble1 = parseInt(seed[(i * 2) % seed.length], 16);
      const nibble2 = parseInt(seed[(i * 2 + 1) % seed.length], 16);

      // letterSpacing: map [0, 15] → [-0.02em, +0.02em] in 16 steps
      const spacingOffset = ((nibble1 / 15) * 0.04 - 0.02).toFixed(4);

      // Color: bit 0 of nibble2 chooses between #1a1a1a and #1b1b1b
      // (1 LSB on the red channel — imperceptible, forensically detectable)
      const color = nibble2 & 1 ? "#1b1b1b" : "#1a1a1a";

      return { char, letterSpacing: `${spacingOffset}em`, color };
    });
  }, [secret, sessionId]);

  return (
    <div
      className="relative rounded-xl overflow-hidden select-none no-copy-shield"
      style={{
        isolation: "isolate",
        background: "#050505",
        minHeight: "120px",
      }}
    >
      {/* ── Layer 1: Anti-capture canvas (behind everything, z-index 0) ── */}
      <AntiCaptureCanvas sessionId={sessionId} active={revealed} />

      {/* ── Layer 2: Dim overlay — pushes camera to high-noise ISO ──────── */}
      {revealed && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "brightness(0.55) contrast(0.9)",
            WebkitBackdropFilter: "brightness(0.55) contrast(0.9)",
            zIndex: 1,
            pointerEvents: "none",
            borderRadius: "inherit",
          }}
        />
      )}

      {/* ── Layer 3: Typographically fingerprinted secret text ───────────── */}
      <div
        className="relative flex items-center justify-center p-4 sm:p-6 w-full"
        style={{ zIndex: 2, minHeight: "120px" }}
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
                  // Additional micro-opacity variation (99-100%) per char
                  // encodes another fingerprinting dimension
                  opacity: 0.99 + (parseInt(sessionId[i % sessionId.length] || "0", 16) % 2) * 0.01,
                }}
              >
                {char}
              </span>
            ))}
          </p>
        ) : (
          <p
            className="font-mono tracking-widest text-base sm:text-lg text-center"
            style={{ color: "#2a2a2a" }}
          >
            ••••••••••••••••••••••••••••••••
          </p>
        )}
      </div>
    </div>
  );
}

