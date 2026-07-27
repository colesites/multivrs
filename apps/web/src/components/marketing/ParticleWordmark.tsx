"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useClientReady } from "@/hooks/use-client-viewport";
import { deterministicUnit } from "@/lib/deterministic-random";

const TEXT = "MULTIVRS";

function getTextPositions(
  text: string,
  width: number,
  height: number,
  density: number,
) {
  if (typeof document === "undefined") return new Float32Array(0); // SSR safety
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array(0);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "white";
  // Adjust font size and family to fit the brand aesthetic
  ctx.font = "900 140px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);

  const data = ctx.getImageData(0, 0, width, height)?.data;
  if (!data) return new Float32Array(0);

  const points: number[] = [];

  // Create particles based on density
  for (let y = 0; y < height; y += density) {
    for (let x = 0; x < width; x += density) {
      const idx = (y * width + x) * 4;
      // If the pixel is white (text)
      if (data[idx] !== undefined && data[idx] > 128) {
        // Scale down to 3D scene coordinates
        points.push(
          (x - width / 2) * 0.04,
          -(y - height / 2) * 0.04,
          (deterministicUnit(y * width + x) - 0.5) * 1.5,
        );
      }
    }
  }
  return new Float32Array(points);
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, pointer } = useThree();

  // Pre-calculate positions on mount
  const positions = useMemo(() => {
    return getTextPositions(TEXT, 1000, 300, 3);
  }, []);

  // Create randomized sizes and colors for variety
  const { sizes, colors } = useMemo(() => {
    const numPoints = positions.length / 3;
    const sizes = new Float32Array(numPoints);
    const colors = new Float32Array(numPoints * 3);

    const colorA = new THREE.Color("#2563eb"); // Blue
    const colorB = new THREE.Color("#9333ea"); // Purple
    const colorC = new THREE.Color("#10b981"); // Green/Teal accent

    for (let i = 0; i < numPoints; i++) {
      sizes[i] = deterministicUnit(i * 3 + 1) * 1.5 + 0.5;

      // Mix colors for a nebula effect
      const rand = deterministicUnit(i * 3 + 2);
      const mixedColor = colorA
        .clone()
        .lerp(rand > 0.5 ? colorB : colorC, deterministicUnit(i * 3 + 3));
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    return { sizes, colors };
  }, [positions]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const uniforms = shaderMatRef.current?.uniforms;
    if (!uniforms) return;

    if (uniforms.uTime) {
      uniforms.uTime.value = clock.elapsedTime;
    }

    // Smoothly interpolate mouse position into 3D scene coordinates
    // pointer is -1 to 1. multiply by viewport size/2.
    const targetX = (pointer.x * viewport.width) / 2;
    const targetY = (pointer.y * viewport.height) / 2;

    const mouse = uniforms.uMouse?.value;
    if (mouse instanceof THREE.Vector3) {
      mouse.lerp(new THREE.Vector3(targetX, targetY, 0), 0.1);
    }
  });

  if (positions.length === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>

      <shaderMaterial
        ref={shaderMatRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform vec3 uMouse;
          
          attribute float aSize;
          attribute vec3 aColor;
          
          varying vec3 vColor;
          
          // Simplex noise function
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
          }

          void main() {
            vColor = aColor;
            vec3 pos = position;
            
            // Continuous swirl using noise
            float noiseFreq = 0.5;
            float noiseAmp = 0.4;
            vec3 noisePos = vec3(pos.x * noiseFreq, pos.y * noiseFreq, pos.z + uTime * 0.2);
            pos.x += snoise(noisePos) * noiseAmp;
            pos.y += snoise(noisePos + 10.0) * noiseAmp;
            pos.z += snoise(noisePos + 20.0) * noiseAmp;
            
            // Mouse repel logic
            float dist = distance(pos.xy, uMouse.xy);
            float maxDist = 3.5; // radius of influence
            if(dist < maxDist) {
              vec2 dir = pos.xy - uMouse.xy;
              // Add a bit of 3D push back
              float force = (maxDist - dist) / maxDist; // 1 at center, 0 at edge
              // use smoothstep for smoother falloff
              force = smoothstep(0.0, 1.0, force);
              pos.xy += normalize(dir) * force * 1.5;
              pos.z += force * 2.0; // push them towards camera slightly
            }

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            // Size attenuation (closer particles are larger)
            gl_PointSize = aSize * (35.0 / -mvPosition.z);
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          
          void main() {
            // Create a soft glowing circle for each particle
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = dot(cxy, cxy);
            if (r > 1.0) discard;
            
            // Soft gradient edge
            float alpha = exp(-r * 3.0);
            gl_FragColor = vec4(vColor, alpha);
          }
        `}
      />
    </points>
  );
}

export function ParticleWordmark() {
  const ready = useClientReady();

  if (!ready) return null;

  return (
    <div className="absolute inset-0 h-full w-full pointer-events-auto cursor-crosshair">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
