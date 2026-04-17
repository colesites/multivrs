/* eslint-disable react-hooks/purity */
"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
      pos[i * 3] = (Math.random() - 0.5) * 40;     // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // Y
      pos[i * 3 + 2] = Math.random() * -100;       // Z (distance)
      ran[i] = Math.random();
    }
    return { positions: pos, randoms: ran };
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !stRef.current) return;

    // Get scroll velocity via GSAP
    const velocity = stRef.current.getVelocity();
    velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, Math.abs(velocity) / 200, 0.1);

    const positionsArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const baseSpeed = 0.2;
    const warpSpeed = velocityRef.current * 2;

    for (let i = 0; i < STAR_COUNT; i++) {
        // Move stars forward
        positionsArr[i * 3 + 2] += baseSpeed + warpSpeed;

        // Reset stars to distant background if they pass camera
        if (positionsArr[i * 3 + 2] > 10) {
            positionsArr[i * 3 + 2] = -100;
            positionsArr[i * 3] = (Math.random() - 0.5) * 40;
            positionsArr[i * 3 + 1] = (Math.random() - 0.5) * 40;
        }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
