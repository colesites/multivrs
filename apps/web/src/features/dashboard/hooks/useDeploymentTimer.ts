"use client";

import { useEffect, useRef, useState } from "react";

export function useDeploymentTimer() {
  const startedAt = useRef(0);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [seconds, setSeconds] = useState(0);

  function stop() {
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
  }

  function start() {
    if (interval.current) clearInterval(interval.current);
    startedAt.current = Date.now();
    setSeconds(0);
    interval.current = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt.current) / 1_000));
    }, 1_000);
  }

  useEffect(
    () => () => {
      if (interval.current) clearInterval(interval.current);
    },
    [],
  );
  return { seconds, start, stop };
}
