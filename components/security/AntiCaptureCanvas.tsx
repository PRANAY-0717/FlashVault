"use client";

import { useEffect, useRef } from "react";

interface AntiCaptureCanvasProps {
  sessionId: string;
  active: boolean; // only run when secret is revealed
}

/**
 * AntiCaptureCanvas
 *
 * Renders a <canvas> absolutely filling its nearest positioned parent.
 * Two simultaneous layers run on every requestAnimationFrame tick:
 *
 * Layer 1 — Rolling-shutter exploit grid (z-index below text)
 *   • Draws horizontal stripes alternating between two high-contrast colors.
 *   • The phase inverts each frame (60 fps target), so a camera's rolling
 *     shutter — which scans rows sequentially over ~16 ms — will record
 *     alternating bright/dark bands that obscure any text behind the grid.
 *
 * Layer 2 — Steganographic forensic watermark
 *   • Renders "sessionId | timestamp" text tiled diagonally at ~3 % opacity.
 *   • Invisible in normal viewing but recoverable under forensic contrast
 *     enhancement of a screenshot or photograph.
 */
export function AntiCaptureCanvas({ sessionId, active }: AntiCaptureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef(0); // 0 or 1 — flips every frame

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Resize observer keeps canvas pixel-perfect to its container ---
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    resizeObserver.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Pre-build watermark string once; timestamp is session-scoped
    const watermarkText = `SID:${sessionId} | TS:${Date.now()}`;

    function drawFrame() {
      if (!canvas || !ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // ── Layer 1: Phase-inverting high-frequency grid ─────────────────
      // Stripe height = 2 px; alternates black / emerald-900 each frame.
      // The tiny stripe creates a spatial frequency near sensor Nyquist →
      // maximum aliasing banding in camera captures.
      const stripeH = 2;
      const phase = phaseRef.current; // 0 or 1
      // Colors: near-black vs. very dark emerald (subtle enough for human
      // peripheral vision but high enough contrast for camera sensor)
      const colorA = phase === 0 ? "#000000" : "#022c1a";
      const colorB = phase === 0 ? "#022c1a" : "#000000";

      for (let y = 0; y < H; y += stripeH * 2) {
        ctx.fillStyle = colorA;
        ctx.fillRect(0, y, W, stripeH);
        ctx.fillStyle = colorB;
        ctx.fillRect(0, y + stripeH, W, stripeH);
      }

      // Flip phase for next frame → ~60 Hz alternation
      phaseRef.current = phase === 0 ? 1 : 0;

      // ── Layer 2: Steganographic forensic watermark ───────────────────
      // Tiled at 45° across the full canvas, globalAlpha ≈ 0.03 (3 %)
      ctx.save();
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";

      // Measure one tile width so we can tile without gaps
      const tileW = ctx.measureText(watermarkText).width + 60;
      const tileH = 40;

      // Rotate around center, then tile
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.translate(-W, -H);

      for (let tx = -W * 2; tx < W * 3; tx += tileW) {
        for (let ty = -H * 2; ty < H * 3; ty += tileH) {
          ctx.fillText(watermarkText, tx, ty);
        }
      }

      ctx.restore();

      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [sessionId, active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, borderRadius: "inherit" }}
    />
  );
}
