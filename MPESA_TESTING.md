# Courskills M-Pesa STK Push testing

Courskills uses Safaricom Daraja M-Pesa Express (STK Push) for Kenyan payments.

## Fixed pricing

- Course enrollment: **KES 1,200** via M-Pesa.
- Certificate issuance: **KES 1,200** via M-Pesa.
- Card/Stripe option: **$10 USD**.
- No other Courskills charges.

The database validates the payment purpose, payment method, amount and currency so a client cannot submit a different price.

## Daraja setup

1. Create/log in to the Safaricom Daraja developer portal: https://developer.safaricom.co.ke/
2. Create a sandbox app and obtain the Consumer Key and Consumer Secret.
3. Use the sandbox test credentials/short code and STK passkey supplied by Daraja.
4. Deploy Courskills to Vercel so the callback URL is publicly reachable over HTTPS.
5. Set `MPESA_CALLBACK_URL` to `https://YOUR-DOMAIN/api/payments/mpesa/callback`.
6. Put all Daraja secrets in Vercel Environment Variables, never GitHub.

Safaricom documents Daraja authorization as OAuth 2.0 with tokens that expire after about one hour. M-Pesa APIs are asynchronous and send transaction results to the callback URL. See the official portal for current sandbox and go-live requirements.

## Flow

1. Learner selects **M-Pesa — KES 1,200**.
2. Learner enters a Kenyan mobile number.
3. Courskills creates a pending payment with KES 1,200.
4. Server obtains a Daraja access token and sends an STK Push.
5. Learner confirms the prompt with their M-Pesa PIN.
6. Safaricom calls `/api/payments/mpesa/callback`.
7. Courskills matches `CheckoutRequestID`, validates KES 1,200, and marks the payment paid.
8. Course enrollment is activated automatically for a course payment.

A successful STK Push API response only means Safaricom accepted the request; the callback confirms the actual payment result.

## Production

Sandbox is for testing. Before taking real payments, obtain the appropriate live M-Pesa merchant/PayBill/Till setup and complete Daraja go-live. Safaricom's official documentation states that production onboarding requires a live short code/account and business portal setup.
