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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_DOMAIN_WEBHOOK_SECRET="whsec_..."
STRIPE_SUBSCRIPTION_WEBHOOK_SECRET="whsec_..."
STRIPE_FREE_MONTHLY_LOOKUP_KEY="multivrs_free_monthly"
STRIPE_PRO_MONTHLY_LOOKUP_KEY="multivrs_pro_monthly"
OPENPROVIDER_API_URL="https://api.openprovider.eu"
OPENPROVIDER_USERNAME="..."
OPENPROVIDER_PASSWORD="..."
```

The domain checkout page embeds Stripe Checkout. Use the publishable key from
the same Stripe test or live account as `STRIPE_SECRET_KEY`.

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

## Subscription pricing

Create separate Hobby and Pro products with recurring monthly Prices in Stripe.
Do not put both Prices on one Product: Product names, descriptions, and
marketing features are shared by every Price attached to that Product.
Assign the lookup keys configured in `STRIPE_FREE_MONTHLY_LOOKUP_KEY` and
`STRIPE_PRO_MONTHLY_LOOKUP_KEY`. The pricing page loads both Products' names,
descriptions, marketing features, active amounts, currencies, and intervals
from Stripe. Enterprise is a sales-led plan without a Stripe Price.

In the Stripe product editor, open **More options**, then use **Marketing feature
list → Add line**. Put the plan summary in the Product **Description**, not the
Price description.

You can instead set `STRIPE_FREE_MONTHLY_PRICE_ID="price_..."` and
`STRIPE_PRO_MONTHLY_PRICE_ID="price_..."`. A Price ID takes priority over its
lookup key. Prefer lookup keys because Stripe Price amounts are immutable: when
pricing changes, create a replacement Price and transfer the lookup key without
deploying new code.

Test and live mode have separate Stripe objects. Create or copy the Product and
Price into live mode, keep the same lookup key, and use the matching test/live
secret key in each environment.

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
