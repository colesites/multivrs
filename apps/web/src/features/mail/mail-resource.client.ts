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
    if (!response.ok)
      return {
        ok: false as const,
        message: `${createMailLabel(view)} could not be created`,
      };
    const result: unknown = await response.json();
    const parsed = secretResponseSchema.safeParse(result);
    return {
      ok: true as const,
      connection: parsed.success ? parsed.data.connection : undefined,
      secret: parsed.success ? parsed.data.secret : undefined,
    };
  } catch {
    return { ok: false as const, message: "Unable to reach the mail service" };
  }
}
