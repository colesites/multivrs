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

Creating a domain returns the required ownership, SPF, DKIM, DMARC, MX,
tracking, and return-path records. Verification performs actual DNS resolution;
the UI cannot mark a domain verified by itself. Production must provision the
targets under `MULTIVRS_MAIL_DNS_DOMAIN` and connect provider-issued DKIM keys.

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

## SMTP submission

`apps/mail-smtp` is the TLS submission gateway on port 587. A customer uses the
one-time username/password shown by the dashboard. The gateway authenticates
the hashed, tenant-scoped credential through the control plane, parses the MIME
message, then enters the same durable queue and provider pipeline as the REST
API. It never stores the clear password and it rejects senders outside the key's
project scope.

## Operations still requiring infrastructure

Deploy the Cloudflare worker, both queues, and the TLS SMTP gateway; provision
the receiving MX gateway and private MIME storage; configure provider webhooks;
and operate the DNS targets.
The application deliberately fails closed when production worker or provider
credentials are absent; it does not generate fake delivery activity.
