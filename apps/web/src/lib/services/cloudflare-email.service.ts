import "server-only";
import { MultivrsError } from "@multivrs/error-utils";
import { z } from "zod";

const zoneResponseSchema = z.object({
  result: z.array(z.object({ id: z.string() })),
  success: z.boolean(),
});
const ruleResponseSchema = z.object({
  result: z.object({ id: z.string() }),
  success: z.boolean(),
});

function config() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw providerError("Cloudflare Email Routing is not configured");
  return {
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  };
}

async function zoneId(hostname: string): Promise<string> {
  const { headers } = config();
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(hostname)}`,
    { headers },
  );
  if (!response.ok)
    throw providerError(`Cloudflare zone lookup failed (${response.status})`);
  const parsed = zoneResponseSchema.parse(await response.json());
  const zone = parsed.result[0];
  if (!parsed.success || !zone)
    throw providerError(`No Cloudflare zone found for ${hostname}`);
  return zone.id;
}

export async function createCloudflareEmailRoute(
  source: string,
  destination: string,
) {
  const hostname = source.split("@")[1];
  if (!hostname) throw providerError("Email source domain is invalid");
  const zone = await zoneId(hostname);
  const { headers } = config();
  const enabled = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zone}/email/routing/enable`,
    { headers, method: "POST" },
  );
  if (!enabled.ok && enabled.status !== 409)
    throw providerError(
      `Email Routing could not be enabled (${enabled.status})`,
    );
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zone}/email/routing/rules`,
    {
      body: JSON.stringify(ruleBody(source, destination, true)),
      headers,
      method: "POST",
    },
  );
  if (!response.ok)
    throw providerError(`Email route creation failed (${response.status})`);
  return {
    providerRuleId: ruleResponseSchema.parse(await response.json()).result.id,
    zoneId: zone,
  };
}

export async function updateCloudflareEmailRoute(
  source: string,
  destination: string,
  providerRuleId: string,
  enabled: boolean,
) {
  const hostname = source.split("@")[1];
  if (!hostname) throw providerError("Email source domain is invalid");
  const zone = await zoneId(hostname);
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zone}/email/routing/rules/${providerRuleId}`,
    {
      body: JSON.stringify(ruleBody(source, destination, enabled)),
      headers: config().headers,
      method: "PUT",
    },
  );
  if (!response.ok)
    throw providerError(`Email route update failed (${response.status})`);
}

export async function deleteCloudflareEmailRoute(
  source: string,
  providerRuleId: string,
) {
  const hostname = source.split("@")[1];
  if (!hostname) throw providerError("Email source domain is invalid");
  const zone = await zoneId(hostname);
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zone}/email/routing/rules/${providerRuleId}`,
    { headers: config().headers, method: "DELETE" },
  );
  if (!response.ok && response.status !== 404)
    throw providerError(`Email route deletion failed (${response.status})`);
}

function ruleBody(source: string, destination: string, enabled: boolean) {
  return {
    actions: [{ type: "forward", value: [destination] }],
    enabled,
    matchers: [{ field: "to", type: "literal", value: source }],
    name: `Forward ${source}`,
  };
}

function providerError(message: string) {
  return new MultivrsError("internal_error", message, 502);
}
