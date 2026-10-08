# Courskills pricing policy

| Item | Kenya / M-Pesa | Card / Stripe |
|---|---:|---:|
| Course enrollment | KES 1,200 | $10 USD |
| Certificate issuance | KES 1,200 | $10 USD |
| Everything else | $0 | $0 |

There are no subscriptions, registration fees, programme fees, assessment fees, simulator fees, journal fees, portfolio fees, convenience fees, or other Courskills platform charges.

## Enforcement

`db/schema.sql` creates pricing rules for each payment method and a database trigger that rejects payment records whose amount or currency does not match the configured fixed price.

Course access is created only after a verified paid course-enrollment payment. Certificate issuance requires a verified paid certificate payment plus completed programme status.

## Payment methods

- **M-Pesa:** Safaricom Daraja M-Pesa Express / STK Push, KES 1,200.
- **Stripe:** Stripe Checkout, $10 USD.

The application does not accept a client-supplied price.
