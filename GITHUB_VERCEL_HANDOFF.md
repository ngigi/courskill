# Courskills GitHub / Vercel staging handoff

## Payment configuration

Courskills now supports two fixed payment methods:

- Kenya / M-Pesa STK Push: **KES 1,200** per course enrollment and **KES 1,200** per certificate.
- Card / Stripe: **$10 USD** per course enrollment and **$10 USD** per certificate.
- No subscriptions, registration, assessment, simulator, journal, portfolio, convenience, or other Courskills charges.

## Vercel environment variables

Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Stripe test mode:
- `STRIPE_ENABLED=true`
- `PAYMENT_PROVIDER_SECRET=sk_test_...`
- `PAYMENT_WEBHOOK_SECRET=whsec_...`

M-Pesa sandbox:
- `MPESA_ENV=sandbox`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_TRANSACTION_TYPE=CustomerPayBillOnline`
- `MPESA_CALLBACK_URL=https://YOUR-DOMAIN/api/payments/mpesa/callback`

Never commit secrets to GitHub. Put them in Vercel Environment Variables.

## M-Pesa callback

The M-Pesa callback must be publicly reachable over HTTPS. Safaricom's Daraja documentation describes M-Pesa APIs as asynchronous and sends transaction results to the configured callback URL.

## Database

Run `db/schema.sql` against the Courskills Supabase project before testing payments. The database validates the payment method, currency and exact amount.
