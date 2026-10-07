import { REFUND_REASONS } from "@vrs-pay/core";
import { z } from "zod";
import { MetadataSchema } from "./metadata.schema";

/** `POST /v1/refunds` body. Leave out `amount` to refund what's left. */
export const CreateRefundSchema = z.strictObject({
  payment: z.string().regex(/^pay_[0-9A-Za-z]{24}$/, "Expected a payment id (pay_…)"),
  amount: z.int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
  reason: z.enum(REFUND_REASONS).optional(),
  metadata: MetadataSchema,
});

export type CreateRefundInput = z.infer<typeof CreateRefundSchema>;
