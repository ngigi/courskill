# Courskills Stripe staging test plan

Courskills has exactly two billable actions:
- $10 USD course enrollment
- $10 USD certificate issuance

Everything else is free.

## 1. Stripe test mode
Create/use a Stripe account and keep **Test mode** enabled.
Set in Vercel:
- `STRIPE_ENABLED=true`
- `PAYMENT_PROVIDER_SECRET=sk_test_...`
- `PAYMENT_WEBHOOK_SECRET=whsec_...`
- `NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>`

## 2. Stripe webhook
After the Vercel deployment is live, create a Stripe webhook endpoint:
`https://<your-vercel-domain>/api/payments/webhook`

Subscribe to:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `charge.refunded`

Copy the endpoint signing secret (`whsec_...`) into `PAYMENT_WEBHOOK_SECRET` in Vercel, then redeploy.

## 3. Test course enrollment
1. Create/sign into a Courskills learner account.
2. Open a course.
3. Choose enrollment.
4. Confirm the card checkout displays exactly `$10 USD`.
5. Complete Stripe Checkout using Stripe's official test card `4242 4242 4242 4242`, any future expiry, any CVC, and any ZIP/postcode.
6. Return to Courskills.
7. Confirm the Stripe webhook changes the payment to `paid` and creates `course_enrollments`.
8. Confirm the learner can access the course.

## 4. Test certificate
1. Complete a programme as a test learner (or use an admin/test database state that marks the programme completed).
2. Open Certificates.
3. Choose certificate issuance.
4. Confirm the price is exactly `$10 USD`.
5. Complete Stripe Checkout with the same test card.
6. Confirm the webhook is received.
7. Confirm a certificate is issued only after the verified paid certificate transaction.

## 5. Security checks
- Never put `PAYMENT_PROVIDER_SECRET` or `PAYMENT_WEBHOOK_SECRET` in client code.
- Never accept a price from the browser; the server derives the amount from the Courskills pricing policy.
- Stripe webhook signatures are verified before processing.
- Keep Stripe in Test mode until production payment approval is complete.
