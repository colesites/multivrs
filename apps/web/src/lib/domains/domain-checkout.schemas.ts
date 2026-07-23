import type { z } from "zod";
import { connectDomainSchema } from "@/lib/domains/dns.schemas";

export const domainCheckoutSchema = connectDomainSchema;

export type DomainCheckoutInput = z.infer<typeof domainCheckoutSchema>;
