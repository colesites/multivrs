"use client";

import { Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { SpaceForeground } from "@/components/marketing/SpaceForeground";

export function HeroForegroundCanvas() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        // R3F sets pointer-events:auto on the canvas, which would override the
        // wrapper's `pointer-events-none` and steal hover/clicks from the hero
        // buttons sitting below it (z-20). Force it off — this layer is decor.
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <SpaceForeground />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
