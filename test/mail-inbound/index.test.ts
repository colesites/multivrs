import { describe, expect, test } from "bun:test";
import { inboundPayload } from "../../apps/mail-inbound/src/normalize";
import { receivedEmailUrl } from "../../apps/mail-inbound/src/resend";
import { receivedEmailSchema, receivedEventSchema } from "../../apps/mail-inbound/src/schemas";

describe("inbound mail adapter", () => {
  test("uses Resend's received-email endpoint", () => {
    expect(receivedEmailUrl("email/one")).toBe(
      "https://api.resend.com/emails/receiving/email%2Fone",
    );
  });

  test("maps the retrieved text and HTML bodies into the control-plane payload", () => {
    const event = receivedEventSchema.parse({
      type: "email.received",
      data: {
        email_id: "email_1",
        created_at: "2026-07-28T00:00:00Z",
        from: "sender@example.com",
        to: ["hello@multivrs.space"],
        subject: "Hello",
      },
    });
    const email = receivedEmailSchema.parse({
      id: "email_1",
      from: "sender@example.com",
      to: ["hello@multivrs.space"],
      subject: "Hello",
      text: "Readable plain text",
      html: "<p>Readable HTML</p>",
      headers: { from: "Ada Lovelace <sender@example.com>" },
    });
    const result = inboundPayload(event, email);
    expect(result.text).toBe("Readable plain text");
    expect(result.html).toBe("<p>Readable HTML</p>");
    expect(result.fromName).toBe("Ada Lovelace");
  });
});
