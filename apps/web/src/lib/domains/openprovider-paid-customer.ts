import "server-only";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";
import { openproviderFetch } from "@/lib/domains/openprovider-client";

const customerDetailsSchema = z.object({
  email: z.email(),
  name: z.string().min(2),
  phone: z.string().min(5),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().nullable().optional(),
    city: z.string().min(1),
    state: z.string().nullable().optional(),
    postal_code: z.string().min(1),
    country: z.string().length(2),
  }),
});
const listSchema = z.object({
  data: z.object({
    results: z.array(z.object({ handle: z.string() })).default([]),
  }),
});
const createSchema = z.object({
  data: z.object({ handle: z.string().min(1) }),
});
export type PaidCustomerDetails = z.infer<typeof customerDetailsSchema>;

export async function getPaidCustomerHandle(input: unknown): Promise<string> {
  const customer = customerDetailsSchema.parse(input);
  const query = new URLSearchParams({
    email_pattern: customer.email,
    limit: "1",
  });
  const existingResponse = await openproviderFetch(
    `/v1beta/customers?${query}`,
  );
  const existing = listSchema.parse(await existingResponse.json()).data
    .results[0];
  if (existing) return existing.handle;
  return createCustomer(customer);
}

async function createCustomer(customer: PaidCustomerDetails): Promise<string> {
  const names = customer.name.trim().split(/\s+/);
  const firstName = names[0] || "Domain";
  const lastName = names.slice(1).join(" ") || "Owner";
  const phone = parsePhoneNumberFromString(customer.phone);
  if (!phone) throw new Error("A valid checkout phone number is required");
  const response = await openproviderFetch("/v1beta/customers", {
    method: "POST",
    body: JSON.stringify({
      name: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        initials: `${firstName[0]}${lastName[0]}`,
      },
      address: {
        street: customer.address.line1,
        number: "1",
        suffix: customer.address.line2 ?? "",
        zipcode: customer.address.postal_code,
        city: customer.address.city,
        state: customer.address.state ?? "",
        country: customer.address.country,
      },
      phone: {
        country_code: `+${phone.countryCallingCode}`,
        area_code: phone.nationalNumber.slice(0, 3),
        subscriber_number: phone.nationalNumber.slice(3),
      },
      email: customer.email,
      locale: "en_US",
    }),
  });
  return createSchema.parse(await response.json()).data.handle;
}
