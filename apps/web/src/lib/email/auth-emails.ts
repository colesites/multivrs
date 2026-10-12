/**
 * Transactional auth emails sent via AWS SES v2.
 *
 * Codes come from Better Auth's `emailOTP` plugin; confirmation links come from
 * its email verification, change-email, and delete-user flows
 * (`src/lib/auth/config.ts`).
 */

import { logError } from "@/lib/services/logger.service";
import { EMAIL_FROM, sendEmail } from "./client";

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
 * Throws on SES error so the caller (Better Auth) can fail the request.
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

  try {
    await sendEmail({
      from: EMAIL_FROM,
      to: [email],
      subject: copy.subject,
      html: otpEmailHtml(copy.heading, copy.line, otp),
      text: `${copy.line}\n\nYour code: ${otp}\n\nThis code expires in 5 minutes.`,
      headers: {
        "X-Multivrs-Auth-Type": type,
      },
    });
  } catch (error) {
    logError("email.otp.send_failed", error, { type });
    throw error instanceof Error ? error : new Error(String(error));
  }
}

type LinkEmailKind = "verify-email" | "approve-email-change" | "delete-account";

const LINK_COPY: Record<
  LinkEmailKind,
  {
    subject: string;
    heading: string;
    line: (newEmail?: string) => string;
    action: string;
    footer: string;
  }
> = {
  "verify-email": {
    subject: "Confirm your email address",
    heading: "Confirm your email",
    line: () => "Confirm this address to use it for your Multivrs account.",
    action: "Confirm email",
    footer:
      "This link expires in 1 hour. If you didn't ask for this, you can ignore this email.",
  },
  "approve-email-change": {
    subject: "Approve your email change",
    heading: "Approve your email change",
    line: (newEmail) =>
      `Someone asked to change your Multivrs account email to ${newEmail}. Approve it here, then confirm the new address from the email we send there.`,
    action: "Approve change",
    footer:
      "This link expires in 1 hour. If you didn't ask for this, ignore this email and change your password.",
  },
  "delete-account": {
    subject: "Confirm deleting your Multivrs account",
    heading: "Delete your account",
    line: () =>
      "Confirm to permanently delete your Multivrs account, your team, and everything in it. This can't be undone.",
    action: "Delete my account",
    footer:
      "This link expires in 24 hours. If you didn't ask for this, ignore this email and change your password.",
  },
};

function linkEmailHtml(
  heading: string,
  line: string,
  action: string,
  url: string,
  footer: string,
): string {
  return `
  <div style="background:#030303;padding:40px 0;font-family:Arial,sans-serif">
    <div style="max-width:420px;margin:0 auto;padding:32px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:16px">
      <h1 style="margin:0 0 8px;font-size:20px;color:#fff">${heading}</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.55)">${line}</p>
      <a href="${url}" style="display:inline-block;background:#A855F7;color:#fff;font-weight:bold;text-decoration:none;padding:12px 18px;border-radius:8px">${action}</a>
      <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.35)">${footer}</p>
    </div>
  </div>`;
}

/**
 * Send a confirmation link for an account change (Better Auth's email
 * verification, change-email, and delete-user flows).
 */
export async function sendAuthLinkEmail({
  email,
  kind,
  url,
  newEmail,
}: {
  email: string;
  kind: LinkEmailKind;
  url: string;
  newEmail?: string;
}): Promise<void> {
  const copy = LINK_COPY[kind];
  const line = copy.line(newEmail);
  try {
    await sendEmail({
      from: EMAIL_FROM,
      to: [email],
      subject: copy.subject,
      html: linkEmailHtml(
        copy.heading,
        escapeHtml(line),
        copy.action,
        escapeHtml(url),
        copy.footer,
      ),
      text: `${line}\n\n${copy.action}: ${url}\n\n${copy.footer}`,
      headers: { "X-Multivrs-Auth-Type": kind },
    });
  } catch (error) {
    logError("email.auth_link.send_failed", error, { kind });
    throw error instanceof Error ? error : new Error(String(error));
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    if (character === "&") return "&amp;";
    if (character === "<") return "&lt;";
    if (character === ">") return "&gt;";
    if (character === "'") return "&#39;";
    return "&quot;";
  });
}
