/* eslint-disable react-hooks/purity */
"use client";

import { useFrame } from "@react-three/fiber";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const STAR_COUNT = 800;

/**
 * Cinematic Hyperspace Starfield.
 * Stars stretch into lines as scroll velocity increases.
 */
export function WarpStars() {
  const pointsRef = useRef<THREE.Points>(null);
  const velocityRef = useRef(0);
  const stRef = useRef<globalThis.ScrollTrigger | null>(null);

  useEffect(() => {
    stRef.current = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
    });
    return () => stRef.current?.kill();
  }, []);

  const { positions } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const ran = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // Y
      pos[i * 3 + 2] = Math.random() * -100; // Z (distance)
      ran[i] = Math.random();
    }
    return { positions: pos, randoms: ran };
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !stRef.current) return;

    // Get scroll velocity via GSAP
    const velocity = stRef.current.getVelocity();
    velocityRef.current = THREE.MathUtils.lerp(
      velocityRef.current,
      Math.abs(velocity) / 200,
      0.1,
    );

    const positionAttr = pointsRef.current.geometry.attributes.position;
    if (!positionAttr) return;
    const positionsArr = positionAttr.array as Float32Array;
    const baseSpeed = 0.2;
    const warpSpeed = velocityRef.current * 2;

    for (let i = 0; i < STAR_COUNT; i++) {
      const zi = i * 3 + 2;
      // Move stars forward
      const z = (positionsArr[zi] ?? 0) + baseSpeed + warpSpeed;
      positionsArr[zi] = z;

      // Reset stars to distant background if they pass camera
      if (z > 10) {
        positionsArr[zi] = -100;
        positionsArr[i * 3] = (Math.random() - 0.5) * 40;
        positionsArr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      }
    }

    positionAttr.needsUpdate = true;
    pointsRef.current.scale.z = 1 + velocityRef.current * 0.5;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={STAR_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
