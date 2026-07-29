"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Fallback = () => (
  <div className="fixed inset-0 z-0 bg-[#030303]" aria-hidden="true" />
);

const UniverseCanvas = dynamic(
  () =>
    import("./UniverseCanvas").then((module) => ({
      default: module.UniverseCanvas,
    })),
  { ssr: false, loading: Fallback },
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

  return ready ? <UniverseCanvas /> : <Fallback />;
}
