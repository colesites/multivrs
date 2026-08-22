"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Generic webmail domains where domain favicon is not a company brand logo
const GENERIC_WEBMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "zoho.com",
  "yandex.com",
]);

// Deterministic subtle avatar backgrounds based on string hash
const AVATAR_COLORS = [
  "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
];

function getInitials(name?: string, address?: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0];
    const second = parts[1];
    if (first && second && first[0] && second[0]) {
      return (first[0] + second[0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (address && address.includes("@")) {
    const local = address.split("@")[0] || "??";
    return local.slice(0, 2).toUpperCase();
  }
  return (address || "??").slice(0, 2).toUpperCase();
}

function getColorClass(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? AVATAR_COLORS[0] ?? "";
}

function resolveAvatarUrl(address: string): string | null {
  if (!address || !address.includes("@")) return null;
  const domain = address.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  const isGeneric = GENERIC_WEBMAIL_DOMAINS.has(domain);
  if (isGeneric) {
    // For personal email (like @gmail.com), check Gravatar directly without scraping random social handles
    return `https://unavatar.io/gravatar/${encodeURIComponent(address)}?fallback=false`;
  }

  // For company domains (like @multivrs.space, @vercel.com, @stripe.com), fetch verified domain logo
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
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
  const [imageError, setImageError] = useState(false);
  const logoUrl = resolveAvatarUrl(address);

  const initials = getInitials(name, address);
  const colorClass = getColorClass(address || name || "default");

  const sizeClasses = {
    sm: "size-6 text-[9px]",
    md: "size-8 text-[11px]",
    lg: "size-10 text-xs font-semibold",
  }[size];

  if (logoUrl && !imageError) {
    return (
      <div
        className={cn(
          "relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-black/10 bg-transparent shadow-xs dark:border-white/10",
          sizeClasses,
          className,
        )}
      >
        <img
          src={logoUrl}
          alt={name || address}
          className="size-full rounded-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full border font-medium uppercase transition-colors",
        sizeClasses,
        colorClass,
        className,
      )}
    >
      {initials}
    </div>
  );
}
