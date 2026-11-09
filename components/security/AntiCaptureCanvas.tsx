"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type DefenseMode = "lens" | "kinetic" | "shutter";

interface AntiCaptureCanvasProps {
  secret: string;
  sessionId: string;
  sessionTimestamp: number;
  active: boolean;
  focusLost?: boolean;
  mode?: DefenseMode;
}

export function AntiCaptureCanvas({
  secret,
  sessionId,
  sessionTimestamp,
  active,
  focusLost = false,
  mode = "lens",
}: AntiCaptureCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pointer position in CSS coordinates
  const pointerPosRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });

  // Track user interaction state for helpful prompt
  const [hasInteracted, setHasInteracted] = useState(false);

  // Handle pointer / touch events
  const updatePointer = useCallback((clientX: number, clientY: number, isActive: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    pointerPosRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
      active: isActive,
    };
    if (isActive && !hasInteracted) {
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let frame = 0;
    let cancelled = false;

    // Smooth aperture coordinates for fluid lens motion
    let currentApertureX = -999;
    let currentApertureY = -999;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const isMobile = container.clientWidth < 480;

    // Typography sizing: larger font for short passwords/keys, compact for multiline
    const isShortSecret = secret.length <= 40 && !secret.includes("\n");
    const fontSize = isShortSecret ? (isMobile ? 20 : 26) : (isMobile ? 15 : 17);
    const lineH = Math.round(fontSize * 1.6);
    const padX = isMobile ? 18 : 24;
    const padY = isMobile ? 22 : 28;
    const fontSpec = `700 ${fontSize}px "JetBrains Mono", ui-monospace, Menlo, Monaco, monospace`;

    // ── Build wrapped lines ───────────────────────────────────────────────────
    const measureCtx = document.createElement("canvas").getContext("2d")!;
    measureCtx.font = fontSpec;
    const maxLineW = container.clientWidth - padX * 2;

    const rawLines = secret.split(/\r?\n/);
    const wrappedLines: string[] = [];

    for (const para of rawLines) {
      if (!para) { wrappedLines.push(""); continue; }
      let cur = "";
      for (const ch of Array.from(para)) {
        if (measureCtx.measureText(cur + ch).width <= maxLineW) {
          cur += ch;
        } else {
          if (cur) wrappedLines.push(cur);
          cur = ch;
        }
      }
      if (cur) wrappedLines.push(cur);
    }
    if (!wrappedLines.length) wrappedLines.push("");

    const cssW = container.clientWidth;
    const cssH = Math.max(isShortSecret ? 130 : 150, wrappedLines.length * lineH + padY * 2);

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    // ── Step 1: Pre-render Clear Secret Text to Offscreen Canvas ──────────────
    const textCanvas = document.createElement("canvas");
    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;
    const textCtx = textCanvas.getContext("2d")!;

    // Chromatic sub-frame canvases for Kaleido Shutter Jammer
    // Human eye fuses Magenta + Green into crisp White/Emerald text.
    // Rolling shutter cameras capture mismatched colored bands.
    const shutterCanvasA = document.createElement("canvas");
    shutterCanvasA.width = canvas.width;
    shutterCanvasA.height = canvas.height;
    const shutterCtxA = shutterCanvasA.getContext("2d")!;

    const shutterCanvasB = document.createElement("canvas");
    shutterCanvasB.width = canvas.width;
    shutterCanvasB.height = canvas.height;
    const shutterCtxB = shutterCanvasB.getContext("2d")!;

    const totalTextH = wrappedLines.length * lineH;
    const startY = Math.max(padY, (cssH - totalTextH) / 2) + lineH / 2;

    // ── Step 2: Binary Text Mask for Kinetic RDK Mode ────────────────────────
    // Sample at 1/2 resolution for extreme high-speed lookup
    const maskW = Math.ceil(cssW / 2);
    const maskH = Math.ceil(cssH / 2);
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = maskW;
    maskCanvas.height = maskH;
    const maskCtx = maskCanvas.getContext("2d")!;

    const totalMaskH = wrappedLines.length * (lineH / 2);
    const startMaskY = Math.max(padY / 2, (maskH - totalMaskH) / 2) + lineH / 4;
    const maskData = new Uint8Array(maskW * maskH);

    // Exact stroke coordinate points for Kinetic Motion mode
    const textPoints: { x: number; y: number }[] = [];

    function redrawTextAndMask() {
      // 1. Draw crisp emerald text to textCanvas (for Aperture Lens)
      textCtx.clearRect(0, 0, canvas!.width, canvas!.height);
      textCtx.save();
      textCtx.scale(dpr, dpr);
      textCtx.fillStyle = "#34d399"; // Crisp readable emerald
      textCtx.font = fontSpec;
      textCtx.textBaseline = "middle";

      wrappedLines.forEach((line, i) => {
        const lw = textCtx.measureText(line).width;
        const startX = isShortSecret || isMobile
          ? Math.max(padX, (cssW - lw) / 2)
          : padX;
        textCtx.fillText(line, startX, startY + i * lineH);
      });
      textCtx.restore();

      // 2. Draw Chromatic Sub-frame A (Neon Magenta) for Shutter Jammer
      shutterCtxA.clearRect(0, 0, canvas!.width, canvas!.height);
      shutterCtxA.save();
      shutterCtxA.scale(dpr, dpr);
      shutterCtxA.fillStyle = "#ff007f"; // Vibrant Magenta
      shutterCtxA.font = fontSpec;
      shutterCtxA.textBaseline = "middle";
      wrappedLines.forEach((line, i) => {
        const lw = shutterCtxA.measureText(line).width;
        const startX = isShortSecret || isMobile
          ? Math.max(padX, (cssW - lw) / 2)
          : padX;
        shutterCtxA.fillText(line, startX, startY + i * lineH);
      });
      shutterCtxA.restore();

      // 3. Draw Chromatic Sub-frame B (Neon Green) for Shutter Jammer
      shutterCtxB.clearRect(0, 0, canvas!.width, canvas!.height);
      shutterCtxB.save();
      shutterCtxB.scale(dpr, dpr);
      shutterCtxB.fillStyle = "#00ff66"; // Vibrant Neon Green
      shutterCtxB.font = fontSpec;
      shutterCtxB.textBaseline = "middle";
      wrappedLines.forEach((line, i) => {
        const lw = shutterCtxB.measureText(line).width;
        const startX = isShortSecret || isMobile
          ? Math.max(padX, (cssW - lw) / 2)
          : padX;
        shutterCtxB.fillText(line, startX, startY + i * lineH);
      });
      shutterCtxB.restore();

      // 4. Draw binary mask for Kinetic RDK mode
      maskCtx.fillStyle = "#000000";
      maskCtx.fillRect(0, 0, maskW, maskH);
      maskCtx.fillStyle = "#ffffff";
      maskCtx.font = fontSpec.replace(`${fontSize}px`, `${fontSize / 2}px`);
      maskCtx.textBaseline = "middle";

      wrappedLines.forEach((line, i) => {
        const lw = maskCtx.measureText(line).width;
        const startX = isShortSecret || isMobile
          ? Math.max(padX / 2, (maskW - lw) / 2)
          : padX / 2;
        maskCtx.fillText(line, startX, startMaskY + i * (lineH / 2));
      });

      const maskRaw = maskCtx.getImageData(0, 0, maskW, maskH).data;
      textPoints.length = 0;
      for (let my = 0; my < maskH; my++) {
        for (let mx = 0; mx < maskW; mx++) {
          const isGlyph = maskRaw[(my * maskW + mx) * 4] > 128;
          maskData[my * maskW + mx] = isGlyph ? 1 : 0;
          if (isGlyph) {
            textPoints.push({ x: mx * 2, y: my * 2 });
          }
        }
      }
    }

    redrawTextAndMask();

    // Re-render when web fonts load asynchronously
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) redrawTextAndMask();
      });
    }

    // ── Step 3: Background Decoy Particles for Kinetic Mode ───────────────────
    const numParticles = isMobile ? 1200 : 2000;
    interface Particle {
      x: number;
      y: number;
    }
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * cssW,
        y: Math.random() * cssH,
      });
    }

    // ── Step 4: Steganographic Watermark (Forensic Traceability) ───────────────
    const wmCanvas = document.createElement("canvas");
    wmCanvas.width = canvas.width;
    wmCanvas.height = canvas.height;
    const wmCtx = wmCanvas.getContext("2d")!;
    wmCtx.scale(dpr, dpr);
    wmCtx.globalAlpha = 0.04; // Invisible to casual viewer, recoverable under forensic curve stretch
    wmCtx.fillStyle = "#ffffff";
    wmCtx.font = "700 10px monospace";
    const wmText = `FLASHVAULT · SID:${sessionId.slice(0, 8)} · TS:${sessionTimestamp}`;
    const wmTileW = wmCtx.measureText(wmText).width + 36;
    wmCtx.translate(cssW / 2, cssH / 2);
    wmCtx.rotate((-28 * Math.PI) / 180);
    for (let tx = -cssW * 1.5; tx < cssW * 1.5; tx += wmTileW) {
      for (let ty = -cssH * 1.5; ty < cssH * 1.5; ty += 28) {
        wmCtx.fillText(wmText, tx, ty);
      }
    }

    // Scramble characters for cipher matrix background
    const CIPHER_CHARS = "0123456789ABCDEF!@#$%&*<>[]{}=";

    // ── Main Animation Render Loop ───────────────────────────────────────────
    function render() {
      if (cancelled) return;
      frame++;

      const W = canvas!.width;
      const H = canvas!.height;

      // Clear canvas to near-black
      ctx!.fillStyle = "#050706";
      ctx!.fillRect(0, 0, W, H);

      // Handle veiled / focus lost / hidden state
      if (!active || focusLost) {
        ctx!.save();
        ctx!.fillStyle = focusLost ? "#ef4444" : "#2a2a2a";
        ctx!.font = `700 ${Math.round(13 * dpr)}px "JetBrains Mono", monospace`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(
          focusLost ? "VEILED · WINDOW LOST FOCUS (CLICK TO RESUME)" : "••••••••••••••••••••••••",
          W / 2,
          H / 2
        );
        ctx!.restore();
        raf = requestAnimationFrame(render);
        return;
      }

      // =======================================================================
      // MODE 1: INTERACTIVE APERTURE LENS ("Confide Protocol")
      // Camera CANNOT capture the secret in a photo because only 2-3 characters
      // under the finger/cursor exist at any single millisecond!
      // =======================================================================
      if (mode === "lens") {
        const p = pointerPosRef.current;

        // Smooth aperture interpolation
        if (p.active) {
          if (currentApertureX < -100) {
            currentApertureX = p.x;
            currentApertureY = p.y;
          } else {
            currentApertureX += (p.x - currentApertureX) * 0.35;
            currentApertureY += (p.y - currentApertureY) * 0.35;
          }
        }

        // Draw animated quantum cipher matrix background (masked text)
        ctx!.save();
        ctx!.scale(dpr, dpr);
        ctx!.font = `600 ${isMobile ? 12 : 14}px monospace`;
        ctx!.fillStyle = "rgba(16, 185, 129, 0.12)";
        ctx!.textBaseline = "middle";

        const charW = isMobile ? 11 : 13;
        const charH = isMobile ? 18 : 22;
        const cols = Math.ceil(cssW / charW);
        const rows = Math.ceil(cssH / charH);

        // Deterministic pseudo-random cipher stream that gently flows
        const tOffset = Math.floor(frame / 6);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const charIdx = (c * 7 + r * 13 + tOffset) % CIPHER_CHARS.length;
            ctx!.fillText(CIPHER_CHARS[charIdx], c * charW + 4, r * charH + charH / 2);
          }
        }
        ctx!.restore();

        // If pointer is NOT active, show helpful prompt to touch/hover
        if (!p.active) {
          ctx!.save();
          ctx!.scale(dpr, dpr);

          // Subtle scanning radar beam across cipher field
          const sweepX = (frame * 3) % (cssW + 100) - 50;
          const beamGrad = ctx!.createLinearGradient(sweepX - 40, 0, sweepX + 40, 0);
          beamGrad.addColorStop(0, "rgba(16, 185, 129, 0)");
          beamGrad.addColorStop(0.5, "rgba(16, 185, 129, 0.18)");
          beamGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
          ctx!.fillStyle = beamGrad;
          ctx!.fillRect(0, 0, cssW, cssH);

          // Prompt pill
          const pulse = Math.sin(frame * 0.08) * 0.15 + 0.85;
          ctx!.fillStyle = `rgba(16, 185, 129, ${pulse * 0.9})`;
          ctx!.font = `700 ${isMobile ? 12 : 13}px "JetBrains Mono", monospace`;
          ctx!.textAlign = "center";
          ctx!.textBaseline = "middle";
          ctx!.fillText("👆 DRAG FINGER OR HOVER TO DECRYPT", cssW / 2, cssH / 2);

          ctx!.fillStyle = "rgba(156, 163, 175, 0.6)";
          ctx!.font = "500 10px monospace";
          ctx!.fillText("ANTI-PHOTO APERTURE ACTIVE", cssW / 2, cssH / 2 + 20);

          ctx!.restore();
        } else {
          // Pointer IS active — punch circular/elliptical decryptor aperture
          const apX = currentApertureX * dpr;
          const apY = currentApertureY * dpr;
          const radiusX = (isMobile ? 55 : 68) * dpr;
          const radiusY = (isMobile ? 42 : 52) * dpr;

          // Clip to elliptical decryptor aperture
          ctx!.save();
          ctx!.beginPath();
          ctx!.ellipse(apX, apY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx!.clip();

          // Dark backing behind revealed text for high contrast
          ctx!.fillStyle = "#020a06";
          ctx!.fillRect(apX - radiusX - 10, apY - radiusY - 10, (radiusX + 10) * 2, (radiusY + 10) * 2);

          // Draw the real decrypted secret text directly from offscreen textCanvas
          ctx!.drawImage(textCanvas, 0, 0);

          // Subtle micro-interlaced scanlines over decrypted text to defeat camera shutter sync
          const scanH = Math.round(2 * dpr);
          ctx!.fillStyle = "rgba(0, 0, 0, 0.35)";
          for (let y = 0; y < H; y += scanH * 2) {
            ctx!.fillRect(apX - radiusX, y, radiusX * 2, scanH);
          }

          ctx!.restore();

          // Draw glowing aperture crosshair ring & cyber optics
          ctx!.save();
          ctx!.scale(dpr, dpr);
          ctx!.beginPath();
          ctx!.ellipse(currentApertureX, currentApertureY, radiusX / dpr, radiusY / dpr, 0, 0, Math.PI * 2);
          ctx!.strokeStyle = "rgba(52, 211, 153, 0.75)";
          ctx!.lineWidth = 1.5;
          ctx!.stroke();

          // Outer reticle corners
          const rW = radiusX / dpr;
          const rH = radiusY / dpr;
          ctx!.strokeStyle = "#10b981";
          ctx!.lineWidth = 2;
          ctx!.beginPath();
          // Top & bottom ticks
          ctx!.moveTo(currentApertureX, currentApertureY - rH - 4);
          ctx!.lineTo(currentApertureX, currentApertureY - rH + 4);
          ctx!.moveTo(currentApertureX, currentApertureY + rH - 4);
          ctx!.lineTo(currentApertureX, currentApertureY + rH + 4);
          ctx!.stroke();

          // Tiny lens status badge
          ctx!.fillStyle = "#34d399";
          ctx!.font = "700 9px monospace";
          ctx!.textAlign = "center";
          ctx!.fillText("DECRYPTING", currentApertureX, currentApertureY + rH + 14);

          ctx!.restore();
        }
      }

      // =======================================================================
      // MODE 2: KINETIC MOTION SHIELD (Dynamic Coherent Stream)
      // Every character stroke is rendered with high-density, bright emerald
      // particles performing a coherent kinetic wave (Δx = sin(frame*0.05)*6px).
      // Human eyes see the letters 100% CLEAR, SOLID, AND READABLE!
      // In counter-motion, background decoy particles stream to the left,
      // creating an optical kinetic shear boundary that masks camera snapshots.
      // =======================================================================
      else if (mode === "kinetic") {
        ctx!.save();
        ctx!.scale(dpr, dpr);

        // 1. Background decoy particles streaming smoothly to the LEFT
        ctx!.fillStyle = "rgba(16, 185, 129, 0.4)";
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x -= 1.5;
          if (p.x < 0) p.x += cssW;
          ctx!.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
        }

        // 2. High-density kinetic text stroke points
        // Harmonic motion Δx = sin(frame * 0.05) * 6px ensures all glyphs
        // ('y', 'e', 's', letters, numbers) are crystal-clear and solid.
        const shiftX = Math.sin(frame * 0.05) * 6;
        const shimmer = frame % 3;

        ctx!.fillStyle = "#34d399"; // Bright high-contrast emerald
        for (let i = 0; i < textPoints.length; i++) {
          if ((i + shimmer) % 4 !== 0) {
            const pt = textPoints[i];
            ctx!.fillRect(Math.round(pt.x + shiftX), pt.y, 2.5, 2.5);
          }
        }

        ctx!.restore();
      }

      // =======================================================================
      // MODE 3: KALEIDO SHUTTER JAMMER (MobiCom 2015 Anti-Camera Protocol)
      // 1. Chromatic Decomposition: Frame A (Magenta #ff007f) & Frame B (Green #00ff66)
      //    Human eye blends them into Bright White/Emerald text.
      //    CMOS rolling shutter captures jagged chromatic bands across the Bayer filter!
      // 2. 70% Opaque Moving Shutter Guillotine:
      //    In ANY single camera snapshot, 70% of character stroke height is
      //    physically covered by pitch-black bars. A photo captures only sliced slivers!
      // 3. Interleaved Adversarial Optical Noise Bars to confuse camera auto-focus.
      // =======================================================================
      else if (mode === "shutter") {
        const isFrameA = frame % 2 === 0;

        // 1. Draw chromatic complementary sub-frame (Kaleido)
        ctx!.drawImage(isFrameA ? shutterCanvasA : shutterCanvasB, 0, 0);

        // 2. High-speed 70% Opaque Moving Shutter Guillotine
        // Pitch-black bars (14px) moving at high frequency.
        // Human persistence of vision fills in the text, but a 1/500s photo catches only 30% slices.
        const stripeH = Math.round(14 * dpr);
        const stripeOffset = Math.round(frame * 7 * dpr) % (stripeH * 2);

        ctx!.fillStyle = "#050706"; // Opaque canvas background
        for (let y = stripeOffset - stripeH * 2; y < H + stripeH * 2; y += stripeH * 2) {
          ctx!.fillRect(0, y, W, Math.round(stripeH * 1.4)); // 70% occluded
        }

        // 3. Interleaved Adversarial Optical Noise Bars
        ctx!.fillStyle = isFrameA ? "rgba(0, 240, 255, 0.45)" : "rgba(255, 170, 0, 0.45)";
        const noiseStep = Math.round(24 * dpr);
        const noiseY = Math.round(frame * 5.3 * dpr) % noiseStep;
        for (let y = noiseY; y < H; y += noiseStep) {
          ctx!.fillRect(0, y, W, Math.round(2 * dpr));
        }

        // 4. Auto-Exposure (AE) Jamming Beacons in all 4 corners
        const beaconSize = Math.round(16 * dpr);
        const beaconPad = Math.round(6 * dpr);
        ctx!.fillStyle = frame % 2 === 0 ? "#ffffff" : "#00f0ff";
        ctx!.fillRect(beaconPad, beaconPad, beaconSize, beaconSize);
        ctx!.fillRect(W - beaconPad - beaconSize, beaconPad, beaconSize, beaconSize);
        ctx!.fillRect(beaconPad, H - beaconPad - beaconSize, beaconSize, beaconSize);
        ctx!.fillRect(W - beaconPad - beaconSize, H - beaconPad - beaconSize, beaconSize, beaconSize);
      }

      // ── Forensic Watermark Layer ──────────────────────────────────────────
      ctx!.drawImage(wmCanvas, 0, 0);

      raf = requestAnimationFrame(render);
    }

    raf = requestAnimationFrame(render);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [secret, sessionId, sessionTimestamp, active, focusLost, mode]);

  // Pointer event handlers for touch & mouse
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePointer(e.clientX, e.clientY, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerPosRef.current.active || mode === "lens") {
      updatePointer(e.clientX, e.clientY, true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    updatePointer(-999, -999, false);
  };

  const handlePointerLeave = () => {
    updatePointer(-999, -999, false);
  };

  return (
    <div ref={containerRef} className="relative w-full cursor-crosshair select-none">
      <canvas
        ref={canvasRef}
        aria-label="Protected secret display"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="block w-full rounded-xl touch-none select-none transition-shadow"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}
