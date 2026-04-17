"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float as FloatDrei } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";
import { WarpStars } from "./WarpStars";
import { WarpObstacles } from "./WarpObstacles";

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  {
    title: "Multivrs Space",
    tagline: "The Future of Deployment",
    color: "#3b82f6",
    description: "Connect your GitHub repository and let our Warp Network handle the rest. Global distribution with zero-latency delivery.",
  },
  {
    title: "Kontinue AI",
    tagline: "Intelligent Workflows",
    color: "#a855f7",
    description: "Amplify your team's productivity with our custom-trained AI models integrated directly into your development lifecycle.",
  },
  {
    title: "Nexus Framework",
    tagline: "Performance by Design",
    color: "#ec4899",
    description: "The lightweight, high-performance foundation for the modern web. Built for speed, scale, and the ultimate developer experience.",
  },
];

function FloatingElement({ color, position, index, activeIndex }: { color: string; position: [number, number, number]; index: number; activeIndex: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (!material) return;

    const t = state.clock.getElapsedTime();
    
    // Smooth visibility transition
    const isActive = activeIndex === index;
    const targetOpacity = isActive ? 1 : 0;
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.05);

    // Zoom arrival animation
    const targetZ = isActive ? 0 : -5;
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.05);

    meshRef.current.rotation.x = Math.cos(t / 4) / 4;
    meshRef.current.rotation.y = Math.sin(t / 4) / 4;
    meshRef.current.rotation.z = Math.sin(t / 4) / 4;
    meshRef.current.position.y = position[1] + Math.sin(t / 1.5) / 10;

    if (glowRef.current) {
        glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, isActive ? 5 : 0, 0.05);
    }
  });

  return (
    <FloatDrei speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[position[0], position[1], -10]}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0}
          roughness={0.1}
          metalness={0.9}
          transmission={0.3}
          thickness={0.5}
        />
        <pointLight ref={glowRef} intensity={0} distance={5} color={color} />
      </mesh>
    </FloatDrei>
  );
}

function Scene({ index }: { index: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Parallax
    const targetX = state.mouse.x * 0.3;
    const targetY = state.mouse.y * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.05);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
      
      <group ref={groupRef}>
        <WarpStars />
        <WarpObstacles />
        
        {PRODUCTS.map((product, i) => (
          <FloatingElement 
            key={product.title} 
            color={product.color} 
            position={[0, 0, 0]} 
            index={i}
            activeIndex={index}
          />
        ))}
      </group>

      <Environment preset="night" />
    </>
  );
}

export function PremiumProductShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(() => {
    if (!containerRef.current) return;

    const sections = gsap.utils.toArray<HTMLElement>(".product-section");
    
    // Update active index based on scroll with threshold
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const newIndex = Math.min(
          Math.floor(progress * PRODUCTS.length),
          PRODUCTS.length - 1
        );
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
        }
      },
    });

    // Content entrance/exit animations
    sections.forEach((section) => {
      const headline = section.querySelector(".product-headline");
      const subheadline = section.querySelector(".product-subheadline");
      const description = section.querySelector(".product-description");

      gsap.fromTo(
        [headline, subheadline, description],
        { y: 40, opacity: 0, filter: "blur(12px)" },
        { 
          y: 0, 
          opacity: 1, 
          filter: "blur(0px)",
          duration: 1.5, 
          stagger: 0.15, 
          ease: "expo.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "bottom 25%",
            toggleActions: "play reverse play reverse",
          }
        }
      );
    });
  }, { scope: containerRef, dependencies: [activeIndex] });

  return (
    <section ref={containerRef} className="relative bg-[#030303] overflow-hidden">
      {/* Background Canvas fixed to viewport during scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <Scene index={activeIndex} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content layers */}
      <div className="relative z-10">
        {PRODUCTS.map((product) => (
          <div
            key={product.title}
            className="product-section flex h-screen w-full flex-col items-center justify-center px-6"
          >
            <div className="max-w-4xl text-center">
              <span className="product-subheadline mb-4 block text-xs font-semibold tracking-[0.5em] uppercase text-white/30">
                {product.tagline}
              </span>
              <h2 className="product-headline mb-8 font-clash text-5xl font-bold tracking-tighter text-white md:text-8xl lg:text-[11rem] leading-none">
                {product.title.split(" ").map((word, i) => (
                  <span key={i} className="inline-block mr-[0.2em] last:mr-0">{word}</span>
                ))}
              </h2>
              <p className="product-description mx-auto max-w-xl text-lg leading-relaxed text-white/40 md:text-xl font-acari">
                {product.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
