import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { subscriptionService } from '../services/subscriptionService';
import { Subscription, SubscriptionTier, Order, PaymentMethod, SubscriptionUsage } from '../types';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await subscriptionService.getMySubscription();
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const refetch = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionService.getMySubscription();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    loading,
    error,
    refetch
  };
}

export function useSubscriptionTiers() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await subscriptionService.getSubscriptionTiers();
        setTiers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription tiers'));
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, []);

  return {
    tiers,
    loading,
    error
  };
}

export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await subscriptionService.getOrder(orderId);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch order'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const refetch = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionService.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch order'));
    } finally {
      setLoading(false);
    }
  };

  return {
    order,
    loading,
    error,
    refetch
  };
}

export function usePaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setPaymentMethods([]);
      setLoading(false);
      return;
    }

    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await subscriptionService.getMyPaymentMethods();
        setPaymentMethods(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch payment methods'));
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [user]);

  return {
    paymentMethods,
    loading,
    error
  };
}

export function useSubscriptionUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setUsage(null);
      setLoading(false);
      return;
    }

    const fetchUsage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await subscriptionService.getSubscriptionUsage();
        setUsage(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription usage'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  return {
    usage,
    loading,
    error
  };
}
