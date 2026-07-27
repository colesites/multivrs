import { z } from "zod";
import { connectDomainSchema } from "@/lib/domains/dns.schemas";

export const domainCheckoutSchema = z.object({
  hostnames: z
    .array(connectDomainSchema.shape.hostname)
    .min(1)
    .max(10)
    .refine(
      (hostnames) => new Set(hostnames).size === hostnames.length,
      "Domains must be unique",
    ),
});

export type DomainCheckoutInput = z.infer<typeof domainCheckoutSchema>;
