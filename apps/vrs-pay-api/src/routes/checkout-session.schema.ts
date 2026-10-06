import { CurrencyCodeSchema, PAYMENT_METHODS } from "@vrs-pay/core";
import { z } from "zod";

const MAX_METADATA_KEYS = 50;
const MAX_METADATA_KEY_LENGTH = 40;
const MAX_METADATA_VALUE_LENGTH = 500;
const HTTP_URL = z.url({ protocol: /^https?$/ });

/** `POST /v1/checkout/sessions` body. Unknown fields are rejected. */
export const CreateCheckoutSessionSchema = z.strictObject({
  amount: z.int().positive().max(Number.MAX_SAFE_INTEGER),
  currency: CurrencyCodeSchema,
  payment_method: z.enum(PAYMENT_METHODS).default("card"),
  success_url: HTTP_URL,
  cancel_url: HTTP_URL,
  customer_email: z.email().optional(),
  metadata: z
    .record(z.string().max(MAX_METADATA_KEY_LENGTH), z.string().max(MAX_METADATA_VALUE_LENGTH))
    .refine((value) => Object.keys(value).length <= MAX_METADATA_KEYS, {
      message: `metadata can have at most ${MAX_METADATA_KEYS} keys`,
    })
    .default({}),
});

export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;
