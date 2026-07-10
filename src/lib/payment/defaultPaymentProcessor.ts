/** Stripe-only — kept for backward compatibility with existing imports. */
export type PaymentProcessorId = 'stripe';

export function paymentProcessorFromEnv(): PaymentProcessorId {
  return 'stripe';
}

export function paymentProcessorFromPublicEnv(): PaymentProcessorId {
  return 'stripe';
}
