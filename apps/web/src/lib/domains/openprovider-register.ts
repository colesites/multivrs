import "server-only";
import { z } from "zod";
import { OPENPROVIDER_NAMESERVERS } from "@/lib/domains/dns.types";
import { registerLocalSandbox } from "@/lib/domains/local-sandbox-provider";
import {
  isLocalOpenproviderSandbox,
  isOpenproviderSandbox,
  openproviderFetch,
} from "@/lib/domains/openprovider-client";

const checkSchema = z.object({
  data: z.object({
    results: z.array(z.object({ domain: z.string(), status: z.string() })),
  }),
});
const registrationSchema = z.object({
  data: z.object({
    id: z.coerce.number().optional(),
    status: z.string().optional().default("requested"),
  }),
});

export interface SandboxRegistration {
  providerDomainId: number | null;
  status: string;
}

export async function registerSandboxDomain(
  hostname: string,
  customerHandle: string,
): Promise<SandboxRegistration> {
  if (!isOpenproviderSandbox()) {
    throw new Error("Test registration is restricted to Openprovider sandbox");
  }
  if (isLocalOpenproviderSandbox()) {
    return registerLocalSandbox(hostname);
  }
  return registerDomain(hostname, customerHandle);
}

export async function registerPaidDomain(
  hostname: string,
  customerHandle: string,
): Promise<SandboxRegistration> {
  if (isOpenproviderSandbox()) {
    throw new Error("Paid registration is disabled in sandbox mode");
  }
  return registerDomain(hostname, customerHandle);
}

async function registerDomain(
  hostname: string,
  customerHandle: string,
): Promise<SandboxRegistration> {
  const domain = splitDomain(hostname);
  const checkResponse = await openproviderFetch("/v1beta/domains/check", {
    method: "POST",
    body: JSON.stringify({ domains: [domain], with_price: true }),
  });
  const checked = checkSchema.parse(await checkResponse.json()).data.results[0];
  if (checked?.status !== "free") {
    throw new Error(`${hostname} is no longer available`);
  }
  const response = await openproviderFetch("/v1beta/domains", {
    method: "POST",
    body: JSON.stringify({
      domain,
      period: 1,
      owner_handle: customerHandle,
      admin_handle: customerHandle,
      tech_handle: customerHandle,
      billing_handle: customerHandle,
      autorenew: "on",
      name_servers: OPENPROVIDER_NAMESERVERS.map((name) => ({ name })),
    }),
  });
  const registration = registrationSchema.parse(await response.json()).data;
  return {
    providerDomainId: registration.id ?? null,
    status: registration.status,
  };
}

function splitDomain(hostname: string): { name: string; extension: string } {
  const separator = hostname.indexOf(".");
  if (separator < 1) throw new Error("Invalid domain name");
  return {
    name: hostname.slice(0, separator),
    extension: hostname.slice(separator + 1),
  };
}
