import "server-only";
import { MultivrsError } from "@multivrs/error-utils";
import { z } from "zod";

const validationRecordSchema = z.object({
  txt_name: z.string(),
  txt_value: z.string(),
});
const hostnameSchema = z.object({
  id: z.string(),
  hostname: z.string(),
  status: z.string().optional().default("pending"),
  ownership_verification: validationRecordSchema.optional(),
  ssl: z
    .object({
      status: z.string().optional().default("pending"),
      validation_records: z
        .array(validationRecordSchema)
        .optional()
        .default([]),
    })
    .optional(),
});
const responseSchema = z.object({
  result: hostnameSchema,
  success: z.boolean(),
});
const listSchema = z.object({
  result: z.array(hostnameSchema),
  success: z.boolean(),
});

export interface EdgeHostnameState {
  configured: boolean;
  id?: string;
  status: "active" | "error" | "pending";
  verificationName?: string;
  verificationValue?: string;
}

function providerConfig() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId =
    process.env.CLOUDFLARE_SAAS_ZONE_ID ?? process.env.CLOUDFLARE_ZONE_ID;
  if (!token || !zoneId) return null;
  return {
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    zoneId,
  };
}

export async function provisionEdgeHostname(
  hostname: string,
  id?: string | null,
): Promise<EdgeHostnameState> {
  const config = providerConfig();
  if (!config) return { configured: false, status: "pending" };
  let record = id
    ? await getHostname(config, id)
    : await findHostname(config, hostname);
  if (!record) {
    const response = await fetch(endpoint(config.zoneId), {
      body: JSON.stringify({ hostname, ssl: { method: "txt", type: "dv" } }),
      headers: config.headers,
      method: "POST",
    });
    if (!response.ok)
      throw cloudflareError(
        `Custom hostname creation failed (${response.status})`,
      );
    record = responseSchema.parse(await response.json()).result;
  }
  return toState(record);
}

export async function deleteEdgeHostname(id: string): Promise<void> {
  const config = providerConfig();
  if (!config) return;
  const response = await fetch(`${endpoint(config.zoneId)}/${id}`, {
    headers: config.headers,
    method: "DELETE",
  });
  if (!response.ok && response.status !== 404)
    throw cloudflareError(
      `Custom hostname deletion failed (${response.status})`,
    );
}

async function getHostname(
  config: NonNullable<ReturnType<typeof providerConfig>>,
  id: string,
) {
  const response = await fetch(`${endpoint(config.zoneId)}/${id}`, {
    headers: config.headers,
  });
  if (response.status === 404) return undefined;
  if (!response.ok)
    throw cloudflareError(`Custom hostname lookup failed (${response.status})`);
  return responseSchema.parse(await response.json()).result;
}

async function findHostname(
  config: NonNullable<ReturnType<typeof providerConfig>>,
  hostname: string,
) {
  const response = await fetch(
    `${endpoint(config.zoneId)}?hostname=${encodeURIComponent(hostname)}`,
    { headers: config.headers },
  );
  if (!response.ok)
    throw cloudflareError(`Custom hostname lookup failed (${response.status})`);
  return listSchema.parse(await response.json()).result[0];
}

function endpoint(zoneId: string) {
  return `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`;
}

function toState(record: z.infer<typeof hostnameSchema>): EdgeHostnameState {
  const validation =
    record.ssl?.validation_records[0] ?? record.ownership_verification;
  const rawStatus = record.ssl?.status ?? record.status;
  return {
    configured: true,
    id: record.id,
    status:
      rawStatus === "active"
        ? "active"
        : rawStatus === "failed"
          ? "error"
          : "pending",
    verificationName: validation?.txt_name,
    verificationValue: validation?.txt_value,
  };
}

function cloudflareError(message: string) {
  return new MultivrsError("internal_error", message, 502);
}
