import { z } from "zod";
import { connectDomainSchema } from "@/lib/domains/dns.schemas";

export const sandboxDomainOrderSchema = connectDomainSchema.extend({
  confirmSandbox: z.literal(true),
});

export type SandboxDomainOrderInput = z.infer<typeof sandboxDomainOrderSchema>;
