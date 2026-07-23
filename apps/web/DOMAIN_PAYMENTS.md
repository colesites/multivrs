# Domain checkout configuration

## Local domain sandbox

The local simulator exercises search, registration, DNS records, and ownership
verification without Stripe or Openprovider:

```dotenv
OPENPROVIDER_API_URL="http://api.sandbox.openprovider.nl:8480"
OPENPROVIDER_SANDBOX_DRIVER="local"
```

Restart `bun run dev` after changing environment variables. Sandbox state is
stored in `apps/web/.sandbox/openprovider.json` and is ignored by Git.

## Stripe test mode

Remove `OPENPROVIDER_SANDBOX_DRIVER` and configure:

```dotenv
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_DOMAIN_WEBHOOK_SECRET="whsec_..."
STRIPE_SUBSCRIPTION_WEBHOOK_SECRET="whsec_..."
OPENPROVIDER_API_URL="https://api.openprovider.eu"
OPENPROVIDER_USERNAME="..."
OPENPROVIDER_PASSWORD="..."
```

Hosted Stripe Checkout does not require a publishable key in the browser.

For local webhooks, run one Stripe CLI listener for each endpoint:

```bash
stripe listen \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired \
  --forward-to localhost:3000/api/stripe/webhooks/domains
```

```bash
stripe listen \
  --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,customer.subscription.paused,customer.subscription.resumed,customer.subscription.trial_will_end,invoice.paid,invoice.payment_failed,invoice.payment_action_required,invoice.finalization_failed \
  --forward-to localhost:3000/api/stripe/webhooks/subscriptions
```

Each listener prints a different `whsec_...` value. Copy the first into
`STRIPE_DOMAIN_WEBHOOK_SECRET` and the second into
`STRIPE_SUBSCRIPTION_WEBHOOK_SECRET`, then restart the development server.
Stripe CLI forwarding does not require webhook endpoints to be registered in
the Stripe test dashboard.

Use Stripe test card `4242 4242 4242 4242`, any future expiry date, and any
three-digit CVC.

## Production

Use live Stripe and Openprovider credentials, keep
`OPENPROVIDER_SANDBOX_DRIVER` unset, and register these live webhook endpoints:

```text
https://multivrs.space/api/stripe/webhooks/domains
https://multivrs.space/api/stripe/webhooks/subscriptions
```

Domain registration is fulfilled only after Stripe confirms the paid amount.
Stripe creates a different signing secret for every endpoint and mode. Put the
live domain and subscription endpoint secrets in the matching Production
environment variables. Use Stripe CLI secrets locally; register equivalent
test-mode endpoints only when testing a publicly reachable Preview deployment
without the CLI.
