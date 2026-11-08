"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import dynamic from "next/dynamic";

function HeroOrb() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.x = t * 0.15;
      mesh.current.rotation.y = t * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <group>
        {/* Glowing core */}
        <mesh ref={mesh}>
          <icosahedronGeometry args={[1.5, 2]} />
          <MeshDistortMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.4}
            distort={0.3}
            speed={1.5}
            transparent
            opacity={0.2}
          />
        </mesh>
        {/* Wireframe outer */}
        <mesh scale={1.3}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial
            color="#34d399"
            emissive="#10b981"
            emissiveIntensity={0.8}
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
        {/* Inner glow rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.02, 8, 100]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={1} transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 3]}>
          <torusGeometry args={[2.5, 0.015, 8, 100]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} transparent opacity={0.25} />
        </mesh>
        <pointLight color="#10b981" intensity={6} distance={10} />
        <pointLight color="#6366f1" intensity={3} distance={8} position={[2, 2, 2]} />
      </group>
    </Float>
  );
}

function HeroVaultCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.2} />
      <HeroOrb />
    </Canvas>
  );
}

const HeroVaultDynamic = dynamic(() => Promise.resolve(HeroVaultCanvas), { ssr: false });

export function HeroVault() {
  return (
    <div className="w-full h-full">
      <HeroVaultDynamic />
    </div>
  );
}

