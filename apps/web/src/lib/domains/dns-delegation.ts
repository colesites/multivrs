import "server-only";
import { z } from "zod";
import { OPENPROVIDER_NAMESERVERS } from "@/lib/domains/dns.types";

const dnsResponseSchema = z.object({
  Answer: z
    .array(z.object({ data: z.string() }))
    .optional()
    .default([]),
});

export async function lookupDnsDelegation(hostname: string): Promise<{
  delegated: boolean;
  observedNameservers: string[];
}> {
  const query = new URLSearchParams({ name: hostname, type: "NS" });
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?${query}`,
      { headers: { accept: "application/dns-json" }, cache: "no-store" },
    );
    if (!response.ok) return { delegated: false, observedNameservers: [] };
    const observedNameservers = dnsResponseSchema
      .parse(await response.json())
      .Answer.map((answer) => answer.data.replace(/\.$/, "").toLowerCase());
    const delegated = OPENPROVIDER_NAMESERVERS.every((nameserver) =>
      observedNameservers.includes(nameserver),
    );
    return { delegated, observedNameservers };
  } catch {
    return { delegated: false, observedNameservers: [] };
  }
}
