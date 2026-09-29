import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Country =
  | "us"
  | "eu"
  | "gb"
  | "ng"
  | "jp"
  | "br"
  | "in"
  | "de"
  | "ke";

// Simplified 20×20 circular flags — legible at 14–20px, no external assets.
const FLAGS: Record<Country, ReactNode> = {
  us: (
    <>
      <rect width="20" height="20" fill="#fff" />
      {[0, 4, 8, 12, 16].map((y) => (
        <rect key={y} y={y} width="20" height="2" fill="#d22f3c" />
      ))}
      <rect width="10" height="10" fill="#1f3a93" />
    </>
  ),
  eu: (
    <>
      <rect width="20" height="20" fill="#1d3fa6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <circle
            key={a}
            cx={10 + Math.cos(a) * 5.4}
            cy={10 + Math.sin(a) * 5.4}
            r="0.95"
            fill="#ffd400"
          />
        );
      })}
    </>
  ),
  gb: (
    <>
      <rect width="20" height="20" fill="#1f3a93" />
      <path d="M0 0l20 20M20 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0l20 20M20 0 0 20" stroke="#d22f3c" strokeWidth="1.4" />
      <path d="M10 0v20M0 10h20" stroke="#fff" strokeWidth="6" />
      <path d="M10 0v20M0 10h20" stroke="#d22f3c" strokeWidth="3.4" />
    </>
  ),
  ng: (
    <>
      <rect width="20" height="20" fill="#fff" />
      <rect width="6.7" height="20" fill="#118a4c" />
      <rect x="13.3" width="6.7" height="20" fill="#118a4c" />
    </>
  ),
  jp: (
    <>
      <rect width="20" height="20" fill="#fff" />
      <circle cx="10" cy="10" r="4.6" fill="#c8102e" />
    </>
  ),
  br: (
    <>
      <rect width="20" height="20" fill="#149b48" />
      <path d="M10 3 18 10 10 17 2 10z" fill="#fedf00" />
      <circle cx="10" cy="10" r="3.6" fill="#1d3a8a" />
    </>
  ),
  in: (
    <>
      <rect width="20" height="20" fill="#fff" />
      <rect width="20" height="6.7" fill="#ff9933" />
      <rect y="13.3" width="20" height="6.7" fill="#138808" />
      <circle
        cx="10"
        cy="10"
        r="2"
        fill="none"
        stroke="#000080"
        strokeWidth="0.8"
      />
    </>
  ),
  de: (
    <>
      <rect width="20" height="6.7" fill="#111" />
      <rect y="6.7" width="20" height="6.7" fill="#dd0000" />
      <rect y="13.3" width="20" height="6.7" fill="#ffce00" />
    </>
  ),
  ke: (
    <>
      <rect width="20" height="20" fill="#fff" />
      <rect width="20" height="5.6" fill="#111" />
      <rect y="7.2" width="20" height="5.6" fill="#b1181e" />
      <rect y="14.4" width="20" height="5.6" fill="#006300" />
    </>
  ),
};

export function Flag({
  country,
  className,
}: {
  country: Country;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-4 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" className="block size-full" aria-hidden="true">
        {FLAGS[country]}
      </svg>
    </span>
  );
}
