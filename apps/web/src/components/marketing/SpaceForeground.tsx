/* eslint-disable react-hooks/purity */
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { Planet } from "@/components/marketing/Planet";

/**
 * Z-30 Foreground: Renders completely in front of the text.
 * Contains only the two massive framing planets.
 */
export function SpaceForeground() {
  const groupRef = useRef<Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Moving opposite or at different rates to background gives immense parallax depth
    const targetX = pointer.y * 0.05;
    const targetY = pointer.x * 0.07;
    const damping = 1 - 0.98 ** (delta * 60);
    groupRef.current.rotation.x +=
      (targetX - groupRef.current.rotation.x) * damping;
    groupRef.current.rotation.y +=
      (targetY - groupRef.current.rotation.y) * damping;
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
        baseColor="#2e1065" // Deep cosmic violet base
        dustColor="#A855F7" // Bright electric purple highlights
      />

      <Planet
        position={[5.5, -2.0, 2]}
        radius={2.0}
        speed={-0.02}
        baseColor="#2e1065" // Deep cosmic violet base
        dustColor="#A855F7" // Bright electric purple highlights
      />
    </group>
  );
}
