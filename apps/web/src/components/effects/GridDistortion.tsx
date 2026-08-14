"use client";

import { useEffect, useRef } from "react";

interface GridDistortionProps {
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  className?: string;
}

export function GridDistortion({
  grid = 16,
  mouse = 0.25,
  strength = 0.4,
  relaxation = 0.9,
  className = "",
}: GridDistortionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Mouse coordinates in normalized space [0, 1]
    const mousePos = { x: -10, y: -10, prevX: -10, prevY: -10, vx: 0, vy: 0 };

    interface GridPoint {
      x: number;
      y: number;
      ox: number;
      oy: number;
      vx: number;
      vy: number;
    }

    let points: GridPoint[][] = [];
    const cols = grid;
    const rows = grid;

    const initGrid = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      points = [];
      for (let r = 0; r <= rows; r++) {
        const row: GridPoint[] = [];
        for (let c = 0; c <= cols; c++) {
          const x = (c / cols) * width;
          const y = (r / rows) * height;
          row.push({
            x,
            y,
            ox: x,
            oy: y,
            vx: 0,
            vy: 0,
          });
        }
        points.push(row);
      }
    };

    initGrid();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePos.vx = (x - mousePos.prevX) * 0.5;
      mousePos.vy = (y - mousePos.prevY) * 0.5;
      mousePos.x = x;
      mousePos.y = y;
      mousePos.prevX = x;
      mousePos.prevY = y;
    };

    const handleMouseLeave = () => {
      mousePos.x = -1000;
      mousePos.y = -1000;
    };

    const parent = canvas.parentElement || window;
    parent.addEventListener("mousemove", handleMouseMove as EventListener);
    parent.addEventListener("mouseleave", handleMouseLeave as EventListener);

    const handleResize = () => {
      initGrid();
    };
    window.addEventListener("resize", handleResize);

    let time = 0;

    const render = () => {
      time += 0.015;
      const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      ctx.clearRect(0, 0, width, height);

      // Base Black & Purple Deep Ambient Background
      const bgGrad = ctx.createRadialGradient(
        width / 2 + Math.sin(time) * 60,
        height / 2 + Math.cos(time * 0.8) * 60,
        40,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      bgGrad.addColorStop(0, "rgba(88, 28, 135, 0.45)"); // Deep neon purple
      bgGrad.addColorStop(0.35, "rgba(59, 7, 100, 0.35)");
      bgGrad.addColorStop(0.7, "rgba(18, 3, 33, 0.6)");
      bgGrad.addColorStop(1, "#000000");

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const mouseRadius = Math.max(width, height) * mouse;

      // Update grid point displacement
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const p = points[r]?.[c];
          if (!p) continue;

          // Natural organic wave drift
          const waveX = Math.sin(time + r * 0.3 + c * 0.2) * 4;
          const waveY = Math.cos(time + c * 0.3 - r * 0.2) * 4;

          const targetX = p.ox + waveX;
          const targetY = p.oy + waveY;

          // Distance to mouse
          const dx = mousePos.x - p.x;
          const dy = mousePos.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius && dist > 0) {
            const force = (1 - dist / mouseRadius) * strength * 24;
            const angle = Math.atan2(dy, dx);
            // Dynamic warp displacement
            p.vx += Math.cos(angle) * force + mousePos.vx * 0.15;
            p.vy += Math.sin(angle) * force + mousePos.vy * 0.15;
          }

          // Elastic return to original mesh coordinates
          const spring = 0.08;
          p.vx += (targetX - p.x) * spring;
          p.vy += (targetY - p.y) * spring;

          p.vx *= relaxation;
          p.vy *= relaxation;

          p.x += p.vx;
          p.y += p.vy;
        }
      }

      // Draw distorted grid mesh with glowing purple lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p1 = points[r]?.[c];
          const p2 = points[r]?.[c + 1];
          const p3 = points[r + 1]?.[c + 1];
          const p4 = points[r + 1]?.[c];

          if (!p1 || !p2 || !p3 || !p4) continue;

          // Cell distortion intensity
          const centerDist = Math.hypot(
            (p1.x + p3.x) / 2 - mousePos.x,
            (p1.y + p3.y) / 2 - mousePos.y
          );
          const activeGlow = Math.max(0, 1 - centerDist / mouseRadius);

          // Render Quad mesh
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();

          if (activeGlow > 0.05) {
            ctx.fillStyle = `rgba(168, 85, 247, ${activeGlow * 0.18})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(192, 132, 252, ${0.15 + activeGlow * 0.6})`;
            ctx.lineWidth = 1 + activeGlow * 1.5;
          } else {
            ctx.strokeStyle = "rgba(168, 85, 247, 0.12)";
            ctx.lineWidth = 0.75;
          }
          ctx.stroke();

          // Mesh intersection node dots
          if (activeGlow > 0.3) {
            ctx.fillStyle = `rgba(255, 255, 255, ${activeGlow * 0.8})`;
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, 1.5 * activeGlow, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      parent.removeEventListener("mousemove", handleMouseMove as EventListener);
      parent.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      window.removeEventListener("resize", handleResize);
    };
  }, [grid, mouse, strength, relaxation]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 block size-full ${className}`}
      aria-hidden="true"
    />
  );
}
