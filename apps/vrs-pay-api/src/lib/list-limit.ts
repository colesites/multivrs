import { z } from "zod";

const LimitSchema = z.coerce.number().int().min(1).max(100).default(25);

/** `?limit=` for list endpoints: 1–100, default 25. */
export function listLimit(value: string | undefined): number {
  return LimitSchema.parse(value);
}
