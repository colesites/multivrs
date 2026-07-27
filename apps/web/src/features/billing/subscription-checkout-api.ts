import { z } from "zod";

const checkoutSchema = z.object({ checkoutUrl: z.url() });
const apiErrorSchema = z.object({
  error: z.object({ message: z.string().optional() }).optional(),
});

export async function startSubscriptionCheckout(): Promise<string> {
  const response = await fetch("/api/stripe/checkout/subscriptions", {
    method: "POST",
  });
  if (!response.ok) {
    const body: unknown = await response.json();
    const parsed = apiErrorSchema.safeParse(body);
    throw new Error(
      parsed.success
        ? (parsed.data.error?.message ?? "Unable to start checkout")
        : "Unable to start checkout",
    );
  }
  const body: unknown = await response.json();
  return checkoutSchema.parse(body).checkoutUrl;
}
