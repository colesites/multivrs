import { describe, expect, test } from "bun:test";
import { mailComposePayload } from "../../apps/web/src/features/mail/mail-compose.client";
import { isMailView } from "../../apps/web/src/features/mail/mail-navigation";
import { resourcePayload } from "../../apps/web/src/features/mail/mail-resource-form";
import {
  absoluteMailDnsName,
  isAuthenticatedSendingDomain,
  isMailDomainInZone,
  normalizeMailDnsValue,
  relativeMailDnsName,
} from "../../apps/web/src/lib/mail/mail-domain-dns";
import {
  composeMailSchema,
  inboundMailSchema,
} from "../../apps/web/src/lib/schemas/mail-message.schemas";
import {
  mailProviderEventSchema,
  resendDomainEventSchema,
} from "../../apps/web/src/lib/schemas/mail-provider.schemas";
import {
  createMailDomainSchema,
  createMailWebhookSchema,
} from "../../apps/web/src/lib/schemas/mail-resource.schemas";

describe("Multivrs Mail boundaries", () => {
  test("normalizes compose recipients and requires a body", () => {
    const parsed = composeMailSchema.parse({
      mailboxId: "cbd91bb6-0fb5-48eb-a047-9ec1e0b40483",
      to: ["Person@Example.COM"],
      subject: "Hello",
      text: "Message",
    });
    expect(parsed.to).toEqual(["person@example.com"]);
    expect(composeMailSchema.safeParse({ ...parsed, text: undefined }).success).toBe(false);
  });

  test("enforces Resend's 50-recipient limit across To, CC, and BCC", () => {
    const recipients = Array.from({ length: 51 }, (_, index) => `person-${index}@example.com`);
    expect(
      composeMailSchema.safeParse({
        mailboxId: "cbd91bb6-0fb5-48eb-a047-9ec1e0b40483",
        to: recipients.slice(0, 25),
        cc: recipients.slice(25),
        subject: "Too many recipients",
        text: "Message",
      }).success,
    ).toBe(false);
  });

  test("requires HTTPS webhook endpoints", () => {
    expect(
      createMailWebhookSchema.safeParse({ url: "http://example.com/hook", events: ["email.sent"] })
        .success,
    ).toBe(false);
    expect(
      createMailWebhookSchema.safeParse({ url: "https://example.com/hook", events: ["email.sent"] })
        .success,
    ).toBe(true);
  });

  test("validates normalized provider and inbound events", () => {
    expect(
      mailProviderEventSchema.parse({
        providerEventId: "evt_1",
        providerMessageId: "msg_1",
        type: "delivered",
      }).type,
    ).toBe("delivered");
    expect(
      inboundMailSchema.safeParse({
        providerEventId: "evt_1",
        mailbox: "support@example.com",
        messageId: "<one@example.com>",
        from: "person@example.com",
        to: ["support@example.com"],
      }).success,
    ).toBe(true);
    expect(
      resendDomainEventSchema.parse({
        type: "domain.updated",
        data: {
          id: "domain_123",
          name: "mail.example.com",
          status: "verified",
        },
      }).data.status,
    ).toBe("verified");
  });

  test("serializes scheduled compose form values to ISO", () => {
    const form = new FormData();
    form.set("mailboxId", "cbd91bb6-0fb5-48eb-a047-9ec1e0b40483");
    form.set("to", "one@example.com, two@example.com");
    form.set("subject", "Scheduled");
    form.set("text", "Message");
    form.set("scheduledAt", "2026-07-27T15:00");
    const payload = mailComposePayload(form);
    expect(payload.to).toHaveLength(2);
    expect(payload.scheduledAt).toContain("2026-07-27T");
  });

  test("accepts safe attachments and recognizes URL-backed mail views", () => {
    const parsed = composeMailSchema.parse({
      mailboxId: "cbd91bb6-0fb5-48eb-a047-9ec1e0b40483",
      to: ["person@example.com"],
      subject: "Files",
      html: "<p>Attached</p>",
      attachments: [
        {
          filename: "brief.pdf",
          contentType: "application/pdf",
          contentBase64: "cGRm",
          size: 3,
        },
      ],
    });
    expect(parsed.attachments[0]?.filename).toBe("brief.pdf");
    expect(isMailView("domains")).toBe(true);
    expect(isMailView("unknown")).toBe(false);
  });

  test("normalizes sending domains and rejects non-hostname input", () => {
    expect(
      createMailDomainSchema.parse({
        domain: "https://MAIL.Example.com/path",
        kind: "sending",
      }).domain,
    ).toBe("mail.example.com");
    expect(
      createMailDomainSchema.safeParse({
        domain: "not a domain",
        kind: "sending",
      }).success,
    ).toBe(false);

    const form = new FormData();
    form.set("domain", "example.com");
    expect(resourcePayload("domains", form)).toEqual({
      domain: "example.com",
      kind: "sending",
    });
  });

  test("maps delivery-provider DNS records into external and managed zones", () => {
    expect(absoluteMailDnsName("mail.example.com", "multivrs")).toBe("multivrs.mail.example.com");
    expect(relativeMailDnsName("example.com", "multivrs.mail.example.com")).toBe("multivrs.mail");
    expect(isMailDomainInZone("mail.example.com", "example.com")).toBe(true);
    expect(isMailDomainInZone("example.net", "example.com")).toBe(false);
    expect(normalizeMailDnsValue('"v=spf1 include:amazonses.com ~all"')).toBe(
      "v=spf1 include:amazonses.com ~all",
    );
    expect(() => relativeMailDnsName("example.com", "outside.test")).toThrow(
      "outside the managed DNS zone",
    );
    expect(
      isAuthenticatedSendingDomain({
        provider: "resend",
        providerDomainId: "domain_123",
        status: "verified",
      }),
    ).toBe(true);
    expect(
      isAuthenticatedSendingDomain({
        provider: null,
        providerDomainId: null,
        status: "verified",
      }),
    ).toBe(false);
  });
});
