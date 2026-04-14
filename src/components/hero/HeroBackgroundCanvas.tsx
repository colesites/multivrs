"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { SpaceBackground } from "@/components/hero/SpaceBackground";

export function HeroBackgroundCanvas() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
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
          <SpaceBackground />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
