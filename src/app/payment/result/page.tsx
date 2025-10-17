'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const orderIdParam = searchParams.get('orderId');
        const statusParam = searchParams.get('status');
        
        if (!orderIdParam) {
          setStatus('error');
          setMessage('ID-ul comenzii lipsește');
          return;
        }

        setOrderId(orderIdParam);

        if (statusParam === 'success') {
          // Confirm payment with API
          try {
            const order = await subscriptionService.confirmNetopiaPayment(orderIdParam);
            
            if (order.status === 'SUCCEEDED') {
              setStatus('success');
              setMessage('Plata a fost procesată cu succes! Abonamentul tău este acum activ.');
            } else {
              setStatus('error');
              setMessage('Plata nu a fost procesată cu succes. Te rugăm să contactezi suportul.');
            }
          } catch (error) {
            console.error('Error confirming payment:', error);
            setStatus('error');
            setMessage('Eroare la confirmarea plății. Te rugăm să contactezi suportul.');
          }
        } else if (statusParam === 'cancel') {
          setStatus('error');
          setMessage('Plata a fost anulată. Poți încerca din nou oricând.');
        } else {
          setStatus('pending');
          setMessage('Plata este în procesare. Te vom notifica când va fi finalizată.');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        setStatus('error');
        setMessage('A apărut o eroare neașteptată. Te rugăm să contactezi suportul.');
      }
    };

    processPayment();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      default:
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Plata Reușită!';
      case 'error':
        return 'Eroare la Plată';
      case 'pending':
        return 'Plata în Procesare';
      default:
        return 'Se procesează...';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-responsive flex-1 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h1 className={`text-3xl font-bold ${getStatusColor()} mb-4`}>
              {getStatusTitle()}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {message}
            </p>
            {orderId && (
              <p className="text-sm text-gray-500">
                ID Comandă: {orderId}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Următorii pași
            </h2>
            
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Abonamentul tău Pro este acum activ și poți beneficia de toate funcționalitățile premium.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-info text-white rounded-lg font-medium hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-brand-info"
                  >
                    Vezi Profilul
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Înapoi la Acasă
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Dacă ai întrebări despre plata ta sau ai nevoie de asistență, te rugăm să ne contactezi.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/preturi"
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-info text-white rounded-lg font-medium hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-brand-info"
                  >
                    Încearcă din nou
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Contactează-ne
                  </Link>
                </div>
              </div>
            )}

            {status === 'pending' && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Plata ta este în procesare. Vei primi o notificare prin email când va fi finalizată.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-info text-white rounded-lg font-medium hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-brand-info"
                  >
                    Vezi Profilul
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Înapoi la Acasă
                  </Link>
                </div>
              </div>
            )}

            {status === 'loading' && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Se procesează plata ta...
                </p>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <p>
              Dacă ai întrebări, te rugăm să ne contactezi la{' '}
              <a href="mailto:support@monitoruloficial.ro" className="text-brand-info hover:underline">
                support@monitoruloficial.ro
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 text-brand-info animate-spin" />
              </div>
              <h1 className="text-3xl font-bold text-gray-600 mb-4">
                Se încarcă...
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Se procesează informațiile despre plata ta...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}