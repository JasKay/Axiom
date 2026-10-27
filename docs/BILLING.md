# Church Workspace billing

Standalone remains free. Church Workspace is US$9.99/month per church, not per seat. An owner/admin in the leadership audience subscribes through hosted Stripe Checkout. Members never buy personal subscriptions. Pricing links to `/app?signup=1&billing=start`; registration preserves that intent and opens a focused subscription review dialog. Ongoing billing management is in Account settings. Returning from Checkout refreshes the saved server-side session against Stripe. No access is granted from URL parameters alone.

## Server configuration

Set `STRIPE_SECRET_KEY`, `STRIPE_CHURCH_PRICE_ID`, `STRIPE_PORTAL_CONFIGURATION_ID`, `STRIPE_WEBHOOK_SECRET` and `AXIOM_BILLING_ORIGIN` through Vercel. Never commit keys or share them in chat. Prefer a restricted key with the required Billing permissions. Integration-managed keys remain server-only. Set `AXIOM_BILLING_ENABLED=true` after configuring the account and signed webhook. The price must belong to `axiom_church_workspace` and be exactly USD 999 cents/month, quantity one.

Apply `db/009_billing.sql` additively before enabling billing. Test and live account records are separated. Development/preview use the dedicated sandbox; production uses Bracket's imported live account. `scripts/setup-stripe-sandbox.cjs` prepares only a sandbox. `scripts/setup-stripe-live.cjs --live` prepares the approved live catalog/portal/endpoint without making a charge. Its local output file is ignored. Do not publish that file or environment files.

`AXIOM_BILLING_ENFORCE=true` gates shared writes and uploads. `AXIOM_BILLING_ENFORCE_SINCE` is an ISO rollout timestamp: earlier churches retain existing access; new churches need a subscription. Keep that date fixed across deployments. Remove the cutoff only after arranging migration for existing churches. Saved reads, downloads, and local Standalone work remain available. A billing outage cannot silently grant shared write access to a gated church.

## Subscription lifecycle

The raw-body endpoint `/api/stripe-webhook` verifies Stripe signatures, enforces environment matching, deduplicates event IDs and maps Customer IDs to churches. Register the exact event list in `server/stripe.cjs`, including checkout, subscription, invoice, refunds, disputes and fraud warnings. Checkout is not complete until actual paid-invoice proof is recorded. Pending payment grants no access. Past-due grace is bounded to three days after the paid period. Full refunds/disputes/fraud warnings suspend paid access. Partial refunds are recorded without suspending it. Cancellation through the hosted portal takes effect at the end of the paid period.

Only an authenticated church owner/admin can open Checkout or the billing portal; amounts and Customer IDs come from the server. Repeated clicks reuse open sessions and existing subscriptions block duplicate purchases. Subscription details and payment history are in Account settings. No card data enters Axiom.

## Tax and verification

Automatic tax is not enabled. Confirm the seller's tax obligations, head-office details and active Stripe Tax registrations before enabling it; an activated Stripe account is not a tax registration. Do not promise that tax is collected until it is configured and tested.

Run `npm test`. The billing tests cover authorization, signatures, paid periods, fixed pricing and rollout boundaries. Real sandbox Checkout/webhook tests should cover initial payment, cancellation, partial/full refunds and payment failure without using real cards. On production verify pricing availability, registration intent, unsigned webhook rejection and hosted Checkout without completing a charge. Confirm Stripe delivery health after the first authorized real subscription.
