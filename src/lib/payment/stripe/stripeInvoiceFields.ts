import type Stripe from 'stripe';

/** Stripe Invoice typings omit some webhook/API fields; normalize subscription id. */
export function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | undefined {
  const p = invoice.parent;
  if (p?.type === 'subscription_details' && p.subscription_details) {
    const s = p.subscription_details.subscription;
    return typeof s === 'string' ? s : s?.id;
  }
  const extended = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
  if (typeof extended.subscription === 'string') return extended.subscription;
  if (extended.subscription && typeof extended.subscription === 'object' && 'id' in extended.subscription) {
    return extended.subscription.id;
  }
  return undefined;
}

export function paymentIntentIdFromInvoice(invoice: Stripe.Invoice): string | undefined {
  const extended = invoice as Stripe.Invoice & {
    payment_intent?: string | Stripe.PaymentIntent | null;
  };
  const pi = extended.payment_intent;
  if (typeof pi === 'string') return pi;
  if (pi && typeof pi === 'object' && 'id' in pi) return pi.id;
  return undefined;
}
