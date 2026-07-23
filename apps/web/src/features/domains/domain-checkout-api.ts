interface ApiErrorBody {
  error?: { message?: string };
}

export async function placeSandboxOrder(
  hostname: string,
  projectId: string,
): Promise<string> {
  const response = await fetch("/api/domains/register-test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hostname, projectId, confirmSandbox: true }),
  });
  const body = (await response.json()) as ApiErrorBody & {
    domainId?: string;
  };
  if (!response.ok || !body.domainId) {
    throw new Error(body.error?.message ?? "Sandbox order failed");
  }
  return body.domainId;
}

export async function createStripeCheckout(
  hostname: string,
  projectId: string,
): Promise<string> {
  const response = await fetch("/api/domains/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hostname, projectId }),
  });
  const body = (await response.json()) as ApiErrorBody & {
    checkoutUrl?: string;
  };
  if (!response.ok || !body.checkoutUrl) {
    throw new Error(body.error?.message ?? "Unable to start checkout");
  }
  return body.checkoutUrl;
}
