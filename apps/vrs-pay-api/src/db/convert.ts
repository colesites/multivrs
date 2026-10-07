import { type CurrencyCode, CurrencyCodeSchema } from "@vrs-pay/core";
import { z } from "zod";

const MetadataSchema = z.record(z.string(), z.string());

/** BigInt minor units → number, refusing anything outside the safe range. */
export function toMinor(value: bigint): number {
  const n = Number(value);
  if (!Number.isSafeInteger(n))
    throw new Error(`Amount ${value} is outside the safe integer range.`);
  return n;
}

export function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/** Stored metadata is always a flat string map; anything else is a bug. */
export function toMetadata(value: unknown): Record<string, string> {
  return MetadataSchema.parse(value);
}

/** Stored currencies are uppercase ISO codes. */
export function toCurrency(value: string): CurrencyCode {
  return CurrencyCodeSchema.parse(value);
}
