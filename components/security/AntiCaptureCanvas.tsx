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

    function redrawTextAndMask() {
      // 1. Draw crisp emerald text to textCanvas
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

      // 2. Draw binary mask for RDK mode
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
      for (let i = 0; i < maskW * maskH; i++) {
        maskData[i] = maskRaw[i * 4] > 128 ? 1 : 0;
      }
    }

    redrawTextAndMask();

    // Re-render when web fonts load asynchronously
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) redrawTextAndMask();
      });
    }

    function isInsideText(cssX: number, cssY: number): boolean {
      const mx = Math.floor(cssX / 2);
      const my = Math.floor(cssY / 2);
      if (mx < 0 || mx >= maskW || my < 0 || my >= maskH) return false;
      return maskData[my * maskW + mx] === 1;
    }

    // ── Step 3: Kinetic RDK Particles (arXiv:2609.27461) ─────────────────────
    // Particles move coherently inside text vs background. Single photo sees only dots.
    const numParticles = isMobile ? 2200 : 3600;
    interface Particle {
      x: number;
      y: number;
      life: number;
      maxLife: number;
    }
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * cssW,
        y: Math.random() * cssH,
        life: Math.floor(Math.random() * 90),
        maxLife: 60 + Math.floor(Math.random() * 60),
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
      // MODE 2: KINETIC MOTION SHIELD (RDK / arXiv:2609.27461)
      // "Invisible in Space, Visible in Time"
      // In any single photo: ALL dots have identical size, color, brightness,
      // and uniform distribution. Photo contains ZERO text pixels.
      // Across time: dots inside text move right, background dots move left.
      // The human visual cortex (MT/V5) instantly perceives motion-defined text!
      // =======================================================================
      else if (mode === "kinetic") {
        ctx!.save();
        ctx!.scale(dpr, dpr);

        ctx!.fillStyle = "#10b981"; // Homogeneous emerald dots

        const dotSize = isMobile ? 2 : 2.2;
        const fgSpeed = 1.35;  // Text dots move right
        const bgSpeed = -1.35; // Background dots move left

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.life++;

          // Reset particle with random rebirth to preserve spatial entropy
          if (p.life > p.maxLife) {
            p.x = Math.random() * cssW;
            p.y = Math.random() * cssH;
            p.life = 0;
          }

          // Check if particle is currently over a letter stroke
          const inText = isInsideText(p.x, p.y);
          const velocity = inText ? fgSpeed : bgSpeed;

          p.x += velocity;
          if (p.x < 0) p.x += cssW;
          if (p.x >= cssW) p.x -= cssW;

          // Draw uniform dot — identical for text and background
          ctx!.fillRect(Math.round(p.x), Math.round(p.y), dotSize, dotSize);
        }

        ctx!.restore();
      }

      // =======================================================================
      // MODE 3: ROLLING-SHUTTER SCRAMBLER
      // High-frequency alternating scanline bars that induce violent black
      // banding across CMOS camera sensors while human eyes integrate text.
      // =======================================================================
      else if (mode === "shutter") {
        // Draw real decrypted text
        ctx!.drawImage(textCanvas, 0, 0);

        // Desynchronizing rolling stripe grid at 58.7Hz
        // Mismatches the camera's 60Hz/120Hz rolling shutter sensor, creating massive black bands
        const stripeH = Math.round(8 * dpr);
        const stripeSpeed = Math.round(frame * 3.5 * dpr) % (stripeH * 2);

        ctx!.fillStyle = "rgba(0, 0, 0, 0.88)";
        for (let y = stripeSpeed; y < H; y += stripeH * 2) {
          ctx!.fillRect(0, y, W, stripeH);
        }

        // Camera Auto-Exposure Blinding Beacons in all 4 corners
        // Forces smartphone camera auto-exposure to plunge, darkening the text area
        const beaconSize = Math.round(16 * dpr);
        const beaconPad = Math.round(6 * dpr);
        ctx!.fillStyle = frame % 2 === 0 ? "#ffffff" : "#10b981";
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
