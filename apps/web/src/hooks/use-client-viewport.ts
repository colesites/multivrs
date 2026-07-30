"use client";

import { useSyncExternalStore } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

function serverSnapshot(): boolean {
  return false;
}

function subscribeDesktop(onChange: () => void): () => void {
  const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function desktopSnapshot(): boolean {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

export function useDesktopViewport(): boolean {
  return useSyncExternalStore(
    subscribeDesktop,
    desktopSnapshot,
    serverSnapshot,
  );
}
