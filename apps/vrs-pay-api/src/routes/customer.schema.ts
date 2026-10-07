import { z } from "zod";
import { MetadataMap, MetadataSchema } from "./metadata.schema";

const ExternalIdSchema = z.string().trim().min(1).max(255);
const NameSchema = z.string().trim().min(1).max(200);

/** `POST /v1/customers`. */
export const CreateCustomerSchema = z.strictObject({
  external_id: ExternalIdSchema,
  type: z.enum(["user", "org"]).default("user"),
  email: z.email().optional(),
  name: NameSchema.optional(),
  metadata: MetadataSchema,
});

/** `POST /v1/customers/:id`. Send null to clear email or name. */
export const UpdateCustomerSchema = z.strictObject({
  email: z.email().nullable().optional(),
  name: NameSchema.nullable().optional(),
  metadata: MetadataMap.optional(),
});

/**
 * `POST /v1/customer_sessions` for an existing customer, or by external id
 * (the customer is created on first use — one call from your login code).
 */
export const CreateCustomerSessionSchema = z
  .strictObject({
    customer: z
      .string()
      .regex(/^cus_[0-9A-Za-z]{24}$/, "Expected a customer id (cus_…)")
      .optional(),
    external_id: ExternalIdSchema.optional(),
    type: z.enum(["user", "org"]).default("user"),
    email: z.email().optional(),
    name: NameSchema.optional(),
  })
  .refine((v) => (v.customer === undefined) !== (v.external_id === undefined), {
    message: "Send exactly one of customer or external_id",
    path: ["customer"],
  });

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type CreateCustomerSessionInput = z.infer<typeof CreateCustomerSessionSchema>;
