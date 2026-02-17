export interface SubscriptionTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  interval: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  features: string[];
  isPopular?: boolean;
  trialDays?: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  status: 'ACTIVE' | 'PENDING' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'TRIAL';
  tier: SubscriptionTier;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSession {
  orderId: string;
  checkoutUrl: string;
  expiresAt: string;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
  subscriptionId?: string;
  checkoutUrl?: string;
  billingDetails?: BillingDetails;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface SubscriptionUsage {
  subscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  requestsUsed: number;
  requestsLimit: number;
  requestsRemaining: number;
  featuresUsed: string[];
  featuresLimit: string[];
}

export interface StartCheckoutInput {
  tierId: string;
  customerEmail: string;
  billingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
  };
}

export interface ReactivateSubscriptionInput {
  subscriptionId: string;
  tierId: string;
  paymentMethodId?: string;
}

export interface CancelSubscriptionInput {
  subscriptionId: string;
  immediate: boolean;
  refund: boolean;
  reason?: string;
}

export interface UpdatePaymentMethodInput {
  subscriptionId: string;
  paymentMethodId: string;
}

export interface AdminRefundInput {
  orderId: string;
  amount?: number;
  reason: string;
}

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  reason: string;
  createdAt: string;
}

export interface RateLimitInfo {
  hasUnlimitedRequests: boolean;
  requestLimit: number | null;
  currentRequests: number;
  remainingRequests: number | null;
  tier: string;
  tierName: string;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
}

// New types for enhanced profile data
export interface ActiveSubscription {
  id: string;
  userId: string;
  tier: {
    id: string;
    name: string;
    displayName: string;
    description: string;
    price: number;
    currency: string;
    interval: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
    features: string[];
    isPopular: boolean;
    trialDays: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  status: 'ACTIVE' | 'PENDING' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'TRIAL';
  netopiaOrderId: string;
  netopiaToken: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSubscriptionUsage {
  subscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  requestsUsed: number;
  requestsLimit: number;
  requestsRemaining: number;
  lastResetAt: string;
}

export interface ProfilePaymentMethod {
  id: string;
  userId: string;
  netopiaToken: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionHistoryEntry {
  id: string;
  userId: string;
  tier: {
    id: string;
    name: string;
    displayName: string;
    description: string;
    price: number;
    currency: string;
    interval: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
    features: string[];
    isPopular: boolean;
    trialDays: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  status: string;
  netopiaOrderId: string;
  netopiaToken: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface TrialStatus {
  isTrial: boolean;
  hasTrial: boolean;
  trialStart: string | null;
  trialEnd: string | null;
  tierId: string | null;
  daysRemaining: number | null;
  expired: boolean | null;
}

export interface UserPreferences {
  preferredCategories: string[];
  notificationSettings: {
    email?: boolean;
    push?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BillingDetails {
  id?: string; // Add ID for list management
  type: 'personal' | 'company';
  firstName: string;
  lastName: string;
  companyName?: string;
  cui?: string; // CUI sau CNP
  regCom?: string;
  address: string;
  city: string;
  county: string;
  country: string;
  zipCode?: string;
}

export interface EnhancedProfile {
  id: string;
  subscriptionTier: string;
  displayName: string;
  avatarUrl: string | null;
  isNewsletterSubscribed: boolean;
  isAdmin?: boolean;
  trialStatus: TrialStatus;
  preferences: UserPreferences;
  activeSubscription: ActiveSubscription | null;
  subscriptionUsage: ProfileSubscriptionUsage | null;
  paymentMethods: ProfilePaymentMethod[];
  subscriptionHistory: SubscriptionHistoryEntry[];
  billingDetails?: BillingDetails[]; // Changed to array
  createdAt: string;
  updatedAt: string;
}

export interface EnhancedUser {
  id: string;
  email: string;
  profile: EnhancedProfile;
  user_metadata?: {
    full_name?: string;
    billingDetails?: BillingDetails[]; // Changed to array
  };
}
