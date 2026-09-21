/**
 * Schedules work for the browser's idle time, with a fallback.
 *
 * Safari only shipped `requestIdleCallback` in 17.4, and calling it on older
 * iOS and macOS throws. Everything that defers work until the browser is free
 * goes through here so no page depends on that API existing.
 *
 * Returns a cancel function, safe to call whether or not the work has run.
 */
export function onIdle(callback: () => void, timeout = 1000): () => void {
  if (typeof window === "undefined") return () => {};

  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(id);
      }
    };
  }

  // Without idle scheduling, run shortly after the current frame so the work
  // still lands after first paint rather than blocking it.
  const id = window.setTimeout(callback, Math.min(timeout, 200));
  return () => window.clearTimeout(id);
}
