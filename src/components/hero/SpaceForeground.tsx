/* eslint-disable react-hooks/purity */
"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Planet } from "@/components/hero/Planet";
import type { Group } from "three";

/**
 * Z-30 Foreground: Renders completely in front of the text.
 * Contains only the two massive framing planets.
 */
export function SpaceForeground() {
  const groupRef = useRef<Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    // Moving opposite or at different rates to background gives immense parallax depth
    const targetX = pointer.y * 0.05;
    const targetY = pointer.x * 0.07;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.02;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.02;
  });

  return (
    <group ref={groupRef}>
      {/* 
        Positioning: Brought heavily inward (closer to x=0) because at close camera depth (Z: 4) 
        the viewport width gets very small, which caused them to render off-screen previously!
      */}
      <Planet
        position={[-5.0, -2.5, 3]} 
        radius={1.75}
        speed={0.015}
        baseColor="#1d4ed8" // Rich blue base
        dustColor="#93c5fd" // Bright light-blue highlights
      />

      <Planet
        position={[5.5, -2.0, 2]} 
        radius={2.0}
        speed={-0.02}
        baseColor="#1d4ed8" // Exact same rich blue base
        dustColor="#93c5fd" // Exact same bright highlights
      />
    </group>
  );
}
