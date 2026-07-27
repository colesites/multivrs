/**
 * Transactional auth emails sent via Resend.
 *
 * These are invoked from Better Auth's `emailOTP` plugin handler
 * (`src/lib/auth/config.ts`). The SDK returns `{ data, error }` — we surface
 * errors so Better Auth can react, rather than swallowing them.
 */

import { logError } from "@/lib/services/logger.service";
import { EMAIL_FROM, resend } from "./client";

type OtpType =
  | "email-verification"
  | "sign-in"
  | "forget-password"
  | "change-email";

const COPY: Record<
  OtpType,
  { subject: string; heading: string; line: string }
> = {
  "email-verification": {
    subject: "Verify your email",
    heading: "Verify your email",
    line: "Use this code to verify your email and finish setting up your Multivrs account.",
  },
  "sign-in": {
    subject: "Your sign-in code",
    heading: "Sign in to Multivrs",
    line: "Use this code to sign in to your Multivrs account.",
  },
  "forget-password": {
    subject: "Reset your password",
    heading: "Reset your password",
    line: "Use this code to reset your Multivrs password.",
  },
  "change-email": {
    subject: "Confirm your new email",
    heading: "Confirm your new email",
    line: "Use this code to confirm your new email address for Multivrs.",
  },
};

function otpEmailHtml(heading: string, line: string, otp: string): string {
  return `
  <div style="background:#030303;padding:40px 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
    <div style="max-width:420px;margin:0 auto;padding:32px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:16px">
      <h1 style="margin:0 0 8px;font-size:20px;color:#fff;font-family:Arial,sans-serif">${heading}</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.55);font-family:Arial,sans-serif">${line}</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:10px;color:#fff;text-align:center;padding:16px;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.3);border-radius:12px">${otp}</div>
      <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.35);font-family:Arial,sans-serif">This code expires in 5 minutes. If you didn't request it, you can ignore this email.</p>
    </div>
  </div>`;
}

/**
 * Send a one-time passcode for the given auth flow.
 * Throws on Resend error so the caller (Better Auth) can fail the request.
 */
export async function sendOtpEmail({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: OtpType;
}): Promise<void> {
  const copy = COPY[type];

  const { error } = await resend.emails.send(
    {
      from: EMAIL_FROM,
      to: [email],
      subject: copy.subject,
      html: otpEmailHtml(copy.heading, copy.line, otp),
      text: `${copy.line}\n\nYour code: ${otp}\n\nThis code expires in 5 minutes.`,
    },
    // Idempotency: one send per email+type+code within the dedup window.
    { idempotencyKey: `${type}/${email}/${otp}` },
  );

  if (error) {
    logError("email.otp.send_failed", error, { type });
    throw new Error(error.message);
  }
}
