import { useState, useCallback } from 'react';
import { NewsletterService } from '../services/newsletterService';
import { SubscribeNewsletterInput, UnsubscribeNewsletterInput } from '../types';

export const useNewsletter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const subscribe = useCallback(async (input: SubscribeNewsletterInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Verifică dacă email-ul există deja
      const emailExists = await NewsletterService.checkEmailExists(input.email);
      
      if (emailExists) {
        setSuccess('Email-ul tău este deja înscris la newsletter!');
        return { success: true, alreadySubscribed: true };
      }

      const result = await NewsletterService.subscribe({
        ...input,
        locale: input.locale || 'ro-RO',
        tags: input.tags || ['mo', 'digest-zi'],
        source: input.source || 'web',
        consentVersion: input.consentVersion || 'v1.0',
        metadata: input.metadata || {}
      });

      setSuccess('Te-ai înscris cu succes la newsletter!');
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare la înscrierea la newsletter';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (input: UnsubscribeNewsletterInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await NewsletterService.unsubscribe(input);
      setSuccess('Te-ai dezabonat cu succes de la newsletter!');
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare la dezabonarea de la newsletter';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkSubscriptionStatus = useCallback(async (email: string) => {
    try {
      return await NewsletterService.getSubscriptionStatus(email);
    } catch (err) {
      console.error('Error checking subscription status:', err);
      return null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
    isLoading,
    error,
    success,
    clearMessages
  };
};
