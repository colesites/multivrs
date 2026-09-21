"use client";

import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { deterministicUnit } from "@/lib/deterministic-random";

/**
 * Hero object for /emails: a fanned stack of floating envelopes, each in a
 * different dark material (glossy, brushed, speckled, perforated), echoing a
 * material study the way Resend's cube does, but shaped like mail.
 */

const WIDTH = 2.4;
const HEIGHT = 1.6;
const DEPTH = 0.1;

function dataTexture(
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  repeat: number,
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

function useMaterials(): THREE.Material[] {
  // Materials and textures are GPU resources whose identity must stay stable.
  // react-doctor-disable-next-line react-doctor/react-compiler-no-manual-memoization
  return useMemo(() => {
    const noise = dataTexture((ctx, size) => {
      const image = ctx.createImageData(size, size);
      for (let i = 0; i < size * size; i++) {
        const v = 90 + Math.floor(deterministicUnit(i + 11) * 165);
        image.data[i * 4] = v;
        image.data[i * 4 + 1] = v;
        image.data[i * 4 + 2] = v;
        image.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    }, 3);

    const perforation = dataTexture((ctx, size) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#000000";
      const step = size / 8;
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          ctx.beginPath();
          ctx.arc(
            x * step + step / 2,
            y * step + step / 2,
            step * 0.28,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    }, 5);

    return [
      // Back: brushed gunmetal.
      new THREE.MeshPhysicalMaterial({
        color: "#1d1d22",
        metalness: 0.9,
        roughness: 0.38,
      }),
      // Perforated grille.
      new THREE.MeshPhysicalMaterial({
        color: "#121215",
        metalness: 0.75,
        roughness: 0.42,
        bumpMap: perforation,
        bumpScale: 2.2,
      }),
      // Speckled stone.
      new THREE.MeshPhysicalMaterial({
        color: "#2a2a2f",
        metalness: 0.35,
        roughness: 1,
        roughnessMap: noise,
        bumpMap: noise,
        bumpScale: 0.5,
      }),
      // Violet-tinted lacquer.
      new THREE.MeshPhysicalMaterial({
        color: "#1b1026",
        metalness: 0.55,
        roughness: 0.22,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
      }),
      // Front: glossy piano black.
      new THREE.MeshPhysicalMaterial({
        color: "#0a0a0c",
        metalness: 0.25,
        roughness: 0.26,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      }),
    ];
  }, []);
}

function useFlapShape(): THREE.Shape {
  // react-doctor-disable-next-line react-doctor/react-compiler-no-manual-memoization
  return useMemo(() => {
    const inset = 0.06;
    const shape = new THREE.Shape();
    shape.moveTo(-WIDTH / 2 + inset, HEIGHT / 2 - inset);
    shape.lineTo(WIDTH / 2 - inset, HEIGHT / 2 - inset);
    shape.lineTo(0, -0.08);
    shape.closePath();
    return shape;
  }, []);
}

const FLAP_EXTRUDE = {
  depth: 0.02,
  bevelEnabled: true,
  bevelThickness: 0.01,
  bevelSize: 0.012,
  bevelSegments: 3,
};

function Envelope({
  material,
  flap,
  position,
  rotation,
  seal = false,
}: {
  material: THREE.Material;
  flap: THREE.Shape;
  position: [number, number, number];
  rotation: [number, number, number];
  seal?: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox
        args={[WIDTH, HEIGHT, DEPTH]}
        radius={0.045}
        smoothness={4}
        material={material}
      />
      <mesh position={[0, 0, DEPTH / 2]} material={material}>
        <extrudeGeometry args={[flap, FLAP_EXTRUDE]} />
      </mesh>
      {seal ? (
        <mesh
          position={[0, -0.08, DEPTH / 2 + 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.15, 0.15, 0.04, 48]} />
          <meshStandardMaterial
            color="#7e22ce"
            emissive="#A855F7"
            emissiveIntensity={0.55}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function EnvelopeStack({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const materials = useMaterials();
  const flap = useFlapShape();

  useFrame((state) => {
    const g = group.current;
    if (!g || !animate) return;
    const t = state.clock.elapsedTime;
    const targetY = -0.78 + Math.sin(t * 0.25) * 0.16 + state.pointer.x * 0.28;
    const targetX = -0.42 + state.pointer.y * -0.16;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, 0.04);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.04);
  });

  return (
    <group ref={group} rotation={[-0.42, -0.78, 0.12]}>
      {materials.map((material, i) => {
        const offset = i - 2;
        return (
          <Envelope
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length stack
            key={i}
            material={material}
            flap={flap}
            seal={i === materials.length - 1}
            position={[offset * 0.3, offset * -0.27, offset * 0.52]}
            rotation={[offset * 0.04, offset * 0.08, offset * -0.2]}
          />
        );
      })}
    </group>
  );
}

export function EnvelopeStackScene({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.9], fov: 34 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      frameloop={animate ? "always" : "demand"}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[-4, 6, 4]} intensity={0.7} />
      <pointLight position={[3, -1, -3]} intensity={22} color="#A855F7" />

      <Float
        enabled={animate}
        speed={1.2}
        rotationIntensity={0.25}
        floatIntensity={0.6}
      >
        <EnvelopeStack animate={animate} />
      </Float>

      <ContactShadows
        position={[0, -1.9, 0]}
        opacity={0.55}
        scale={9}
        blur={2.8}
        far={3.5}
        frames={60}
      />

      {/* Local studio lighting: no HDR download, just a few light panels. */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, 5, -2]}
          scale={[10, 2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[-5, 1, 1]}
          rotation-y={Math.PI / 2}
          scale={[6, 1.2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[5, 2, -4]}
          rotation-y={-Math.PI / 3}
          scale={[4, 6, 1]}
        />
        <Lightformer
          form="ring"
          color="#A855F7"
          intensity={3}
          position={[4, -1, -3]}
          scale={3}
        />
      </Environment>
    </Canvas>
  );
}
