"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 600 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const mouse = useRef({ x: 0, y: 0 });

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const emerald = new THREE.Color("#10b981");
    const indigo = new THREE.Color("#6366f1");
    const white = new THREE.Color("#ffffff");

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const mix = Math.random();
      let color: THREE.Color;
      if (mix < 0.5) color = emerald;
      else if (mix < 0.8) color = indigo;
      else color = white;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.015;
      mesh.current.rotation.x = Math.sin(t * 0.008) * 0.1;
      // Subtle mouse parallax
      mesh.current.position.x += (mouse.current.x * 0.3 - mesh.current.position.x) * 0.05;
      mesh.current.position.y += (mouse.current.y * 0.2 - mesh.current.position.y) * 0.05;
    }
  });

  if (typeof window !== "undefined") {
    window.addEventListener("mousemove", (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function VaultOrb() {
  const mesh = useRef<THREE.Mesh>(null!);
  const wireframe = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.x = t * 0.12;
      mesh.current.rotation.y = t * 0.18;
      mesh.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
    if (wireframe.current) {
      wireframe.current.rotation.x = -t * 0.08;
      wireframe.current.rotation.y = t * 0.1;
      wireframe.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Inner solid core */}
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          wireframe={false}
        />
      </mesh>
      {/* Outer wireframe shell */}
      <mesh ref={wireframe} scale={1.4}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#34d399"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Point light inside orb */}
      <pointLight color="#10b981" intensity={4} distance={8} />
    </group>
  );
}

export function ParticleScene({ showOrb = false }: { showOrb?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.1} />
      <Particles count={700} />
      {showOrb && <VaultOrb />}
    </Canvas>
  );
}

