import { z } from "zod";

/** Stored invoice lines (validated on read). */
export const InvoiceLinesSchema = z.array(
  z.object({
    kind: z.enum(["subscription", "proration", "usage", "tax"]),
    description: z.string(),
    quantity: z.int(),
    amount: z.int(),
    period_start: z.int(),
    period_end: z.int(),
  }),
);
