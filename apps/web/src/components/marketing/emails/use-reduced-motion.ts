"use client";

import { useSyncExternalStore } from "react";
import { watchMediaQuery } from "@/lib/browser/media-query";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  return watchMediaQuery(window.matchMedia(REDUCE_QUERY), onChange);
}

/** True when the visitor asked their system to reduce motion. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => true,
  );
}
