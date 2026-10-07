import { CurrencyCodeSchema } from "@vrs-pay/core";
import { z } from "zod";

const MIN_AGE = 18;
const text = (max: number) => z.string().trim().min(1).max(max);

function isAdult(date: string): boolean {
  const born = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(born.getTime())) return false;
  const adult = new Date(born);
  adult.setUTCFullYear(born.getUTCFullYear() + MIN_AGE);
  return adult <= new Date();
}

const optionalText = (max: number) => z.string().trim().max(max).optional();

const AddressSchema = z.strictObject({
  line1: text(200),
  line2: optionalText(200),
  city: text(100),
  postal_code: optionalText(20),
});
const PhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a phone number with its country code");

/** Registered companies and individuals (sole traders, freelancers) are asked different things. */
const BusinessSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("company"),
    /** Legal name, as registered. */
    name: text(200),
    /** CAC RC/BN, Companies House number, EIN… */
    registration_number: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9][A-Za-z0-9 /-]{2,29}$/, "Check the registration number"),
    address: AddressSchema,
    phone: PhoneSchema,
  }),
  z.strictObject({
    type: z.literal("individual"),
    /** Trading name, if they use one. */
    name: text(200).optional(),
    address: AddressSchema,
    phone: PhoneSchema,
  }),
]);

/** `POST /dashboard/setup` — any of the simple steps, saved as you go. */
export const SetupUpdateSchema = z.strictObject({
  business: BusinessSchema.optional(),
  product_description: text(500).optional(),
  website: z.url({ protocol: /^https?$/ }).optional(),
  support_email: z.email().optional(),
  payout: z
    .strictObject({
      currency: CurrencyCodeSchema,
      account_name: text(200),
      bank_name: text(200),
      /** Account number or IBAN. */
      account_number: z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9 ]{4,34}$/, "Check the account number"),
      /** Sort code, routing number, bank code or SWIFT/BIC, as the bank uses. */
      bank_code: z.string().trim().max(20).optional(),
    })
    .optional(),
});

/** `POST /dashboard/setup/identity` — business location plus one official ID. */
export const IdentitySchema = z.strictObject({
  country: z.string().regex(/^[A-Z]{2}$/, "Choose your business location"),
  id_type: text(40),
  id_number: text(40),
  first_name: text(100),
  last_name: text(100),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine(isAdult, `You must be at least ${MIN_AGE}`),
});

export type SetupUpdate = z.infer<typeof SetupUpdateSchema>;
export type BusinessInput = z.infer<typeof BusinessSchema>;
export type IdentityInput = z.infer<typeof IdentitySchema>;
