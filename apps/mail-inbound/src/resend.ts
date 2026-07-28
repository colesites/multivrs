import { type ReceivedEmail, receivedEmailSchema } from "./schemas";

const delays = [0, 400, 1_200];

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function receivedEmailUrl(emailId: string) {
  return `https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`;
}

export async function retrieveReceivedEmail(
  apiKey: string,
  emailId: string,
): Promise<ReceivedEmail> {
  let lastStatus = 0;
  for (const delay of delays) {
    if (delay) await wait(delay);
    const response = await fetch(receivedEmailUrl(emailId), {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    lastStatus = response.status;
    if (response.ok) return receivedEmailSchema.parse(await response.json());
    if (response.status !== 404 && response.status !== 429 && response.status < 500) {
      break;
    }
  }
  throw new Error(`Resend receiving API returned ${lastStatus || "no response"}`);
}
