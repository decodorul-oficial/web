import { gql } from 'graphql-request';

// Queries
export const GET_SUBSCRIPTION_TIERS = gql`
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
`;

export const GET_MY_SUBSCRIPTION = gql`
  query GetMySubscription {
    getMySubscription {
      id
      status
      tier {
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
      }
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      trialEnd
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_PAYMENT_METHODS = gql`
  query GetMyPaymentMethods {
    getMyPaymentMethods {
      id
      type
      last4
      brand
      expMonth
      expYear
      isDefault
    }
  }
`;

export const GET_SUBSCRIPTION_USAGE = gql`
  query GetSubscriptionUsage {
    getSubscriptionUsage {
      subscriptionId
      currentPeriodStart
      currentPeriodEnd
      requestsUsed
      requestsLimit
      featuresUsed
      featuresLimit
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($orderId: ID!) {
    getOrder(orderId: $orderId) {
      id
      status
      amount
      currency
      subscriptionId
      billingDetails {
        firstName
        lastName
        companyName
        cui
        regCom
        address
        city
        county
        country
        zipCode
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders($limit: Int, $offset: Int) {
    getMyOrders(limit: $limit, offset: $offset) {
      id
      status
      amount
      currency
      subscriptionId
      billingDetails {
        firstName
        lastName
        companyName
        cui
        regCom
        address
        city
        county
        country
        zipCode
      }
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export const START_CHECKOUT = gql`
  mutation StartCheckout($input: StartCheckoutInput!) {
    startCheckout(input: $input) {
      orderId
      checkoutUrl
      expiresAt
    }
  }
`;

export const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($orderId: ID!) {
    confirmPayment(orderId: $orderId) {
      id
      status
      amount
      currency
      subscriptionId
      createdAt
      updatedAt
    }
  }
`;

export const REACTIVATE_SUBSCRIPTION = gql`
  mutation ReactivateSubscription($input: ReactivateSubscriptionInput!) {
    reactivateSubscription(input: $input) {
      id
      status
      tier {
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
      }
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      trialEnd
      createdAt
      updatedAt
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($input: CancelSubscriptionInput!) {
    cancelSubscription(input: $input) {
      id
      status
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
    updatePaymentMethod(input: $input) {
      id
      type
      last4
      brand
      expMonth
      expYear
      isDefault
    }
  }
`;

export const ADMIN_REFUND = gql`
  mutation AdminRefund($input: AdminRefundInput!) {
    adminRefund(input: $input) {
      id
      orderId
      amount
      currency
      status
      reason
      createdAt
    }
  }
`;

export const ADMIN_CANCEL_SUBSCRIPTION = gql`
  mutation AdminCancelSubscription($subscriptionId: ID!, $reason: String) {
    adminCancelSubscription(subscriptionId: $subscriptionId, reason: $reason) {
      id
      status
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      createdAt
      updatedAt
    }
  }
`;
