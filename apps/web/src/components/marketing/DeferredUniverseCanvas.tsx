"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const UniverseCanvas = dynamic(
  () =>
    import("./UniverseCanvas").then((module) => ({
      default: module.UniverseCanvas,
    })),
  { ssr: false },
);

export function DeferredUniverseCanvas() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 767px)").matches
    ) {
      return;
    }
    const idleId = window.requestIdleCallback(() => setReady(true), {
      timeout: 1600,
    });
    return () => window.cancelIdleCallback(idleId);
  }, []);

  return ready ? <UniverseCanvas /> : null;
}
