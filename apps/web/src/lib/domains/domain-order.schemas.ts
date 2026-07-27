import { z } from "zod";
import { connectDomainSchema } from "@/lib/domains/dns.schemas";

export const sandboxDomainOrderSchema = z.object({
  hostname: connectDomainSchema.shape.hostname,
  confirmSandbox: z.literal(true),
});

export type SandboxDomainOrderInput = z.infer<typeof sandboxDomainOrderSchema>;
