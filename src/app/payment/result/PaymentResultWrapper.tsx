"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useOrder } from '@/features/subscription/hooks/useSubscription';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [polling, setPolling] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState(0);
  
  const { order, loading, error, refetch } = useOrder(orderId);

  // Poll for order status updates
  useEffect(() => {
    if (!orderId || !polling) return;

    const pollInterval = setInterval(async () => {
      if (maxAttempts >= 30) { // Stop after 5 minutes (30 * 10s)
        setPolling(false);
        return;
      }

      try {
        await refetch();
        setMaxAttempts(prev => prev + 1);
      } catch (error) {
        console.error('Error polling order status:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [orderId, polling, maxAttempts, refetch]);

  // Stop polling when order is resolved
  useEffect(() => {
    if (order && (order.status === 'SUCCEEDED' || order.status === 'FAILED' || order.status === 'CANCELLED')) {
      setPolling(false);
    }
  }, [order]);

  const getStatusInfo = () => {
    if (!order) {
      return {
        icon: ClockIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        title: 'Se verifică plata...',
        description: 'Te rugăm să aștepți în timp ce verificăm statusul plății.',
        showSpinner: true
      };
    }

    switch (order.status) {
      case 'SUCCEEDED':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          title: 'Plată Reușită!',
          description: 'Plata a fost procesată cu succes. Abonamentul tău este acum activ.',
          showSpinner: false
        };
      case 'FAILED':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          title: 'Plată Eșuată',
          description: 'Plata nu a putut fi procesată. Te rugăm să încerci din nou.',
          showSpinner: false
        };
      case 'CANCELLED':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          title: 'Plată Anulată',
          description: 'Plata a fost anulată. Nu vei fi facturat.',
          showSpinner: false
        };
      case 'PENDING':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          title: 'Plată în Așteptare',
          description: 'Plata este în curs de procesare. Te rugăm să aștepți.',
          showSpinner: true
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          title: 'Status Necunoscut',
          description: 'Statusul plății nu este cunoscut.',
          showSpinner: false
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleRetry = () => {
    router.push('/preturi');
  };

  const handleViewAccount = () => {
    router.push('/account');
  };

  if (!orderId) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Eroare
            </h1>
            <p className="mt-2 text-gray-600">
              ID-ul comenzii lipsește din URL.
            </p>
            <button
              onClick={() => router.push('/preturi')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
            >
              Înapoi la Prețuri
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${statusInfo.bgColor}`}>
              {statusInfo.showSpinner ? (
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              ) : (
                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
              )}
            </div>
            
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              {statusInfo.title}
            </h1>
            
            <p className="mt-2 text-gray-600">
              {statusInfo.description}
            </p>

            {order && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>ID Comandă:</span>
                    <span className="font-mono">{order.id}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Suma:</span>
                    <span className="font-semibold">{order.amount} {order.currency}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Status:</span>
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Eroare la verificarea statusului plății: {error.message}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {order?.status === 'SUCCEEDED' && (
                <button
                  onClick={handleViewAccount}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
                >
                  Vezi Abonamentul Meu
                </button>
              )}
              
              {(order?.status === 'FAILED' || order?.status === 'CANCELLED') && (
                <button
                  onClick={handleRetry}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Încearcă Din Nou
                </button>
              )}
              
              <button
                onClick={() => router.push('/preturi')}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
              >
                Înapoi la Prețuri
              </button>
            </div>

            {polling && (
              <div className="mt-4 text-xs text-gray-500">
                Se verifică automat statusul plății...
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function PaymentResultWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-info mx-auto" />
            <p className="mt-2 text-gray-600">Se încarcă...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
