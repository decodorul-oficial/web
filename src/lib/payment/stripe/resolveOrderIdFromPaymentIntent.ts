import type Stripe from 'stripe';
import { subscriptionIdFromInvoice } from '@/lib/payment/stripe/stripeInvoiceFields';

type PiWithInvoice = Stripe.PaymentIntent & { invoice?: Stripe.Invoice | string | null };

async function resolveOrderIdFromPaymentIntentObject(
  stripe: Stripe,
  pi: Stripe.PaymentIntent
): Promise<string | undefined> {
  const fromMeta = pi.metadata?.order_id;
  if (typeof fromMeta === 'string' && fromMeta.trim()) {
    return fromMeta.trim();
  }

  const invoiceField = (pi as PiWithInvoice).invoice;

  if (typeof invoiceField === 'object' && invoiceField !== null) {
    const subId = subscriptionIdFromInvoice(invoiceField);
    if (subId) {
      const sub = await stripe.subscriptions.retrieve(subId);
      return sub.metadata?.order_id ?? undefined;
    }
  }

  if (typeof invoiceField === 'string') {
    const inv = await stripe.invoices.retrieve(invoiceField, { expand: ['subscription'] });
    const subId = subscriptionIdFromInvoice(inv);
    if (subId) {
      const sub = await stripe.subscriptions.retrieve(subId);
      return sub.metadata?.order_id ?? undefined;
    }
  }

  return undefined;
}

/**
 * Maps a subscription invoice PaymentIntent to our GraphQL order id (subscription metadata).
 */
export async function resolveOrderIdFromPaymentIntent(
  stripe: Stripe,
  paymentIntentId: string
): Promise<string | undefined> {
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['invoice', 'invoice.subscription']
  });
  return resolveOrderIdFromPaymentIntentObject(stripe, pi);
}

/** Same as {@link resolveOrderIdFromPaymentIntent} but reuses an already-retrieved PaymentIntent (e.g. expanded invoice). */
export async function resolveOrderIdFromLoadedPaymentIntent(
  stripe: Stripe,
  pi: Stripe.PaymentIntent
): Promise<string | undefined> {
  return resolveOrderIdFromPaymentIntentObject(stripe, pi);
}
