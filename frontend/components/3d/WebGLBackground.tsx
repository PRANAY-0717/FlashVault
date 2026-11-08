"use client";

import dynamic from "next/dynamic";

const ParticleScene = dynamic(
  () => import("./ParticleScene").then((m) => ({ default: m.ParticleScene })),
  { ssr: false }
);

export function WebGLBackground({ showOrb = false }: { showOrb?: boolean }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <ParticleScene showOrb={showOrb} />
    </div>
  );
}

