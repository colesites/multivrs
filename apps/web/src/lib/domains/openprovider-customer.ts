import "server-only";
import { z } from "zod";
import { openproviderFetch } from "@/lib/domains/openprovider-client";

const customerListSchema = z.object({
  data: z.object({
    results: z.array(z.object({ handle: z.string() })).default([]),
  }),
});
const customerCreateSchema = z.object({
  data: z.object({ handle: z.string().min(1) }),
});

interface SandboxCustomer {
  email: string;
  name: string;
}

export async function getSandboxCustomerHandle(
  customer: SandboxCustomer,
): Promise<string> {
  const configured = process.env.OPENPROVIDER_TEST_CUSTOMER_HANDLE?.trim();
  if (configured) return configured;
  const query = new URLSearchParams({
    email_pattern: customer.email,
    limit: "1",
  });
  const existingResponse = await openproviderFetch(
    `/v1beta/customers?${query}`,
  );
  const existing = customerListSchema.parse(await existingResponse.json()).data
    .results[0];
  if (existing) return existing.handle;
  return createSandboxCustomer(customer);
}

async function createSandboxCustomer(
  customer: SandboxCustomer,
): Promise<string> {
  const parts = customer.name.trim().split(/\s+/);
  const firstName = parts[0] || "Multivrs";
  const lastName = parts.slice(1).join(" ") || "Tester";
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
        street: "Sandbox Street",
        number: "1",
        zipcode: "1000 AA",
        city: "Amsterdam",
        state: "Noord-Holland",
        country: "NL",
      },
      phone: {
        country_code: "+31",
        area_code: "20",
        subscriber_number: "5550100",
      },
      email: customer.email,
      locale: "en_US",
      comments: "Multivrs local sandbox testing",
    }),
  });
  return customerCreateSchema.parse(await response.json()).data.handle;
}
