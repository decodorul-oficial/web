'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNewsletter } from '@/features/newsletter/hooks/useNewsletter';
import { NewsletterModalProps } from '@/features/newsletter/types';
import { OverlayBackdrop } from '@/components/ui/OverlayBackdrop';

export const NewsletterModal = ({ isOpen, onClose, onSuccess }: NewsletterModalProps) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const { subscribe, isLoading, error, success, clearMessages } = useNewsletter();

  const resetForm = useCallback(() => {
    setEmail('');
    setConsent(false);
    setEmailError('');
    clearMessages();
  }, [clearMessages]);

  useEffect(() => {
    if (success && onSuccess) {
      onSuccess();
      const timer = setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onSuccess, onClose, resetForm]);

  useEffect(() => {
    if (isOpen) {
      clearMessages();
      resetForm();
    }
  }, [isOpen, clearMessages, resetForm]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Adresa de email este obligatorie');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Adresa de email nu este validă');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) return;
    if (!consent) {
      alert('Trebuie să accepți termenii și condițiile pentru a continua');
      return;
    }

    const result = await subscribe({
      email: email.trim(),
      locale: 'ro-RO',
      tags: ['mo', 'digest-zi'],
      source: 'web',
      consentVersion: 'v1.0',
      metadata: {
        utm: 'newsletter-modal',
        timestamp: new Date().toISOString()
      }
    });

    if (result.success) {
      // Formularul se va reseta automat după 2 secunde
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <OverlayBackdrop
        position="fixed"
        zIndexClass="z-40"
        onClick={onClose}
        ariaHidden={true}
        className="bg-brand-info/20"
      />
      
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-50 bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border-t-4 border-brand-info animate-in slide-in-from-bottom-2"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand">
            Înscrie-te la Newsletter
          </h2>
          <button
            onClick={onClose}
            className="text-brand-highlight hover:text-brand transition-colors"
            aria-label="Închide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Primește cele mai importante știri și actualizări legislative direct în inbox-ul tău.
          </p>
          
          <div className="bg-brand-info/10 border-l-4 border-brand-info p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-brand-info" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-brand">
                  <strong>Gratuit și fără spam.</strong> Poți să te dezabonezi oricând.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand mb-2">
              Adresa de email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-info focus:border-brand-info ${
                emailError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="exemplu@email.com"
              disabled={isLoading}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5 flex-shrink-0">
              <div className="relative">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="sr-only"
                  disabled={isLoading}
                />
                <div 
                  className={`h-5 w-5 border-2 rounded cursor-pointer flex items-center justify-center transition-colors ${
                    consent 
                      ? 'bg-brand-info border-brand-info' 
                      : 'bg-white border-gray-300 hover:border-brand-info'
                  }`}
                  onClick={() => !isLoading && setConsent(!consent)}
                >
                  {consent && (
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm">
              <label htmlFor="consent" className="text-brand cursor-pointer leading-relaxed">
                Accept să primesc newsletter-ul și confirm că am citit și accept{' '}
                <a href="/privacy" className="text-brand-info hover:underline" target="_blank" rel="noopener noreferrer">
                  Politica de Confidențialitate
                </a>{' '}
                și{' '}
                <a href="/cookies" className="text-brand-info hover:underline" target="_blank" rel="noopener noreferrer">
                  Politica de Cookie-uri
                </a>
              </label>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !consent}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading || !consent
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-info hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info'
            } transition-colors`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Se procesează...
              </div>
            ) : (
              'Înscrie-te la Newsletter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Prin înscrierea la newsletter, confirm că am citit și accept termenii și condițiile.
          </p>
        </div>
      </div>
    </div>
  );
};
