"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
}

export function FooterParticleBrand({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 90,
    };

    const initParticles = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Offscreen canvas to sample the logo and text
      const offCanvas = document.createElement("canvas");
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;

      offCanvas.width = width;
      offCanvas.height = height;

      // Draw the mark and text onto offscreen canvas
      offCtx.fillStyle = "#ffffff";
      offCtx.strokeStyle = "#ffffff";
      offCtx.lineCap = "round";
      offCtx.lineJoin = "round";

      // Responsive font & layout calculation
      const isMobile = width < 640;
      const fontSize = Math.min(Math.max(width * 0.12, 38), 96);
      const markSize = fontSize * 0.9;
      const spacing = isMobile ? 12 : 24;

      offCtx.font = `900 ${fontSize}px "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      offCtx.letterSpacing = "-0.04em";
      const text = "MULTIVRS";
      const textMetrics = offCtx.measureText(text);
      const totalWidth = markSize + spacing + textMetrics.width;

      const startX = (width - totalWidth) / 2;
      const centerY = height / 2;

      // Draw Multivrs Peak M logo mark
      offCtx.save();
      offCtx.translate(startX, centerY - markSize / 2);
      offCtx.lineWidth = markSize * 0.14;
      offCtx.beginPath();
      // "M14 78 L38 26 L50 52 L62 26 L86 78" scaled
      const s = markSize / 100;
      offCtx.moveTo(14 * s, 78 * s);
      offCtx.lineTo(38 * s, 26 * s);
      offCtx.lineTo(50 * s, 52 * s);
      offCtx.lineTo(62 * s, 26 * s);
      offCtx.lineTo(86 * s, 78 * s);
      offCtx.stroke();
      offCtx.restore();

      // Draw text
      offCtx.textBaseline = "middle";
      offCtx.fillText(text, startX + markSize + spacing, centerY + 2);

      // Sample pixels
      const imageData = offCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      particles = [];

      const step = isMobile ? 3 : 4;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];
          if (alpha && alpha > 128) {
            particles.push({
              x: x + (Math.random() - 0.5) * 8,
              y: y + (Math.random() - 0.5) * 8,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              size: isMobile ? 1.2 : 1.6,
              baseAlpha: (alpha / 255) * 0.95,
            });
          }
        }
      }
    };

    initParticles();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        if (touch) {
          mouse.x = touch.clientX - rect.left;
          mouse.y = touch.clientY - rect.top;
        }
      }
    };

    const handleTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    const resizeObserver = new ResizeObserver(() => {
      initParticles();
    });
    resizeObserver.observe(canvas);

    // Animation Loop with spring physics
    let time = 0;
    const render = () => {
      time += 0.02;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const friction = 0.88;
      const ease = 0.08;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;

        // Mouse repulsion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          const push = force * 16;
          p.vx -= Math.cos(angle) * push;
          p.vy -= Math.sin(angle) * push;
        }

        // Return to home position
        const homeDx = p.originX - p.x;
        const homeDy = p.originY - p.y;
        p.vx += homeDx * ease;
        p.vy += homeDy * ease;

        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        // Subtle organic breathing drift
        const wave = Math.sin(time + p.originX * 0.05 + p.originY * 0.05) * 0.4;

        ctx.fillStyle = isLight
          ? `rgba(0, 0, 0, ${p.baseAlpha})`
          : `rgba(255, 255, 255, ${p.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y + wave, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isLight]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ touchAction: "pan-y" }}>
      <canvas
        ref={canvasRef}
        className="block h-[180px] sm:h-[260px] md:h-[320px] w-full select-none cursor-pointer"
        style={{ touchAction: "pan-y" }}
        aria-label="Multivrs Interactive Particle Brand Logo"
      />
    </div>
  );
}
