import { describe, expect, test } from "bun:test";
import { mailComposePayload } from "../../apps/web/src/features/mail/mail-compose.client";
import { isMailView } from "../../apps/web/src/features/mail/mail-navigation";
import { resourcePayload } from "../../apps/web/src/features/mail/mail-resource-form";
import { inboundRecipients } from "../../apps/web/src/lib/mail/inbound-recipients";
import {
  absoluteMailDnsName,
  isAuthenticatedSendingDomain,
  isMailDomainInZone,
  normalizeMailDnsValue,
  relativeMailDnsName,
} from "../../apps/web/src/lib/mail/mail-domain-dns";
import { sanitizeMailHtml } from "../../apps/web/src/lib/mail/sanitize-html";
import {
  dnsRecordStatus,
  mapSesStatus,
  sesDomainSnapshot,
} from "../../apps/web/src/lib/mail/ses-domain-snapshot";
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
        provider: "ses",
        providerDomainId: "domain_123",
        status: "verified",
      }),
    ).toBe(true);
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

  test("reads DKIM and MAIL FROM statuses from SES separately", () => {
    const snapshot = sesDomainSnapshot("example.com", "us-east-1", {
      DkimAttributes: { Status: "FAILED", Tokens: ["abc", "def", "ghi"] },
      MailFromAttributes: { MailFromDomainStatus: "SUCCESS" },
    });
    expect(snapshot).toMatchObject({
      status: "failed",
      dkimStatus: "failed",
      mailFromStatus: "verified",
    });
    const byPurpose = Object.fromEntries(snapshot.records.map((r) => [r.purpose, r]));
    expect(byPurpose["dkim-1"]).toMatchObject({
      name: "abc._domainkey.example.com",
      value: "abc.dkim.amazonses.com",
      status: "failed",
    });
    expect(byPurpose.mx).toMatchObject({
      name: "bounces.example.com",
      value: "feedback-smtp.us-east-1.amazonses.com",
      status: "verified",
    });
    expect(byPurpose.inbound).toMatchObject({
      name: "example.com",
      type: "MX",
      priority: 10,
      value: "inbound-smtp.us-east-1.amazonaws.com",
    });
    // SES retries after a temporary failure, so it isn't shown as failed.
    expect(mapSesStatus("TEMPORARY_FAILURE")).toBe("pending");
    expect(mapSesStatus(undefined)).toBe("pending");
  });

  test("a record in public DNS shows as found until SES confirms it", () => {
    expect(dnsRecordStatus({ purpose: "dkim-1", status: "failed" }, true)).toBe("found");
    expect(dnsRecordStatus({ purpose: "dkim-1", status: "pending" }, false)).toBe("missing");
    expect(dnsRecordStatus({ purpose: "mx", status: "verified" }, false)).toBe("verified");
    expect(dnsRecordStatus({ purpose: "spf", status: "pending" }, true)).toBe("verified");
    expect(dnsRecordStatus({ purpose: "dmarc", status: "pending" }, false)).toBe("missing");
    expect(dnsRecordStatus({ purpose: "inbound", status: "pending" }, true)).toBe("verified");
  });

  test("links in received mail open in a new tab, never inside Multivrs", () => {
    const html = sanitizeMailHtml('<a href="https://example.com">Open</a>') ?? "";
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  test("routes received mail by the envelope, so CC and BCC reach their mailboxes", () => {
    const headers = ["someone@gmail.com", "Team <Team@Acme.com>"];
    // CC: the To line names someone else first.
    expect(
      inboundRecipients(
        { receipt: { recipients: ["Team@acme.com"] }, mail: { destination: headers } },
        headers,
      ),
    ).toEqual(["team@acme.com"]);
    // BCC: the address is on the envelope only.
    expect(
      inboundRecipients(
        { receipt: { recipients: ["hidden@acme.com"] }, mail: { destination: ["someone@gmail.com"] } },
        ["someone@gmail.com"],
      ),
    ).toEqual(["hidden@acme.com"]);
    // Two mailboxes, listed once each.
    expect(
      inboundRecipients(
        { receipt: { recipients: ["a@acme.com", "b@acme.com", "A@acme.com"] }, mail: {} },
        [],
      ),
    ).toEqual(["a@acme.com", "b@acme.com"]);
    // No envelope at all: fall back to the headers.
    expect(inboundRecipients({ mail: {} }, headers)).toEqual(["someone@gmail.com", "team@acme.com"]);
  });
});
