import { z } from "zod";

export const receivedEventSchema = z.object({
  type: z.literal("email.received"),
  data: z.object({
    email_id: z.string().min(1),
    created_at: z.string().min(1),
    from: z.string().min(1),
    to: z.array(z.string().min(1)).min(1),
    cc: z.array(z.string()).nullish(),
    bcc: z.array(z.string()).nullish(),
    message_id: z.string().nullish(),
    subject: z.string().nullish(),
  }),
});

export const receivedEmailSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.array(z.string()).min(1),
  cc: z.array(z.string()).nullish(),
  subject: z.string().nullish(),
  message_id: z.string().nullish(),
  text: z.string().nullish(),
  html: z.string().nullish(),
  headers: z.record(z.string(), z.string()).nullish(),
});

export type ReceivedEvent = z.infer<typeof receivedEventSchema>;
export type ReceivedEmail = z.infer<typeof receivedEmailSchema>;
