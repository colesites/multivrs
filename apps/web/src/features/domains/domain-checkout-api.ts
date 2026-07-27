import { z } from "zod";

const checkoutResponseSchema = z.object({ clientSecret: z.string().min(1) });
const errorResponseSchema = z.object({
  error: z.object({ message: z.string() }),
});
const sandboxResponseSchema = z.object({ domainId: z.string().min(1) });

async function apiError(response: Response, fallback: string): Promise<Error> {
  const parsed = errorResponseSchema.safeParse(
    await response.json().catch(() => null),
  );
  return new Error(parsed.success ? parsed.data.error.message : fallback);
}

export async function placeSandboxOrder(hostname: string): Promise<string> {
  const response = await fetch("/api/domains/register-test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hostname, confirmSandbox: true }),
  });
  if (!response.ok) {
    throw await apiError(response, "Sandbox order failed");
  }
  return sandboxResponseSchema.parse(await response.json()).domainId;
}

export async function placeSandboxOrders(
  hostnames: string[],
): Promise<string[]> {
  return Promise.all(hostnames.map((hostname) => placeSandboxOrder(hostname)));
}

export async function createCustomStripeCheckout(
  hostnames: string[],
  attempt: number,
): Promise<string> {
  const response = await fetch("/api/domains/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-checkout-attempt": String(attempt),
    },
    body: JSON.stringify({ hostnames }),
  });
  if (!response.ok) {
    throw await apiError(response, "Unable to start checkout");
  }
  const body: unknown = await response.json();
  return checkoutResponseSchema.parse(body).clientSecret;
}
