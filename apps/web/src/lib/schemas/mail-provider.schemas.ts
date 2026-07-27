import { z } from "zod";

export const smtpAuthSchema = z.object({ username: z.string().min(1).max(200) });

export const mailProviderEventSchema = z.object({
  providerEventId: z.string().min(1).max(500),
  providerMessageId: z.string().min(1).max(500),
  type: z.enum([
    "delivered",
    "opened",
    "clicked",
    "bounced",
    "complained",
    "deferred",
  ]),
  occurredAt: z.iso.datetime().optional(),
  payload: z.record(z.string(), z.json()).default({}),
});

export type MailProviderEventInput = z.infer<typeof mailProviderEventSchema>;
