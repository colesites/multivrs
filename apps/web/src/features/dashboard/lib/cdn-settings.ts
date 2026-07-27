import type { CacheMode } from "@/features/dashboard/types/edge-settings.types";

export function cacheModeDescription(mode: CacheMode): string {
  if (mode === "smart")
    return "Honor route semantics and cache immutable assets.";
  if (mode === "aggressive")
    return "Prefer the configured edge TTL for static content.";
  return "Disable edge and browser caching.";
}

export function formatTtl(ttl: number): string {
  if (ttl === 0) return "Do not cache";
  return ttl >= 86400 ? `${ttl / 86400} days` : `${ttl / 60} minutes`;
}
