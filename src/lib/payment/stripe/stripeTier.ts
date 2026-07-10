import type { SubscriptionTier } from '@/features/subscription/types';

export function stripeRecurringIntervalFromTier(tier: Pick<SubscriptionTier, 'interval'>): 'month' | 'year' {
  switch (tier.interval) {
    case 'MONTHLY':
      return 'month';
    case 'YEARLY':
      return 'year';
    case 'LIFETIME':
      // Abonamentele Stripe Billing nu au interval „lifetime”; folosim lunar ca fallback practic.
      return 'month';
    default:
      return 'month';
  }
}

