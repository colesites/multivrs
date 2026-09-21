"use client";

import { useSyncExternalStore } from "react";
import { watchMediaQuery } from "@/lib/browser/media-query";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

function serverSnapshot(): boolean {
  return false;
}

function subscribeDesktop(onChange: () => void): () => void {
  return watchMediaQuery(window.matchMedia(DESKTOP_MEDIA_QUERY), onChange);
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
