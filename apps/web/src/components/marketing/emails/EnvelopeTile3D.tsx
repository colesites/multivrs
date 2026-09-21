"use client";

import { Layer, Tilt3D } from "./Tilt3D";
import { useReducedMotion } from "./use-reduced-motion";

/* ─── Envelope app-icon tile (Integrate section) ─── */

const RAYS = [-40, -26, -13, 0, 13, 26, 40];

export function EnvelopeTile3D() {
  const reduce = useReducedMotion();
  return (
    <Tilt3D className="relative mx-auto size-28 sm:size-32" maxDeg={20}>
      {/* Floor glow, furthest back. */}
      <Layer z={-40}>
        <div className="absolute inset-x-2 -bottom-6 h-10 rounded-full bg-[#A855F7]/45 blur-2xl" />
      </Layer>

      {/* The tile body. */}
      <Layer z={0}>
        <div className="size-full rounded-[30px] border border-white/10 bg-[linear-gradient(150deg,#2c2c31_0%,#0c0c0e_48%,#150c22_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-14px_30px_rgba(168,85,247,0.28),0_24px_48px_-18px_rgba(0,0,0,0.9)]" />
      </Layer>

      {/* The glowing interior of the envelope, sunk slightly above the tile. */}
      <Layer z={14}>
        <svg
          viewBox="0 0 128 128"
          className="size-full"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="tile3d-glow" cx="50%" cy="100%" r="80%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#6d28d9" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0b0b0e" stopOpacity="0" />
            </radialGradient>
            <clipPath id="tile3d-clip">
              <rect x="26" y="36" width="76" height="56" rx="9" />
            </clipPath>
          </defs>
          <rect x="26" y="36" width="76" height="56" rx="9" fill="#0d0b12" />
          <g clipPath="url(#tile3d-clip)">
            <rect x="26" y="36" width="76" height="56" fill="url(#tile3d-glow)">
              {reduce ? null : (
                <animate
                  attributeName="opacity"
                  values="0.75;1;0.75"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            {RAYS.map((dx, i) => (
              <path
                key={dx}
                d={`M64 96 L${64 + dx * 1.6} 36`}
                stroke="#e9d5ff"
                strokeOpacity="0.12"
                strokeWidth="1"
              >
                {reduce ? null : (
                  <animate
                    attributeName="stroke-opacity"
                    values="0.06;0.3;0.06"
                    dur="2.4s"
                    begin={`${i * 0.18}s`}
                    repeatCount="indefinite"
                  />
                )}
              </path>
            ))}
          </g>
        </svg>
      </Layer>

      {/* The chrome envelope outline floats furthest forward. */}
      <Layer z={38} className="drop-shadow-[0_10px_14px_rgba(0,0,0,0.6)]">
        <svg
          viewBox="0 0 128 128"
          className="size-full"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="tile3d-rim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path
            d="M29 41 L64 68 L99 41"
            stroke="url(#tile3d-rim)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <rect
            x="26"
            y="36"
            width="76"
            height="56"
            rx="9"
            stroke="url(#tile3d-rim)"
            strokeWidth="3.5"
          />
        </svg>
      </Layer>

      {/* Specular sheen that slides with the tilt. */}
      <Layer z={1} className="overflow-hidden rounded-[30px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at calc(50% - var(--tilt-x) * 45%) calc(25% - var(--tilt-y) * 45%), rgba(255,255,255,0.16), transparent 55%)",
          }}
        />
      </Layer>
    </Tilt3D>
  );
}
