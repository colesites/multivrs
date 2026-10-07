import type { DashboardSession, Scope } from "./types";

const KEY = "vrs-pay:dashboard-scope";
const DEFAULT: Scope = { merchant: null, mode: "test" };

/** The business and mode last shown in this browser (test mode for a first visit). */
export function readScope(): Scope {
  try {
    const saved: unknown = JSON.parse(
      window.localStorage.getItem(KEY) ?? "null",
    );
    if (typeof saved !== "object" || saved === null) return DEFAULT;
    const merchant =
      "merchant" in saved && typeof saved.merchant === "string"
        ? saved.merchant
        : null;
    const mode = "mode" in saved && saved.mode === "live" ? "live" : "test";
    return { merchant, mode };
  } catch {
    return DEFAULT;
  }
}

export function saveScope(scope: Scope): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(scope));
  } catch {
    // Private windows can refuse storage; the dashboard still works, it just won't remember.
  }
}

/**
 * What the server actually showed: the business it resolved (it falls back
 * to the user's own), and test mode until live is unlocked.
 */
export function settledScope(session: DashboardSession): Scope {
  return {
    merchant: session.merchant.id,
    mode: session.mode === "live" && session.live_unlocked ? "live" : "test",
  };
}
