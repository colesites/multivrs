# Multivrs Mail architecture

## Product boundary

Multivrs Mail is a tenant-scoped two-way mailbox and sending platform. It does
not reuse the old forwarding-only `EmailRoute` records. Mail domains, mailboxes,
threads, messages, contacts, audiences, templates, broadcasts, automations,
credentials, webhooks, suppressions, DNS state, and immutable events have their
own relational models in Neon.

Every dashboard query starts with the authenticated Better Auth user ID and,
when applicable, the selected project ID. API routes call a service ownership
check before mutating project-scoped resources. Provider and worker endpoints
are not session-authenticated; they require an HMAC signature, timestamp, and a
five-minute replay window.

## Message flow

### Outbound

1. The dashboard validates a compose request with Zod and creates a `queued` or
   `scheduled` message plus an `email.queued` event.
2. Immediate mail is dispatched after the response. Scheduled messages and
   campaigns are claimed by the minute cron.
3. The Cloudflare Queue retries transient failures and has a dead-letter queue.
4. The provider adapter sends the message. Success records `sent`, never
   `delivered`.
5. Signed provider events update delivery, engagement, bounce, complaint, and
   deferral state idempotently.

### Inbound

1. The receiving gateway stores raw MIME and attachments in private object
   storage, normalizes addresses and headers, and signs the normalized payload.
2. `/api/mail/inbound` validates the signature and Zod payload.
3. Threading prefers `In-Reply-To` and references. Subject fallback is allowed
   only when the same mailbox and correspondent match.
4. HTML is sanitized and remote images remain blocked until explicitly loaded.

## DNS and domain truth

Creating a sending domain provisions the domain in Resend and stores the exact
SPF, DKIM, DMARC, MX, tracking, and return-path records returned by the
provider. If the domain is DNS-managed by Multivrs, those records are installed
automatically. For external DNS, the dashboard displays the same records for
the customer to add at their existing provider.

Resend verification starts automatically. `domain.updated` events sent to
`/api/mail/resend-events` refresh provider truth in Neon, and the minute mail
worker reconciles pending and legacy domains as a fallback. The UI cannot mark
a domain verified by itself, and outbound mail remains blocked until Resend
reports the domain as verified. The webhook's signing secret is configured as
`RESEND_DOMAIN_WEBHOOK_SECRET` in the web application; it is separate from the
inbound worker's `RESEND_WEBHOOK_SECRET`.

## Secrets and credentials

API keys, SMTP passwords, and webhook signing secrets are generated with secure
random bytes. Only SHA-256 hashes and short hints are stored. The clear secret
is returned once and the dashboard keeps the reveal dialog open until copied.
Test and live credentials are distinct records with explicit permissions.

## Provider boundaries

`OutboundMailProvider` currently has a Resend adapter. The domain, mailbox,
thread, audience, and event models are provider-neutral, so SES, Mailgun,
Postmark, or a Multivrs MTA can be added without changing product APIs. Inbound
and provider-specific webhooks should terminate in small adapters that emit the
signed normalized contracts used by the control plane.

## Product limits and provider economics

Multivrs plan limits are customer entitlements, not copies of Resend's account
tiers. Resend bills the Multivrs team for the combined number of outbound
recipients and inbound messages. Multivrs therefore meters the same email unit:
one outbound recipient or one received message. The public comparison recommends
100 monthly units for Hobby, 500 included units for Pro, and a $10 Mail add-on
with 5,000 units. Additional paid usage is priced at $2 per 1,000 units against
the conservative Resend overage floor of $0.90 per 1,000.

Mailbox and alias counts are Multivrs database limits; Resend does not sell
mailboxes. Provider constraints still apply globally: 50 total recipients per
message, the team's rate-limit pool, domain reputation, bounce/spam thresholds,
and the selected Resend account tier. Paid volume must not be enabled until
tenant metering and spend controls are active.

## SMTP submission

`apps/mail-smtp` is the TLS submission gateway on port 587. A customer uses the
one-time username/password shown by the dashboard. The gateway authenticates
the hashed, tenant-scoped credential through the control plane, parses the MIME
message, then enters the same durable queue and provider pipeline as the REST
API. It never stores the clear password and it rejects senders outside the key's
project scope.

## Completion and go-live checklist

- ✅ Relational models, tenant ownership checks, services, APIs, validation, and UI.
- ✅ Resend sending/domain adapters and signed provider event normalization.
- ✅ Durable outbound queue, scheduler, retries, DLQ, and idempotent event updates.
- ✅ Inbound message/thread normalization and attachment metadata pipeline.
- ✅ TLS SMTP submission gateway and tenant-scoped credential authentication.
- ✅ Managed/external DNS record workflow and automatic domain reconciliation.
- ⏳ Deploy Workers, queues, and the TLS SMTP gateway.
- ⏳ Provision receiving MX routing and private raw-MIME/attachment storage.
- ⏳ Register `email.received` and `domain.updated` Resend webhook events.
- ⏳ Enable production Resend tier, overages, metering alerts, and spend controls.

The source implementation is complete; the remaining items mutate external
infrastructure. The application deliberately fails closed when production
worker or provider credentials are absent and never generates fake delivery
activity.
