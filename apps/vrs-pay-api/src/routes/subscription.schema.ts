import { z } from "zod";

/** `POST /v1/subscriptions/:id` — switch price and/or seats. */
export const UpdateSubscriptionSchema = z
  .strictObject({
    price: z
      .string()
      .regex(/^price_[0-9A-Za-z]{24}$/, "Expected a price id (price_…)")
      .optional(),
    quantity: z.int().min(1).max(10_000).optional(),
  })
  .refine((v) => v.price !== undefined || v.quantity !== undefined, {
    message: "Send price, quantity or both",
    path: ["price"],
  });

/** `POST /v1/subscriptions/:id/cancel`. */
export const CancelSubscriptionSchema = z.strictObject({
  at: z.enum(["period_end", "now"]).default("period_end"),
});

export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
