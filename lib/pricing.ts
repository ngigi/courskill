export type PaymentMethod = 'stripe' | 'mpesa';
export type PaymentPurpose = 'course_enrollment' | 'certificate';

export const COURSKILLS_PRICING = {
  stripe: {
    course_enrollment: { amountMinor: 1000, currency: 'USD', display: '$10 USD' },
    certificate: { amountMinor: 1000, currency: 'USD', display: '$10 USD' },
  },
  mpesa: {
    course_enrollment: { amountMinor: 1200, currency: 'KES', display: 'KES 1,200' },
    certificate: { amountMinor: 1200, currency: 'KES', display: 'KES 1,200' },
  },
} as const;

export function getPricing(method: PaymentMethod, purpose: PaymentPurpose) {
  return COURSKILLS_PRICING[method][purpose];
}
