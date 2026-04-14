/* eslint-disable react-hooks/purity */
"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Starfield } from "@/components/hero/Starfield";
import { Asteroids } from "@/components/hero/Asteroids";
import type { Group } from "three";

/**
 * Z-0 Background: Renders behind the text.
 * Contains the Stars and Asteroids.
 */
export function SpaceBackground() {
  const groupRef = useRef<Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const targetX = pointer.y * 0.03;
    const targetY = pointer.x * 0.04;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.02;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.02;
  });

  return (
    <group ref={groupRef}>
      <Starfield />
      <fog attach="fog" args={["#030303", 10, 45]} />
      
      {/* Background ambient light */}
      <ambientLight intensity={0.4} color="#e0e7ff" />
      
      {/* Harsh directional light for asteroids */}
      <directionalLight position={[10, 20, 10]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-10, -10, -10]} intensity={1.0} color="#1d4ed8" />

      <Asteroids />
    </group>
  );
}
