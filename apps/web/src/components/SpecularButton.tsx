"use client";

import { useTheme } from "next-themes";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { useEffect, useRef, useSyncExternalStore } from "react";

type ButtonSize = "sm" | "md" | "lg";

export interface SpecularButtonProps {
  children?: ReactNode;
  size?: ButtonSize;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: "button" | "submit" | "reset";
  forceTheme?: "light" | "dark";
}

interface ShaderProps {
  radius: number;
  lineColor: string;
  baseColor: string;
  intensity: number;
  shineSize: number;
  shineFade: number;
  thickness: number;
  speed: number;
  followMouse: boolean;
  proximity: number;
  autoAnimate: boolean;
}

const PAD = 20;
const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const SIZES: Record<ButtonSize, string> = {
  sm: "text-[0.85rem] px-[22px] py-[10px]",
  md: "text-[1rem] px-[30px] py-[14px]",
  lg: "text-[1.15rem] px-10 py-[18px]",
};

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Dark base stroke hugging the edge for a sense of thickness
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  // Symmetric specular: the edges facing toward/away from the light both
  // catch a streak. The angular window (size + fade) is measured with an
  // elliptical normal so it varies continuously along straight edges.
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

const SpecularButton = ({
  children = "Get Started",
  size = "lg",
  radius = 18,
  tint = "#ffffff",
  tintOpacity = 0,
  blur = 0,
  textColor = "#f5f5f5",
  lineColor = "#ffffff",
  baseColor = "#525252",
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  onClick,
  className = "",
  type = "button",
  forceTheme,
}: SpecularButtonProps) => {
  const { resolvedTheme } = useTheme();
  const isClient = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );
  const isLight = (forceTheme || (isClient && resolvedTheme)) === "light";

  // Smart Light/Dark Mode Color Adaptation
  // We determine if it's a "primary" (solid) or "secondary" (translucent) button based on tintOpacity
  const isPrimary = tintOpacity > 0.5;

  const activeTint = isLight ? "#000000" : tint || "#ffffff";
  const activeBaseColor = isLight
    ? isPrimary
      ? "#000000"
      : "#e5e5e5"
    : baseColor || (isPrimary ? "#ffffff" : "#333333");
  const activeLineColor = isLight
    ? isPrimary
      ? "#ffffff"
      : "#000000"
    : lineColor || "#ffffff";
  const activeTextColor =
    textColor === "currentColor"
      ? "currentColor"
      : isLight
        ? isPrimary
          ? "#ffffff"
          : "#000000"
        : isPrimary
          ? "#000000"
          : "#ffffff";

  const btnRef = useRef<HTMLButtonElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const propsRef = useRef<ShaderProps>({
    radius,
    lineColor: activeLineColor,
    baseColor: activeBaseColor,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate,
  });

  useEffect(() => {
    propsRef.current = {
      radius,
      lineColor: activeLineColor,
      baseColor: activeBaseColor,
      intensity,
      shineSize,
      shineFade,
      thickness,
      speed,
      followMouse,
      proximity,
      autoAnimate,
    };
  }, [
    radius,
    activeLineColor,
    activeBaseColor,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate,
  ]);

  useEffect(() => {
    const btn = btnRef.current;
    const fx = fxRef.current;
    if (!btn || !fx) return;

    let raf = 0;
    let ro: ResizeObserver | null = null;
    let cleanGl: WebGLRenderingContext | WebGL2RenderingContext | null = null;

    try {
      const dpr = window.devicePixelRatio || 1;
      const renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        dpr,
      });
      const gl = renderer.gl;
      if (!gl) return;
      cleanGl = gl;

      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) delete geometry.attributes.uv;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uCenter: { value: [0, 0] },
          uHalfSize: { value: [1, 1] },
          uRadius: { value: 0 },
          uAngle: { value: 2.4 },
          uPx: { value: dpr },
          uLineColor: { value: [1, 1, 1] },
          uBaseColor: { value: [0.32, 0.32, 0.32] },
          uIntensity: { value: 1 },
          uShineSize: { value: 0.17 },
          uShineFade: { value: 0.7 },
          uThickness: { value: 1 },
          uBaseWidth: { value: dpr },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });
      const canvas = gl.canvas instanceof HTMLCanvasElement ? gl.canvas : null;
      if (canvas) fx.appendChild(canvas);

      const sizeRef = { w: 1, h: 1 };
      const resize = () => {
        const rect = btn.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        sizeRef.w = w;
        sizeRef.h = h;
        renderer.setSize(w + PAD * 2, h + PAD * 2);
        program.uniforms.uCenter.value = [
          (PAD + w / 2) * dpr,
          (PAD + h / 2) * dpr,
        ];
        program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr];
      };
      ro = new ResizeObserver(resize);
      ro.observe(btn);
      resize();

      let pointerAngle: number | null = null;
      let proximityT = 0;
      const onPointerMove = (e: PointerEvent) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
        const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
        const dist = Math.hypot(dx, dy);
        if (dist === 0) {
          const nx = (e.clientX - cx) / (rect.width / 2);
          const ny = (cy - e.clientY) / (rect.height / 2);
          pointerAngle =
            Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
        } else {
          pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
        }
        const t = Math.max(
          0,
          1 - dist / Math.max(propsRef.current.proximity, 1),
        );
        proximityT = t * t * (3 - 2 * t);
      };
      window.addEventListener("pointermove", onPointerMove);

      let angle = 2.4;
      let idleAngle = 2.4;
      let bright = 0;
      let last = performance.now();

      const lineC = new Color();
      const baseC = new Color();

      const update = (now: number) => {
        raf = requestAnimationFrame(update);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const p = propsRef.current;

        idleAngle += p.speed * dt;
        const steer =
          p.followMouse &&
          pointerAngle != null &&
          (!p.autoAnimate || proximityT > 0);
        const target = steer && pointerAngle != null ? pointerAngle : idleAngle;
        const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        angle += diff * (1 - Math.exp(-dt * 7));

        const brightTarget = p.autoAnimate ? 1 : proximityT;
        bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8));

        lineC.set(p.lineColor);
        baseC.set(p.baseColor);
        program.uniforms.uAngle.value = angle;
        program.uniforms.uRadius.value =
          Math.min(p.radius, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr;
        program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b];
        program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b];
        program.uniforms.uIntensity.value = p.intensity * bright;
        program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180;
        program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180;
        program.uniforms.uThickness.value = p.thickness * dpr;
        renderer.render({ scene: mesh });
      };
      raf = requestAnimationFrame(update);

      return () => {
        cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        if (canvas?.parentNode === fx) {
          fx.removeChild(canvas);
        }
        cleanGl?.getExtension("WEBGL_lose_context")?.loseContext();
      };
    } catch {
      // Safe fallback if WebGL fails or context is unavailable
    }
  }, []);

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`relative m-0 inline-flex cursor-pointer items-center justify-center border-none font-medium leading-none tracking-[0.01em] outline-hidden transition-transform duration-150 active:scale-[0.97] disabled:cursor-default disabled:opacity-55 disabled:active:scale-100 text-(--sb-text-color) rounded-(--sb-radius) [background:color-mix(in_srgb,var(--sb-tint)_calc(var(--sb-tint-opacity)*100%),transparent)] [backdrop-filter:blur(var(--sb-blur))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-[3px] ${SIZES[size] || SIZES.md}${className ? ` ${className}` : ""}`}
      style={
        {
          "--sb-radius": `${radius}px`,
          "--sb-tint": activeTint,
          "--sb-tint-opacity": tintOpacity,
          "--sb-blur": `${blur}px`,
          "--sb-text-color": activeTextColor,
        } as CSSProperties
      }
    >
      <span
        ref={fxRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-5 z-1 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
      />
      <span className="relative z-2">{children}</span>
    </button>
  );
};

export default SpecularButton;
