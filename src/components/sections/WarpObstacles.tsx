/* eslint-disable react-hooks/purity */
"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const OBSTACLE_COUNT = 40;

export function WarpObstacles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
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

  const { dummy, obstacles } = useMemo(() => {
    const dummyObj = new THREE.Object3D();
    const arr = [];
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      arr.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          Math.random() * -150
        ),
        rotation: new THREE.Vector3(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
      });
    }
    return { dummy: dummyObj, obstacles: arr };
  }, []);

  useFrame(() => {
    if (!meshRef.current || !stRef.current) return;

    const velocity = stRef.current.getVelocity();
    velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, Math.abs(velocity) / 150, 0.1);

    obstacles.forEach((obs, i) => {
      // Speed is base speed + scroll velocity
      obs.position.z += obs.speed + velocityRef.current;

      // Reset
      if (obs.position.z > 10) {
        obs.position.z = -150;
        obs.position.x = (Math.random() - 0.5) * 30;
        obs.position.y = (Math.random() - 0.5) * 20;
      }

      obs.rotation.x += 0.01;
      obs.rotation.y += 0.012;

      dummy.position.copy(obs.position);
      dummy.rotation.set(obs.rotation.x, obs.rotation.y, obs.rotation.z);
      dummy.scale.setScalar(obs.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, OBSTACLE_COUNT]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#3b82f6"
        emissiveIntensity={0.5}
        transparent
        opacity={0.6}
        roughness={0}
        metalness={1}
      />
    </instancedMesh>
  );
}
