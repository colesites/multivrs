/* eslint-disable react-hooks/purity */
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";

interface PlanetProps {
  position: [number, number, number];
  radius?: number;
  speed?: number;
  baseColor?: string;
  dustColor?: string;
}

/**
 * Highly detailed but perfectly SMOOTH procedural planet.
 * No rings, no halos, no jagged vertices.
 * Uses advanced FBM noise in the fragment shader to paint swirling, intricate details
 * over the surface, making it look natural but not plain.
 */
export function Planet({
  position,
  radius = 2.5,
  speed = 0.05,
  baseColor = "#1d4ed8",
  dustColor = "#93c5fd",
}: PlanetProps) {
  const meshRef = useRef<Mesh>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);

  // A perfectly smooth, high-resolution sphere
  const geometry = useMemo(() => new THREE.SphereGeometry(radius, 128, 128), [radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uDustColor: { value: new THREE.Color(dustColor) },
      // Same harsh deep-space lighting vector
      uLightDir: { value: new THREE.Vector3(1.0, 1.0, 1.0).normalize() }, 
    }),
    [baseColor, dustColor]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current || !shaderMatRef.current) return;
    const t = clock.getElapsedTime();
    // Rotate physically
    meshRef.current.rotation.y = t * speed;
    
    // Animate the internal noise texture very gently to simulate atmospheric swirl
    shaderMatRef.current.uniforms.uTime.value = t * 0.05;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={geometry}>
        <shaderMaterial
          ref={shaderMatRef}
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
              vUv = uv;
              // Pass the normal perfectly unaltered so it remains perfectly smooth
              vNormal = normalize(normalMatrix * normal);
              
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vViewPosition = -mvPosition.xyz;
              // Smooth projection without any displacement
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uBaseColor;
            uniform vec3 uDustColor;
            uniform vec3 uLightDir;
            
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            // Simplex noise for organic detail
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

            // FBM for deeply detailed fluid/swirling color patterns
            float fbm(vec3 x) {
              float v = 0.0;
              float a = 0.5;
              vec3 shift = vec3(100.0);
              for (int i = 0; i < 6; ++i) { // High detail
                v += a * snoise(x);
                x = x * 2.0 + shift;
                a *= 0.5;
              }
              return v;
            }

            void main() {
              // Intricate swirling FBM pattern blending the two beautiful blue colours
              vec3 p = vec3(vUv * 6.0, uTime); // Map noise over UV
              float noiseVal = fbm(p);
              
              // We use smoothstep to create distinct bands of color, giving it sharp but fluid details
              float mixRatio = smoothstep(-0.2, 0.7, noiseVal);
              vec3 planetSurface = mix(uBaseColor, uDustColor, mixRatio);
              
              // Smooth, realistic directional lighting across the perfect sphere
              float diffuse = max(0.0, dot(vNormal, uLightDir));
              
              // Soft terminator so we can see the dark side
              diffuse = smoothstep(-0.2, 0.6, diffuse) * diffuse;

              // High ambient backlighting
              float ambient = 0.35;

              gl_FragColor = vec4(planetSurface * (diffuse + ambient), 1.0);
            }
          `}
        />
      </mesh>
    </group>
  );
}
