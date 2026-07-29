import { z } from "zod";
import { DNS_RECORD_TYPES, DNS_TTL_OPTIONS } from "@/lib/domains/dns.types";

const hostnamePattern =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export const hostnameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => value.replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
  .pipe(z.string().regex(hostnamePattern, "Enter a valid domain name"));

export const connectDomainSchema = z.object({
  hostname: hostnameSchema,
  projectId: z.uuid(),
});

export const assignDomainProjectSchema = z.object({
  projectId: z.uuid(),
});

export const updateDomainSchema = z
  .object({
    projectId: z.uuid().optional(),
    autoRenew: z.boolean().optional(),
  })
  .refine(
    (value) =>
      Number(value.projectId !== undefined) +
        Number(value.autoRenew !== undefined) ===
      1,
    "Provide exactly one domain update",
  );

export const dnsRecordInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .max(253)
      .regex(/^@|[a-zA-Z0-9_*.-]*$/, "Enter a valid record name"),
    type: z.enum(DNS_RECORD_TYPES),
    value: z.string().trim().min(1).max(4096),
    ttl: z.number().refine((value) => DNS_TTL_OPTIONS.includes(value as 900)),
    priority: z.number().int().min(0).max(65535).nullable().optional(),
  })
  .superRefine((record, context) => {
    if (record.type === "MX" && record.priority === null) {
      context.addIssue({
        code: "custom",
        message: "Priority is required for MX records",
        path: ["priority"],
      });
    }
  });

export const updateDnsRecordSchema = z.object({
  original: dnsRecordInputSchema,
  record: dnsRecordInputSchema,
});

export const removeDnsRecordSchema = z.object({
  record: dnsRecordInputSchema,
});
