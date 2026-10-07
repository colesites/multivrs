import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { EmailSender } from "./email.types";

type Env = Record<string, string | undefined>;

/** AWS SES, the same service Multivrs sends with. */
function sesSender(env: Env, from: string): EmailSender {
  const client = new SESv2Client({
    region: env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
  return {
    async send({ to, subject, text, html }) {
      await client.send(
        new SendEmailCommand({
          FromEmailAddress: from,
          Destination: { ToAddresses: [to] },
          Content: {
            Simple: {
              Subject: { Data: subject },
              Body: { Text: { Data: text }, Html: { Data: html } },
            },
          },
        }),
      );
    },
  };
}

/** Local dev without SES: the email (and its link) is printed in the API terminal. */
const terminalSender: EmailSender = {
  async send({ to, subject, text }) {
    // biome-ignore lint/suspicious/noConsole: dev-only stand-in for an email provider.
    console.info(`\n[email] to ${to}: ${subject}\n${text}\n`);
  },
};

/**
 * SES when AWS credentials and VRS_EMAIL_FROM are set; the terminal in
 * development; nothing in production without SES (password reset is off).
 */
export function createEmailSender(env: Env): EmailSender | null {
  const from = env.VRS_EMAIL_FROM;
  if (from && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) return sesSender(env, from);
  return env.NODE_ENV === "production" ? null : terminalSender;
}
