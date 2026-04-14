/* eslint-disable react-hooks/purity */
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points as PointsType } from "three";
import * as THREE from "three";

const STAR_COUNT = 1200;
const SPHERE_RADIUS = 50;

/**
 * Procedural starfield on the inside of a large sphere.
 * Subtle twinkle via opacity cycling in the shader.
 */
export function Starfield() {
  const pointsRef = useRef<PointsType>(null);

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const sz = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = SPHERE_RADIUS + (Math.random() - 0.5) * 10;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      sz[i] = Math.random() * 1.5 + 0.3;
    }
    return { positions: pos, sizes: sz };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={STAR_COUNT}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          count={STAR_COUNT}
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#e8e0ff"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
