/* eslint-disable react-hooks/purity */
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InstancedMesh } from "three";

const ASTEROID_COUNT = 150;

/**
 * Asteroid field using InstancedMesh for extreme performance.
 * Replaces traditional orbiting paths with organic "Mistroids" floating through.
 */
export function Asteroids() {
  const meshRef = useRef<InstancedMesh>(null);

  // Generate random asteroid transformations and speeds once
  const { dummy, asteroids } = useMemo(() => {
    const dummyObj = new THREE.Object3D();
    const arr = [];
    
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      arr.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 40 - 10
        ),
        rotation: new THREE.Vector3(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: Math.random() * 0.15 + 0.05,
        speed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          Math.random() * 0.03 + 0.01 // Move towards camera
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        )
      });
    }
    return { dummy: dummyObj, asteroids: arr };
  }, []);

  // Use a heavily modified geometry to simulate rough asteroids
  const geometry = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(1, 1);
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setXYZ(
        i,
        positions.getX(i) * (0.8 + Math.random() * 0.4),
        positions.getY(i) * (0.8 + Math.random() * 0.4),
        positions.getZ(i) * (0.8 + Math.random() * 0.4)
      );
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    
    asteroids.forEach((ast, i) => {
      ast.position.add(ast.speed);
      ast.rotation.add(ast.rotSpeed);
      
      // Wrap around logic if they float past the camera
      if (ast.position.z > 5) ast.position.z = -35;
      if (ast.position.x > 20) ast.position.x = -20;
      if (ast.position.x < -20) ast.position.x = 20;
      if (ast.position.y > 15) ast.position.y = -15;
      if (ast.position.y < -15) ast.position.y = 15;

      dummy.position.copy(ast.position);
      dummy.rotation.set(ast.rotation.x, ast.rotation.y, ast.rotation.z);
      dummy.scale.setScalar(ast.scale);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, ASTEROID_COUNT]}>
      <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
    </instancedMesh>
  );
}
