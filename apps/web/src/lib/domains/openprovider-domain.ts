import "server-only";
import { z } from "zod";
import {
  isLocalOpenproviderSandbox,
  openproviderFetch,
} from "@/lib/domains/openprovider-client";

const domainListSchema = z.object({
  data: z.object({
    results: z.array(z.object({ id: z.coerce.number() })).default([]),
  }),
});

export async function setProviderDomainAutoRenew(
  hostname: string,
  enabled: boolean,
): Promise<void> {
  if (isLocalOpenproviderSandbox()) return;
  const query = new URLSearchParams({ full_name: hostname, limit: "1" });
  const response = await openproviderFetch(`/v1beta/domains?${query}`);
  const domain = domainListSchema.parse(await response.json()).data.results[0];
  if (!domain) throw new Error(`${hostname} was not found at the registrar`);
  await openproviderFetch(`/v1beta/domains/${domain.id}`, {
    method: "PUT",
    body: JSON.stringify({ autorenew: enabled ? "on" : "off" }),
  });
}
