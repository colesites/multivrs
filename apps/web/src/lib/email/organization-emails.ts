import { EMAIL_FROM, resend } from "@/lib/email/client";

export async function sendOrganizationInvitation(input: {
  email: string;
  invitationId: string;
  inviterName: string;
  organizationName: string;
  role: string;
}): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = new URL("/accept-invitation", baseUrl);
  url.searchParams.set("id", input.invitationId);
  const organization = escapeHtml(input.organizationName);
  const inviter = escapeHtml(input.inviterName);
  const role = escapeHtml(input.role);
  const { error } = await resend.emails.send(
    {
      from: EMAIL_FROM,
      to: [input.email],
      subject: `Join ${input.organizationName} on Multivrs`,
      html: `<div style="font-family:Arial,sans-serif;background:#050505;color:#fff;padding:32px"><div style="max-width:520px;margin:auto"><h1 style="font-size:22px">Join ${organization}</h1><p style="color:#a3a3a3;line-height:1.6">${inviter} invited you to join as ${role}.</p><a href="${url.toString()}" style="display:inline-block;background:#A855F7;color:#fff;font-weight:bold;text-decoration:none;padding:12px 18px;border-radius:8px">Accept invitation</a></div></div>`,
      text: `${input.inviterName} invited you to join ${input.organizationName} as ${input.role}.\n\n${url.toString()}`,
    },
    { idempotencyKey: `organization-invite/${input.invitationId}` },
  );
  if (error) throw new Error(error.message);
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
