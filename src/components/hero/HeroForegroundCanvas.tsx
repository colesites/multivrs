"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { SpaceForeground } from "@/components/hero/SpaceForeground";

export function HeroForegroundCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SpaceForeground />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
