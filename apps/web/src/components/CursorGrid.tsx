"use client";

import { useEffect, useRef } from "react";
import {
  type CursorGridConfig,
  type CursorGridFalloff,
  startCursorGridRuntime,
} from "@/components/cursor-grid-runtime";

export interface CursorGridProps {
  cellSize?: number;
  color?: string;
  radius?: number;
  falloff?: CursorGridFalloff;
  holdTime?: number;
  fadeDuration?: number;
  lineWidth?: number;
  maxOpacity?: number;
  fillOpacity?: number;
  gridOpacity?: number;
  cellRadius?: number;
  clickPulse?: boolean;
  pulseSpeed?: number;
  className?: string;
}

export default function CursorGrid({
  cellSize = 70,
  color = "#D946EF",
  radius = 140,
  falloff = "smooth",
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1.2,
  maxOpacity = 1,
  fillOpacity = 0,
  gridOpacity = 0,
  cellRadius = 0,
  clickPulse = true,
  pulseSpeed = 600,
  className = "",
}: CursorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef<CursorGridConfig>({
    cellRadius,
    cellSize,
    clickPulse,
    color,
    fadeDuration,
    falloff,
    fillOpacity,
    gridOpacity,
    holdTime,
    lineWidth,
    maxOpacity,
    pulseSpeed,
    radius,
  });
  const wakeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    propsRef.current = {
      cellRadius,
      cellSize,
      clickPulse,
      color,
      fadeDuration,
      falloff,
      fillOpacity,
      gridOpacity,
      holdTime,
      lineWidth,
      maxOpacity,
      pulseSpeed,
      radius,
    };
  }, [
    cellRadius,
    cellSize,
    clickPulse,
    color,
    fadeDuration,
    falloff,
    fillOpacity,
    gridOpacity,
    holdTime,
    lineWidth,
    maxOpacity,
    pulseSpeed,
    radius,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    return startCursorGridRuntime({
      canvas,
      cellSize,
      container,
      propsRef,
      wakeRef,
    });
  }, [cellSize]);

  useEffect(() => {
    void [cellRadius, color, fillOpacity, gridOpacity, lineWidth, maxOpacity];
    wakeRef.current?.();
  }, [cellRadius, color, fillOpacity, gridOpacity, lineWidth, maxOpacity]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden${className ? ` ${className}` : ""}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
