"use client";

import { useEffect, useRef } from "react";

interface AcidSquaresBackgroundProps {
  className?: string;
  cellSize?: number;
  hoverRadius?: number;
}

export function AcidSquaresBackground({
  className = "",
  cellSize = 54,
  hoverRadius = 160,
}: AcidSquaresBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const mouse = { x: -1000, y: -1000, active: false };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const parent = canvas.parentElement || window;
    parent.addEventListener("mousemove", handleMouseMove as EventListener);
    parent.addEventListener("mouseleave", handleMouseLeave as EventListener);
    window.addEventListener("resize", handleResize);

    let time = 0;

    const render = () => {
      time += 0.02;
      const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / cellSize) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellSize;
          const y = r * cellSize;
          const centerX = x + cellSize / 2;
          const centerY = y + cellSize / 2;

          // Distance to mouse
          const dx = mouse.x - centerX;
          const dy = mouse.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Acid wave oscillation
          const wave =
            Math.sin(time * 1.2 + c * 0.15 + r * 0.15) *
            Math.cos(time * 0.8 + c * 0.1 - r * 0.1);

          let fillOpacity = 0.015 + (wave + 1) * 0.015;
          let strokeOpacity = 0.06;
          let glow = 0;

          if (dist < hoverRadius) {
            const factor = (hoverRadius - dist) / hoverRadius;
            glow = factor;
            fillOpacity = 0.03 + factor * 0.14;
            strokeOpacity = 0.1 + factor * 0.45;
          }

          // Render acid square
          const pad = 2;
          const sqSize = cellSize - pad * 2;

          // Base fill with acid purple/violet glow on proximity
          if (glow > 0.05) {
            ctx.fillStyle = `rgba(168, 85, 247, ${fillOpacity * 1.5})`;
            ctx.strokeStyle = `rgba(192, 132, 252, ${strokeOpacity})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${fillOpacity})`;
            ctx.strokeStyle = `rgba(255, 255, 255, ${strokeOpacity})`;
          }

          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(x + pad, y + pad, sqSize, sqSize, 4);
          ctx.fill();
          ctx.stroke();

          // Acid center dot on high hover
          if (glow > 0.35) {
            ctx.fillStyle = `rgba(255, 255, 255, ${glow * 0.9})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 1.5 * glow, 0, Math.PI * 2);
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
  }, [cellSize, hoverRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 block size-full ${className}`}
      aria-hidden="true"
    />
  );
}
