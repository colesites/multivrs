"use client";

import type { ReactNode } from "react";
import { useFeature } from "./hooks";

export interface GateProps {
  /** A feature key from your products, e.g. "exports" or "seats". */
  feature: string;
  children: ReactNode;
  /** Shown when the customer doesn't have the feature, e.g. an upgrade prompt. */
  fallback?: ReactNode;
  loading?: ReactNode;
}

/**
 * Shows `children` only to customers whose plan includes `feature`. This
 * hides UI; your server must still check entitlements before doing the work.
 */
export function Gate({ feature, children, fallback = null, loading = null }: GateProps) {
  const { granted, loading: pending } = useFeature(feature);
  if (pending) return <>{loading}</>;
  return <>{granted ? children : fallback}</>;
}
