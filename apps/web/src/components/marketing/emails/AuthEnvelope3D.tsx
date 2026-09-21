"use client";

import { Layer, Tilt3D } from "./Tilt3D";
import { useReducedMotion } from "./use-reduced-motion";

/* ─── SPF / DKIM / DMARC envelope + shield (Deliverability section) ─── */

const ACCENT = "#A855F7";
const VIEWBOX = "0 0 240 160";

export function AuthEnvelope3D({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <Tilt3D
      className={`relative aspect-[3/2] ${className}`}
      maxDeg={14}
      reach={520}
    >
      {/* Incoming dashes, behind everything. */}
      <Layer z={-24}>
        <svg
          viewBox={VIEWBOX}
          className="size-full"
          fill="none"
          aria-hidden="true"
        >
          <g stroke="currentColor" strokeOpacity="0.25" strokeDasharray="2 4">
            <path d="M8 60h14M4 84h18M10 108h12">
              {reduce ? null : (
                <animate
                  attributeName="stroke-dashoffset"
                  from="12"
                  to="0"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              )}
            </path>
          </g>
        </svg>
      </Layer>

      {/* The envelope body. */}
      <Layer z={0}>
        <svg
          viewBox={VIEWBOX}
          className="size-full"
          fill="none"
          aria-hidden="true"
        >
          <g stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.25">
            <rect x="28" y="40" width="132" height="88" rx="8" />
            <path d="M28 48l66 46 66-46" />
            <path d="M28 128l48-40M160 128l-48-40" strokeOpacity="0.18" />
          </g>
        </svg>
      </Layer>

      {/* Protocol labels hover above the envelope. */}
      <Layer z={28}>
        <svg
          viewBox={VIEWBOX}
          className="size-full"
          fill="none"
          aria-hidden="true"
        >
          <g
            fontFamily="ui-monospace, monospace"
            fontSize="7"
            fill="currentColor"
            fillOpacity="0.6"
          >
            <text x="40" y="24">
              SPF
            </text>
            <text x="76" y="24">
              DKIM
            </text>
            <text x="118" y="24">
              DMARC
            </text>
          </g>
          <g fill={ACCENT}>
            {[34, 70, 112].map((cx, i) => (
              <circle key={cx} cx={cx} cy="31" r="2">
                {reduce ? null : (
                  <animate
                    attributeName="r"
                    values="2;3.2;2"
                    dur="2.4s"
                    begin={`${i * 0.8}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            ))}
          </g>
        </svg>
      </Layer>

      {/* Purple glow sits between the envelope and the shield. */}
      <Layer z={24}>
        <svg
          viewBox={VIEWBOX}
          className="size-full"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="auth3d-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="170" cy="92" r="58" fill="url(#auth3d-glow)" />
        </svg>
      </Layer>

      {/* The shield floats furthest forward, bobs, and redraws its check. */}
      <Layer z={64} className="drop-shadow-[0_12px_18px_rgba(168,85,247,0.35)]">
        <svg
          viewBox={VIEWBOX}
          className="size-full"
          fill="none"
          aria-hidden="true"
        >
          <g>
            {reduce ? null : (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;0 -3;0 0"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
            <path
              d="M170 58l30 11v22c0 20-13 33-30 40-17-7-30-20-30-40V69l30-11z"
              fill="var(--background, #000)"
              stroke={ACCENT}
              strokeWidth="1.5"
            />
            <path
              d="M158 93l8 8 16-17"
              stroke={ACCENT}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="36"
              strokeDashoffset="0"
            >
              {reduce ? null : (
                <animate
                  attributeName="stroke-dashoffset"
                  values="36;36;0;0"
                  keyTimes="0;0.15;0.45;1"
                  dur="4s"
                  repeatCount="indefinite"
                />
              )}
            </path>
          </g>
        </svg>
      </Layer>
    </Tilt3D>
  );
}
