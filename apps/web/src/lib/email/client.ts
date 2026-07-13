/**
 * Resend client + shared sender configuration.
 *
 * Per RESEND.md: API key comes from the `RESEND_API_KEY` env var (never
 * hardcoded), and the `from` address must use a verified domain in production.
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error("RESEND_API_KEY environment variable is required");
}

export const resend = new Resend(apiKey);

/**
 * Friendly-name `from` address, e.g. "Multivrs <noreply@c-technology-inc.com>".
 * Must be on a domain verified at https://resend.com/domains.
 */
export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Multivrs <noreply@c-technology-inc.com>";
