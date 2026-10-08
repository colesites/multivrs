"use client";

import { resolveSenderInitialAndKey } from "@/features/mail/sender-utils";
import { cn } from "@/lib/utils";

const DEFAULT_AVATAR_COLOR = "bg-blue-600";

// 100% opaque solid background colors (Resend style)
const AVATAR_COLORS = [
  DEFAULT_AVATAR_COLOR,
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-orange-600",
  "bg-cyan-600",
  "bg-fuchsia-600",
  "bg-sky-600",
  "bg-pink-600",
] as const;

function getColorClass(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? DEFAULT_AVATAR_COLOR;
}

export function SenderAvatar({
  address,
  name,
  size = "md",
  className,
}: {
  address: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { initial, key } = resolveSenderInitialAndKey(name, address);
  const colorClass = getColorClass(key);

  const sizeClasses = {
    sm: "size-6 text-[11px]",
    md: "size-8 text-xs",
    lg: "size-10 text-sm",
  }[size];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full text-white font-medium select-none shadow-xs",
        sizeClasses,
        colorClass,
        className,
      )}
    >
      {initial}
    </div>
  );
}
