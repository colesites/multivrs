"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";

function Wormhole() {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);

  // Generate 50,000 particles
  const { positions, sizes, colors, ids } = useMemo(() => {
    const numPoints = 50000;
    const positions = new Float32Array(numPoints * 3);
    const sizes = new Float32Array(numPoints);
    const colors = new Float32Array(numPoints * 3);
    const ids = new Float32Array(numPoints);

    const radius = 20;
    const length = 400;

    const colorA = new THREE.Color("#2563eb"); // Brand blue
    const colorB = new THREE.Color("#9333ea"); // Brand purple
    const colorC = new THREE.Color("#ffffff"); // Bright white highlights

    for (let i = 0; i < numPoints; i++) {
      ids[i] = i;

      // Base wormhole cylinder distribution
      const theta = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * length;
      const r = radius + (Math.random() - 0.5) * 5;

      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.sin(theta) * r;
      positions[i * 3 + 2] = z;

      sizes[i] = Math.random() * 2.0 + 0.5;

      const rand = Math.random();
      const c = colorA.clone().lerp(rand > 0.8 ? colorC : colorB, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, sizes, colors, ids };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uDeployIntensity: { value: 0 },
      uScaleIntensity: { value: 0 },
      uSecureIntensity: { value: 0 },
    }),
    []
  );

  const [capabilitiesProgress, setCapabilitiesProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = (e: any) => {
      setCapabilitiesProgress(e.detail.progress);
    };
    window.addEventListener("multivrs-capabilities-scroll", handleScroll);
    return () => window.removeEventListener("multivrs-capabilities-scroll", handleScroll);
  }, []);

  useFrame(({ clock }) => {
    if (!shaderMatRef.current || !shaderMatRef.current.uniforms) return;
    const u = shaderMatRef.current.uniforms as any;
    u.uTime.value = clock.getElapsedTime();

    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, scrollY / (maxScroll || 1)));
    u.uScrollProgress.value = progress;

    const capProg = capabilitiesProgress;
    
    // Deploy: peaks around 0.15
    let deployI = 0;
    if (capProg > 0.0 && capProg < 0.33) {
      deployI = 1.0 - Math.abs(capProg - 0.165) / 0.165;
    }
    
    // Scale: peaks around 0.5
    let scaleI = 0;
    if (capProg > 0.33 && capProg < 0.66) {
      scaleI = 1.0 - Math.abs(capProg - 0.5) / 0.165;
    }

    // Secure: peaks from 0.8 onwards
    let secureI = 0;
    if (capProg > 0.66) {
      secureI = Math.min(1.0, (capProg - 0.66) / 0.2); // ramps to 1
    }

    // Smooth interpolation for uniforms to prevent popping
    u.uDeployIntensity.value += (deployI - u.uDeployIntensity.value) * 0.05;
    u.uScaleIntensity.value += (scaleI - u.uScaleIntensity.value) * 0.05;
    u.uSecureIntensity.value += (secureI - u.uSecureIntensity.value) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aId" args={[ids, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderMatRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uScrollProgress;
          uniform float uDeployIntensity;
          uniform float uScaleIntensity;
          uniform float uSecureIntensity;
          
          attribute float aSize;
          attribute vec3 aColor;
          attribute float aId;
          varying vec3 vColor;

          // Simplex Noise
          vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
          vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
          float cnoise(vec3 P){
            vec3 Pi0 = floor(P);
            vec3 Pi1 = Pi0 + vec3(1.0);
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P);
            vec3 Pf1 = Pf0 - vec3(1.0);
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;
            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);
            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);
            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);
            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;
            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);
            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
            return 2.2 * n_xyz;
          }

          void main() {
            vec3 pos = position;
            
            // 1. BASE WORMHOLE STATE
            vec3 wormholePos = pos;
            wormholePos.z += uTime * 40.0 + uScrollProgress * 2000.0; 
            wormholePos.z = mod(wormholePos.z + 200.0, 400.0) - 200.0;
            float noise = cnoise(vec3(wormholePos.xy * 0.05, wormholePos.z * 0.01 + uTime * 0.2));
            wormholePos.xy += normalize(wormholePos.xy) * noise * 5.0;
            float angle = wormholePos.z * 0.01 + uTime * 0.5;
            mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            wormholePos.xy = rot * wormholePos.xy;

            // 2. DEPLOY STATE (Massive Structured Grid)
            float ix = mod(aId, 100.0) - 50.0;
            float iy = mod(floor(aId / 100.0), 50.0) - 25.0;
            float iz = mod(floor(aId / 5000.0), 10.0) - 5.0;
            vec3 deployPos = vec3(ix * 1.5, iy * 1.5, iz * 15.0 - 20.0);
            deployPos.z += mod(uTime * 10.0, 15.0); 

            // 3. SCALE STATE (Expanding Galaxy)
            float radiusScale = sqrt(aId / 50000.0) * 80.0 + 5.0;
            float thetaScale = radiusScale * 0.2 + aId + uTime * 0.5;
            vec3 scalePos = vec3(
              cos(thetaScale) * radiusScale,
              (mod(aId, 6.0) - 3.0) + sin(uTime + aId) * 2.0,
              sin(thetaScale) * radiusScale - 30.0
            );

            // 4. SECURE STATE (Supermassive Blackhole)
            float bhRadius = 20.0 + (aId / 50000.0) * 100.0; 
            float bhTheta = aId * 13.37 + uTime * 2.0; 
            vec3 securePos = vec3(
              cos(bhTheta) * bhRadius,
              (mod(aId, 2.0) - 1.0) * (aId / 50000.0) * 10.0, 
              sin(bhTheta) * bhRadius - 50.0
            );
            float distToCenter = length(securePos.xy);
            float suckForce = smoothstep(15.0, 0.0, distToCenter);
            securePos.xy = mix(securePos.xy, normalize(securePos.xy) * (distToCenter * 0.05), suckForce);

            // MORPHING LOGIC
            vec3 finalPos = wormholePos;
            finalPos = mix(finalPos, deployPos, uDeployIntensity);
            finalPos = mix(finalPos, scalePos, uScaleIntensity);
            finalPos = mix(finalPos, securePos, uSecureIntensity);

            // COLOR LOGIC
            vColor = aColor;
            
            vec3 deployColor = mix(aColor, vec3(0.145, 0.388, 0.922), 0.5); 
            vColor = mix(vColor, deployColor, uDeployIntensity);
            
            if (uSecureIntensity > 0.0) {
               float gray = dot(aColor, vec3(0.299, 0.587, 0.114));
               vec3 secureColor = vec3(gray);
               float glow = smoothstep(25.0, 5.0, distToCenter);
               secureColor = mix(secureColor, vec3(1.0, 0.8, 0.9), glow * 0.8);
               vColor = mix(vColor, secureColor, uSecureIntensity);
            }

            vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            float baseSize = aSize * (100.0 / -mvPosition.z);
            gl_PointSize = baseSize * (1.0 + noise * 0.5);
            gl_PointSize = mix(gl_PointSize, baseSize * 1.5, uDeployIntensity);
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = dot(cxy, cxy);
            if (r > 1.0) discard;
            float alpha = exp(-r * 3.0);
            gl_FragColor = vec4(vColor, alpha);
          }
        `}
      />
    </points>
  );
}

function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    const time = Date.now() * 0.001;
    camera.position.x = Math.sin(time * 0.5) * 1.5;
    camera.position.y = Math.cos(time * 0.4) * 1.5;
    camera.lookAt(0, 0, -50);
  });
  return null;
}

export function UniverseCanvas() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="fixed inset-0 h-screen w-screen z-0 pointer-events-none bg-[#030303]">
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
      >
        <fog attach="fog" args={["#030303", 10, 200]} />
        <ambientLight intensity={0.5} />
        
        <Wormhole />
        <CameraRig />
      </Canvas>
    </div>
  );
}
