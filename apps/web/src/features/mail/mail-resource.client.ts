import { z } from "zod";
import {
  type CreateMailView,
  createMailLabel,
  resourceEndpoints,
  resourcePayload,
} from "@/features/mail/mail-resource-form";

const secretResponseSchema = z.object({
  secret: z.string().min(1),
  connection: z
    .object({
      host: z.string().min(1),
      port: z.number().int(),
      tls: z.boolean(),
      username: z.string().min(1),
    })
    .optional(),
});

const resourceResponseSchema = z.object({
  id: z.string().min(1),
  automaticDnsConfigured: z.boolean().optional(),
  dnsMode: z.enum(["automatic", "manual"]).optional(),
  setupError: z.string().optional(),
});

const errorResponseSchema = z.object({
  error: z.object({ message: z.string().min(1) }),
});

export async function submitMailResource(
  view: CreateMailView,
  form: FormData,
  projectId?: string,
) {
  try {
    const response = await fetch(`/api/mail/${resourceEndpoints[view]}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(resourcePayload(view, form, projectId)),
    });
    if (!response.ok) {
      const result: unknown = await response.json();
      const error = errorResponseSchema.safeParse(result);
      return {
        ok: false as const,
        message: error.success
          ? error.data.error.message
          : `${createMailLabel(view)} could not be created`,
      };
    }
    const result: unknown = await response.json();
    const secret = secretResponseSchema.safeParse(result);
    const resource = resourceResponseSchema.safeParse(result);
    return {
      ok: true as const,
      automaticDnsConfigured: resource.success
        ? resource.data.automaticDnsConfigured
        : undefined,
      connection: secret.success ? secret.data.connection : undefined,
      dnsMode: resource.success ? resource.data.dnsMode : undefined,
      id: resource.success ? resource.data.id : undefined,
      secret: secret.success ? secret.data.secret : undefined,
      setupError: resource.success ? resource.data.setupError : undefined,
    };
  } catch {
    return { ok: false as const, message: "Unable to reach the mail service" };
  }
}
