import type { AddressObject, ParsedMail } from "mailparser";

function addresses(value: AddressObject | AddressObject[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.flatMap((item) => item.value.map(({ address }) => address).filter(Boolean));
}

export async function authorize(
  controlPlaneUrl: string,
  username: string,
  password: string,
) {
  const response = await fetch(`${controlPlaneUrl}/api/v1/mail/smtp/auth`, {
    method: "POST",
    headers: { authorization: `Bearer ${password}`, "content-type": "application/json" },
    body: JSON.stringify({ username }),
  });
  return response.ok;
}

export async function submitMail(
  controlPlaneUrl: string,
  password: string,
  mail: ParsedMail,
) {
  const from = addresses(mail.from)[0];
  const to = addresses(mail.to);
  if (!from || !to.length) throw new Error("A sender and recipient are required");
  const response = await fetch(`${controlPlaneUrl}/api/v1/mail/smtp/send`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${password}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      cc: addresses(mail.cc),
      bcc: addresses(mail.bcc),
      subject: mail.subject ?? "(no subject)",
      text: mail.text,
      html: typeof mail.html === "string" ? mail.html : undefined,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mail submission rejected (${response.status}): ${detail.slice(0, 300)}`);
  }
}
