import { CurrencyCodeSchema, PAYMENT_METHODS } from "@vrs-pay/core";
import { z } from "zod";
import { HTTP_URL, MetadataSchema } from "./metadata.schema";

const MAX_DESCRIPTION_LENGTH = 250;

/** `POST /v1/checkout/sessions` body. Unknown fields are rejected. */
export const CreateCheckoutSessionSchema = z.strictObject({
  mode: z.literal("payment").optional(),
  amount: z.int().positive().max(Number.MAX_SAFE_INTEGER),
  currency: CurrencyCodeSchema,
  payment_method: z.enum(PAYMENT_METHODS).default("card"),
  description: z.string().trim().min(1).max(MAX_DESCRIPTION_LENGTH).optional(),
  success_url: HTTP_URL,
  cancel_url: HTTP_URL,
  customer_email: z.email().optional(),
  metadata: MetadataSchema,
});

export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;
