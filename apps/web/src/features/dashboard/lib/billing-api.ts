import type { z } from "zod";

export async function billingRequest<T>(
  path: string,
  method: "POST" | "PUT",
  body: object,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await fetch(path, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method,
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(errorMessage(payload));
  }
  const payload: unknown = await response.json();
  return schema.parse(payload);
}

function errorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object" || !("error" in payload)) {
    return "Billing request failed.";
  }
  const error = payload.error;
  if (!error || typeof error !== "object" || !("message" in error)) {
    return "Billing request failed.";
  }
  return typeof error.message === "string"
    ? error.message
    : "Billing request failed.";
}
