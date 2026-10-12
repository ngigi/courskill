 'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const p = useSearchParams();

  const purpose = p.get('purpose');
  const courseId = p.get('courseId');
  const programmeId = p.get('programmeId');

  const [method, setMethod] = useState<'mpesa' | 'stripe'>('mpesa');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!['course_enrollment', 'certificate'].includes(purpose ?? '')) {
    return (
      <main className="section">
        <div className="container">
          <div className="card">
            <h1>Invalid checkout</h1>
            <p>Please select a course or certificate before continuing.</p>
            <Link className="btn" href="/programmes">
              Back to programmes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const label =
    purpose === 'certificate'
      ? 'Certificate issuance'
      : 'Course enrollment';

  async function start() {
    if (method === 'mpesa' && !phone.trim()) {
      setMessage('Please enter your M-Pesa phone number.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose,
          courseId,
          programmeId,
          paymentMethod: method,
          phone: method === 'mpesa' ? phone.trim() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? 'Unable to create payment. Please try again.');
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (method === 'mpesa') {
        setMessage(
          data.customerMessage ??
            'Check your phone for the M-Pesa payment prompt.'
        );

        const paymentId = data.payment?.id;

        if (paymentId) {
          for (let i = 0; i < 30; i++) {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const statusResponse = await fetch(
              `/api/payments/status?id=${encodeURIComponent(paymentId)}`
            );
            const statusData = await statusResponse.json();

            if (statusData?.payment?.status === 'paid') {
              setMessage(
                'M-Pesa payment confirmed. Your access has been activated.'
              );
              break;
            }

            if (statusData?.payment?.status === 'failed') {
              setMessage(
                'The M-Pesa payment was not completed. You can try again.'
              );
              break;
            }
          }
        } else {
          setMessage(
            data.customerMessage ??
              'Payment request received. Follow the instructions on your phone.'
          );
        }
      } else {
        setMessage(
          'The card checkout link was not returned. Please try again.'
        );
      }
    } catch {
      setMessage('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 620 }}>
        <div className="card">
          <div className="eyebrow" style={{ color: 'var(--brand)' }}>
            Courskills checkout
          </div>

          <h1>{label}</h1>

          <p className="muted">
            Kenyan learners can pay by M-Pesa. Card payments are available
            through Stripe.
          </p>

          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className={method === 'mpesa' ? 'btn' : 'btn secondary'}
              onClick={() => setMethod('mpesa')}
            >
              M-Pesa — KES 1,200
            </button>

            <button
              type="button"
              className={method === 'stripe' ? 'btn' : 'btn secondary'}
              onClick={() => setMethod('stripe')}
            >
              Card — $10 USD
            </button>
          </div>

          {method === 'mpesa' && (
            <div style={{ marginTop: 18 }}>
              <label className="muted" htmlFor="mpesa-phone">
                Kenyan M-Pesa phone number
              </label>

              <input
                id="mpesa-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0712345678"
                style={{
                  width: '100%',
                  padding: 12,
                  marginTop: 6,
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                }}
              />
            </div>
          )}

          <div className="stat" style={{ marginTop: 20 }}>
            {method === 'mpesa' ? 'KES 1,200' : '$10 USD'}
          </div>

          <p className="muted">
            This is the complete fee for this action.
          </p>

          <div className="notice">
            <strong>No other charges.</strong>
            <p>
              The selected payment method is the only charge: KES 1,200 via
              M-Pesa or $10 USD by card. No subscription or additional LMS fees.
            </p>
          </div>

          <button
            type="button"
            className="btn"
            style={{ marginTop: 18 }}
            disabled={loading}
            onClick={start}
          >
            {loading
              ? method === 'mpesa'
                ? 'Processing M-Pesa request…'
                : 'Opening Stripe…'
              : method === 'mpesa'
                ? 'Send M-Pesa prompt'
                : 'Continue to card payment'}
          </button>

          {message && (
            <p className="muted" role="status" style={{ marginTop: 16 }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Checkout() {
  return (
    <Suspense
      fallback={
        <main className="section">
          <div className="container">
            <p>Loading checkout...</p>
          </div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}