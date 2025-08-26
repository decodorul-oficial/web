'use client';

import { useState, useEffect } from 'react';
import { useNewsletter } from '@/features/newsletter/hooks/useNewsletter';
import { UNSUBSCRIBE_REASONS, UnsubscribeReason } from '@/features/newsletter/types';
import { resetNewsletterTracking } from '@/lib/utils/newsletterTracking';

interface UnsubscribeNewsletterFormProps {
  initialEmail?: string;
}

export const UnsubscribeNewsletterForm = ({ initialEmail }: UnsubscribeNewsletterFormProps) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [reason, setReason] = useState<UnsubscribeReason | ''>('');
  const [customReason, setCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { unsubscribe, success, clearMessages } = useNewsletter();

  useEffect(() => {
    if (success) {
      // Resetează tracking-ul newsletter când utilizatorul se dezabonează
      resetNewsletterTracking();
      setIsCompleted(true);
      setIsProcessing(false);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Adresa de email este obligatorie');
      return;
    }

    if (!reason) {
      setError('Te rugăm să selectezi un motiv pentru dezabonare');
      return;
    }

    setIsProcessing(true);
    setError(null);
    clearMessages();

    try {
      const finalReason = reason === 'Alte motive' ? customReason : reason;
      
      await unsubscribe({
        email: email.trim(),
        reason: finalReason
      });
    } catch (err) {
      setError('A apărut o eroare. Te rugăm să încerci din nou.');
      setIsProcessing(false);
    }
  };

  const handleReasonChange = (selectedReason: UnsubscribeReason) => {
    setReason(selectedReason);
    if (selectedReason !== 'Alte motive') {
      setCustomReason('');
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Dezabonare Completă
          </h2>
          
          <p className="text-gray-600 mb-6">
            Te-ai dezabonat cu succes de la newsletter-ul nostru. Nu vei mai primi email-uri de la noi.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Email:</strong> {email}
            </p>
            {reason && reason !== 'Alte motive' && (
              <p className="text-sm text-blue-700 mt-1">
                <strong>Motiv:</strong> {reason}
              </p>
            )}
            {reason === 'Alte motive' && customReason && (
              <p className="text-sm text-blue-700 mt-1">
                <strong>Motiv:</strong> {customReason}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Înapoi la Pagina Principală
            </a>
            
            <button
              onClick={() => {
                setIsCompleted(false);
                setEmail('');
                setReason('');
                setCustomReason('');
                setError(null);
                clearMessages();
              }}
              className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Dezabonează Alt Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Adresa de email *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="exemplu@email.com"
            required
            disabled={isProcessing}
          />
        </div>

        {/* Reason Selection */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Motivul dezabonării *
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => handleReasonChange(e.target.value as UnsubscribeReason)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isProcessing}
          >
            <option value="">Selectează un motiv</option>
            {UNSUBSCRIBE_REASONS.map((reasonOption) => (
              <option key={reasonOption} value={reasonOption}>
                {reasonOption}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Reason Input */}
        {reason === 'Alte motive' && (
          <div>
            <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-2">
              Specifică motivul
            </label>
            <textarea
              id="customReason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Te rugăm să ne spui de ce te dezabonezi..."
              required
              disabled={isProcessing}
            />
          </div>
        )}

        {/* Error Message */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !email.trim() || !reason}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isProcessing || !email.trim() || !reason
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
          } transition-colors`}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Se procesează...
            </div>
          ) : (
            'Confirmă Dezabonarea'
          )}
        </button>
      </form>

      {/* Additional Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Informații importante
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Dezabonarea va fi procesată imediat</li>
            <li>• Nu vei mai primi email-uri de la noi</li>
            <li>• Poți să te înscrii din nou oricând</li>
            <li>• Datele tale vor fi păstrate conform politicii de confidențialitate</li>
          </ul>
        </div>
      </div>

      {/* Back to Home */}
      <div className="mt-6 text-center">
        <a
          href="/"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Înapoi la Pagina Principală
        </a>
      </div>
    </div>
  );
};
