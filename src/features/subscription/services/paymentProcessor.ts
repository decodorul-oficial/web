import type { BillingDetails } from '../types';
import { subscriptionService } from './subscriptionService';
import { arePaymentsEnabledClient, PAYMENTS_DISABLED_MESSAGE } from '@/lib/payment/paymentsEnabled';
import { getStripeSuccessUrlForGraphQL } from '@/lib/payment/stripe/stripeGraphqlSuccessUrl';

export type StartCheckoutResult = {
  provider: 'stripe';
  checkout_url: string;
};

export class PaymentProcessor {
  async startCheckout(input: {
    tierId: string;
    customerEmail: string;
    billingDetails: BillingDetails;
    stripePriceId?: string | null;
    stripeSuccessUrl?: string | null;
  }): Promise<StartCheckoutResult> {
    if (!arePaymentsEnabledClient()) {
      throw new Error(PAYMENTS_DISABLED_MESSAGE);
    }

    const session = await subscriptionService.startCheckout({
      tierId: input.tierId,
      customerEmail: input.customerEmail,
      billingDetails: input.billingDetails,
      stripePriceId: input.stripePriceId,
      stripeSuccessUrl: input.stripeSuccessUrl ?? getStripeSuccessUrlForGraphQL().stripeSuccessUrl
    });

    if (!session.checkoutUrl) {
      throw new Error('Nu am primit URL-ul de checkout Stripe.');
    }

    return {
      provider: 'stripe',
      checkout_url: session.checkoutUrl
    };
  }

  async getCustomerPortalUrl(input: {
    returnUrl?: string;
  }): Promise<{ provider: 'stripe'; portal_url: string }> {
    if (!arePaymentsEnabledClient()) {
      throw new Error(PAYMENTS_DISABLED_MESSAGE);
    }

    const { url } = await subscriptionService.createStripeCustomerPortalSession(input.returnUrl);
    return { provider: 'stripe', portal_url: url };
  }
}

export const paymentProcessor = new PaymentProcessor();
