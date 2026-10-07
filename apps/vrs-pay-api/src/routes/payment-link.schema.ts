import { CurrencyCodeSchema } from "@vrs-pay/core";
import { z } from "zod";
import { HTTP_URL } from "./metadata.schema";

/**
 * `POST /v1/payment_links` — sells one of your products' prices (`price`,
 * plus `currency` to pick one of its currency options; recurring ones
 * start a subscription), or a quick fixed amount (`amount`, `currency`,
 * `description`).
 */
export const CreatePaymentLinkSchema = z
  .strictObject({
    price: z.string().min(1).optional(),
    amount: z.int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
    currency: CurrencyCodeSchema.optional(),
    description: z.string().trim().min(1).max(250).optional(),
    after_payment_url: HTTP_URL.optional(),
  })
  .superRefine((input, ctx) => {
    const adHoc = [input.amount, input.currency, input.description];
    if (input.price && (input.amount !== undefined || input.description !== undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "Send a price or an amount, not both",
        path: ["price"],
      });
    } else if (!input.price && adHoc.some((v) => v === undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "Send a price, or an amount, currency and description",
        path: ["price"],
      });
    }
  });

export const UpdatePaymentLinkSchema = z.strictObject({ active: z.boolean() });

export type CreatePaymentLinkInput = z.infer<typeof CreatePaymentLinkSchema>;
