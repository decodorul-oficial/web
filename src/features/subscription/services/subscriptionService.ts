import { getGraphQLClient } from '@/lib/graphql/client';
import { UserService } from '@/features/user/services/userService';
import {
  GET_SUBSCRIPTION_TIERS,
  GET_MY_SUBSCRIPTION,
  GET_MY_PAYMENT_METHODS,
  GET_SUBSCRIPTION_USAGE,
  GET_ORDER,
  GET_MY_ORDERS,
  START_CHECKOUT,
  CONFIRM_PAYMENT,
  REACTIVATE_SUBSCRIPTION,
  CANCEL_SUBSCRIPTION,
  UPDATE_PAYMENT_METHOD,
  ADMIN_REFUND,
  ADMIN_CANCEL_SUBSCRIPTION
} from '../graphql/queries';
import { GET_MY_ENHANCED_PROFILE } from '@/features/user/graphql/userQueries';
import {
  SubscriptionTier,
  Subscription,
  CheckoutSession,
  Order,
  PaymentMethod,
  SubscriptionUsage,
  StartCheckoutInput,
  ReactivateSubscriptionInput,
  CancelSubscriptionInput,
  UpdatePaymentMethodInput,
  AdminRefundInput,
  Refund,
  RateLimitInfo,
  BillingAddress,
  EnhancedUser,
  EnhancedProfile
} from '../types';

export class SubscriptionService {
  // Funcție helper care creează un client API cu token-ul curent din UserService
  private getApiClient() {
    const token = UserService.getAuthToken();
    return getGraphQLClient({
      getAuthToken: () => token ?? undefined
    });
  }

  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    const client = this.getApiClient();
    const result = await client.request<{ getSubscriptionTiers: SubscriptionTier[] }>(
      GET_SUBSCRIPTION_TIERS
    );
    return result.getSubscriptionTiers;
  }

  async getMySubscription(): Promise<Subscription | null> {
    const client = this.getApiClient();
    const result = await client.request<{ getMySubscription: Subscription | null }>(
      GET_MY_SUBSCRIPTION
    );
    return result.getMySubscription;
  }

  async getMyPaymentMethods(): Promise<PaymentMethod[]> {
    const client = this.getApiClient();
    const result = await client.request<{ getMyPaymentMethods: PaymentMethod[] }>(
      GET_MY_PAYMENT_METHODS
    );
    return result.getMyPaymentMethods;
  }

  async getSubscriptionUsage(): Promise<SubscriptionUsage | null> {
    const client = this.getApiClient();
    const result = await client.request<{ getSubscriptionUsage: SubscriptionUsage | null }>(
      GET_SUBSCRIPTION_USAGE
    );
    return result.getSubscriptionUsage;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const client = this.getApiClient();
    const result = await client.request<{ getOrder: Order | null }>(
      GET_ORDER,
      { orderId }
    );
    return result.getOrder;
  }

  async getMyOrders(limit?: number, offset?: number): Promise<Order[]> {
    const client = this.getApiClient();
    const result = await client.request<{ getMyOrders: Order[] }>(
      GET_MY_ORDERS,
      { limit, offset }
    );
    return result.getMyOrders;
  }

  async startCheckout(input: StartCheckoutInput): Promise<CheckoutSession> {
    const client = this.getApiClient();
    const result = await client.request<{ startCheckout: CheckoutSession }>(
      START_CHECKOUT,
      { input }
    );
    return result.startCheckout;
  }

  async confirmPayment(orderId: string): Promise<Order> {
    const client = this.getApiClient();
    const result = await client.request<{ confirmPayment: Order }>(
      CONFIRM_PAYMENT,
      { orderId }
    );
    return result.confirmPayment;
  }

  async reactivateSubscription(input: ReactivateSubscriptionInput): Promise<Subscription> {
    const client = this.getApiClient();
    const result = await client.request<{ reactivateSubscription: Subscription }>(
      REACTIVATE_SUBSCRIPTION,
      { input }
    );
    return result.reactivateSubscription;
  }

  async cancelSubscription(input: CancelSubscriptionInput): Promise<Subscription> {
    const client = this.getApiClient();
    const result = await client.request<{ cancelSubscription: Subscription }>(
      CANCEL_SUBSCRIPTION,
      { input }
    );
    return result.cancelSubscription;
  }

  async updatePaymentMethod(input: UpdatePaymentMethodInput): Promise<PaymentMethod> {
    const client = this.getApiClient();
    const result = await client.request<{ updatePaymentMethod: PaymentMethod }>(
      UPDATE_PAYMENT_METHOD,
      { input }
    );
    return result.updatePaymentMethod;
  }

  async adminRefund(input: AdminRefundInput): Promise<Refund> {
    const client = this.getApiClient();
    const result = await client.request<{ adminRefund: Refund }>(
      ADMIN_REFUND,
      { input }
    );
    return result.adminRefund;
  }

  async adminCancelSubscription(subscriptionId: string, reason?: string): Promise<Subscription> {
    const client = this.getApiClient();
    const result = await client.request<{ adminCancelSubscription: Subscription }>(
      ADMIN_CANCEL_SUBSCRIPTION,
      { subscriptionId, reason }
    );
    return result.adminCancelSubscription;
  }

  // Obține informații despre rate limiting
  async getRateLimitInfo(): Promise<RateLimitInfo> {
    const client = this.getApiClient();
    const result = await client.request<{ getRateLimitInfo: RateLimitInfo }>(`
      query GetRateLimitInfo {
        getRateLimitInfo {
          hasUnlimitedRequests
          requestLimit
          currentRequests
          remainingRequests
          tier
          tierName
        }
      }
    `);
    return result.getRateLimitInfo;
  }

  // Verifică dacă utilizatorul are acces nelimitat
  async hasUnlimitedAccess(): Promise<boolean> {
    try {
      const rateLimitInfo = await this.getRateLimitInfo();
      return rateLimitInfo.hasUnlimitedRequests;
    } catch (error) {
      console.error('Error checking unlimited access:', error);
      return false;
    }
  }

  // Obține tier-urile disponibile cu informații complete
  async getAvailableTiers(): Promise<SubscriptionTier[]> {
    const client = this.getApiClient();
    const result = await client.request<{ getSubscriptionTiers: SubscriptionTier[] }>(`
      query GetSubscriptionTiers {
        getSubscriptionTiers {
          id
          name
          displayName
          description
          price
          currency
          interval
          features
          isPopular
          trialDays
          isActive
        }
      }
    `);
    return result.getSubscriptionTiers;
  }

  // Obține profilul utilizatorului cu informații complete despre abonament
  async getMyProfile(): Promise<EnhancedUser | null> {
    const client = this.getApiClient();
    const result = await client.request<{ me: EnhancedUser }>(GET_MY_ENHANCED_PROFILE);
    return result.me;
  }

  // Obține doar informațiile despre abonamentul activ din profil
  async getActiveSubscriptionFromProfile(): Promise<Subscription | null> {
    try {
      const profile = await this.getMyProfile();
      if (!profile?.profile?.activeSubscription) {
        return null;
      }

      const activeSub = profile.profile.activeSubscription;
      return {
        id: activeSub.id,
        status: activeSub.status,
        tier: {
          id: activeSub.tier.name,
          name: activeSub.tier.name,
          displayName: activeSub.tier.displayName,
          description: '',
          price: activeSub.tier.price,
          currency: 'RON',
          interval: 'MONTHLY' as const,
          features: activeSub.tier.features,
          isPopular: false,
          trialDays: 0,
          isActive: true
        },
        currentPeriodStart: activeSub.currentPeriodStart,
        currentPeriodEnd: activeSub.currentPeriodEnd,
        cancelAtPeriodEnd: false,
        createdAt: activeSub.currentPeriodStart,
        updatedAt: activeSub.currentPeriodEnd
      };
    } catch (error) {
      console.error('Error getting active subscription from profile:', error);
      return null;
    }
  }

  // Obține statisticile de utilizare din profil
  async getSubscriptionUsageFromProfile(): Promise<SubscriptionUsage | null> {
    try {
      const profile = await this.getMyProfile();
      if (!profile?.profile?.subscriptionUsage) {
        return null;
      }

      const usage = profile.profile.subscriptionUsage;
      return {
        subscriptionId: profile.profile.activeSubscription?.id || '',
        currentPeriodStart: profile.profile.activeSubscription?.currentPeriodStart || '',
        currentPeriodEnd: profile.profile.activeSubscription?.currentPeriodEnd || '',
        requestsUsed: usage.requestsUsed,
        requestsLimit: usage.requestsLimit,
        requestsRemaining: usage.requestsRemaining,
        featuresUsed: [],
        featuresLimit: []
      };
    } catch (error) {
      console.error('Error getting subscription usage from profile:', error);
      return null;
    }
  }

  // Începe procesul de checkout cu Netopia
  async startNetopiaCheckout(tierId: string, customerEmail: string, billingAddress: BillingAddress): Promise<CheckoutSession> {
    const client = this.getApiClient();
    const result = await client.request<{ startCheckout: CheckoutSession }>(`
      mutation StartCheckout($input: StartCheckoutInput!) {
        startCheckout(input: $input) {
          orderId
          checkoutUrl
          expiresAt
        }
      }
    `, {
      input: {
        tierId,
        customerEmail,
        billingAddress
      }
    });
    return result.startCheckout;
  }

  // Confirmă plata după returnarea de la Netopia
  async confirmNetopiaPayment(orderId: string): Promise<Order> {
    const client = this.getApiClient();
    const result = await client.request<{ confirmPayment: Order }>(`
      mutation ConfirmPayment($orderId: ID!) {
        confirmPayment(orderId: $orderId) {
          id
          status
          amount
          currency
          checkoutUrl
        }
      }
    `, { orderId });
    return result.confirmPayment;
  }
}

export const subscriptionService = new SubscriptionService();
