"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/* ─── Tilt3D: pointer-follow tilt with an idle sway ─── */

/**
 * Wraps layered children in a 3D stage. The stage tilts toward the pointer
 * when it is within `reach` pixels, and sways gently on its own otherwise.
 * It exposes `--tilt-x` / `--tilt-y` (-1..1) so layers can move highlights.
 * Children position themselves in depth with `Layer`.
 */
export function Tilt3D({
  children,
  className = "",
  maxDeg = 16,
  reach = 420,
}: {
  children: ReactNode;
  className?: string;
  maxDeg?: number;
  reach?: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduce) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let near = false;
    let visible = false;
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      near = Math.hypot(dx, dy) < reach;
      if (near) {
        target.x = Math.max(-1, Math.min(1, dx / (rect.width / 2 + 80)));
        target.y = Math.max(-1, Math.min(1, dy / (rect.height / 2 + 80)));
      }
    };

    const tick = (time: number) => {
      if (!near) {
        const t = time / 1000;
        target.x = Math.sin(t * 0.7) * 0.45;
        target.y = Math.cos(t * 0.55) * 0.3;
      }
      current.x += (target.x - current.x) * 0.07;
      current.y += (target.y - current.y) * 0.07;
      stage.style.transform = `rotateX(${(-current.y * maxDeg).toFixed(2)}deg) rotateY(${(current.x * maxDeg).toFixed(2)}deg)`;
      stage.style.setProperty("--tilt-x", current.x.toFixed(3));
      stage.style.setProperty("--tilt-y", current.y.toFixed(3));
      if (visible) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      const nowVisible = Boolean(entry?.isIntersecting);
      if (nowVisible && !visible) {
        visible = true;
        frame = requestAnimationFrame(tick);
      } else if (!nowVisible) {
        visible = false;
        cancelAnimationFrame(frame);
      }
    });
    observer.observe(stage);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [reduce, maxDeg, reach]);

  return (
    <div className={className} style={{ perspective: "900px" }}>
      <div
        ref={stageRef}
        className="relative size-full"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
          ["--tilt-x" as string]: "0",
          ["--tilt-y" as string]: "0",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** A depth plane inside a Tilt3D stage. */
export function Layer({
  z,
  children,
  className = "",
  style,
}: {
  z: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ transform: `translateZ(${z}px)`, ...style }}
    >
      {children}
    </div>
  );
}
