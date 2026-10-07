import type { EmailMessage } from "./email.types";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);

/** The "reset your password" email. The link expires in an hour. */
export function resetPasswordEmail(to: string, name: string, url: string): EmailMessage {
  const first = name.trim().split(" ")[0] ?? "";
  const greeting = first ? `Hi ${first},` : "Hi,";
  const line =
    "Someone asked to reset the password for your VRS Pay account. If it was you, use the link below — it works for one hour.";
  const ignore =
    "If you didn't ask for this, you can ignore this email; your password won't change.";
  return {
    to,
    subject: "Reset your VRS Pay password",
    text: `${greeting}\n\n${line}\n\n${url}\n\n${ignore}`,
    html: `<div style="font-family:Geist,system-ui,sans-serif;color:#0b0b12;max-width:480px">
<p>${escapeHtml(greeting)}</p><p>${line}</p>
<p><a href="${escapeHtml(url)}" style="display:inline-block;background:#0b0b12;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Reset password</a></p>
<p style="color:#676776;font-size:13px">${ignore}</p></div>`,
  };
}
