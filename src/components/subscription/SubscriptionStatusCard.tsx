"use client";

import { useState } from 'react';
import { Subscription } from '@/features/subscription/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  CreditCardIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SubscriptionStatusCardProps {
  subscription: Subscription;
  onUpdate: () => void;
}

export function SubscriptionStatusCard({ subscription, onUpdate }: SubscriptionStatusCardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getStatusInfo = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          title: 'Abonament Activ',
          description: 'Abonamentul tău este activ și funcțional'
        };
      case 'PENDING':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          title: 'Plată în Așteptare',
          description: 'Plata este în curs de procesare'
        };
      case 'FAILED':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          title: 'Plată Eșuată',
          description: 'Plata nu a putut fi procesată'
        };
      case 'EXPIRED':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          title: 'Abonament Expirat',
          description: 'Abonamentul tău a expirat'
        };
      case 'CANCELLED':
        return {
          icon: XCircleIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          title: 'Abonament Anulat',
          description: 'Abonamentul tău a fost anulat'
        };
      case 'TRIAL':
        return {
          icon: ClockIcon,
          color: 'text-brand-info',
          bgColor: 'bg-brand-info/20',
          title: 'Perioadă de Probă',
          description: 'Te afli în perioada de probă gratuită'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          title: 'Status Necunoscut',
          description: 'Statusul abonamentului nu este cunoscut'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await subscriptionService.cancelSubscription({
        subscriptionId: subscription.id,
        immediate: false,
        refund: false,
        reason: 'Utilizator a solicitat anularea'
      });
      setShowCancelDialog(false);
      onUpdate();
      toast.success('Abonamentul a fost anulat cu succes');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Eroare la anularea abonamentului. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setLoading(true);
      await subscriptionService.reactivateSubscription({
        subscriptionId: subscription.id,
        tierId: subscription.tier.id
      });
      setShowReactivateDialog(false);
      onUpdate();
      toast.success('Abonamentul a fost reînnoit cu succes');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error('Eroare la reînnoirea abonamentului. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const canCancel = subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd;
  const canReactivate = subscription.status === 'EXPIRED' || subscription.status === 'FAILED';
  const canUpgrade = subscription.status === 'TRIAL';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 rounded-full p-2 ${statusInfo.bgColor}`}>
            <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {statusInfo.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {statusInfo.description}
            </p>
            
            {subscription.status === 'ACTIVE' && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    Următoarea facturare: {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  <span>
                    {subscription.tier.displayName} - {subscription.tier.price} {subscription.tier.currency}
                    /{subscription.tier.interval === 'MONTHLY' ? 'lună' : 'an'}
                  </span>
                </div>
              </div>
            )}

            {subscription.status === 'TRIAL' && subscription.trialEnd && (
              <div className="mt-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>
                    Perioada de probă expiră: {formatDate(subscription.trialEnd)}
                  </span>
                </div>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="mt-3">
                <div className="flex items-center text-sm text-orange-600">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  <span>
                    Abonamentul va fi anulat la sfârșitul perioadei curente
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {canCancel && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            Anulează Abonamentul
          </button>
        )}

        {canReactivate && (
          <button
            onClick={() => setShowReactivateDialog(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Reînnoiește Abonamentul
          </button>
        )}

        {canUpgrade && (
          <button
            onClick={() => router.push('/preturi')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Upgrade la PRO
          </button>
        )}

        <button
          onClick={() => router.push('/preturi')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info"
        >
          <CreditCardIcon className="h-4 w-4 mr-2" />
          Schimbă Planul
        </button>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelSubscription}
        title="Anulează Abonamentul"
        message="Ești sigur că vrei să anulezi abonamentul? Vei păstra accesul până la sfârșitul perioadei curente de facturare."
        confirmText="Anulează"
        cancelText="Păstrează"
        variant="warning"
        loading={loading}
      />

      {/* Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showReactivateDialog}
        onClose={() => setShowReactivateDialog(false)}
        onConfirm={handleReactivateSubscription}
        title="Reînnoiește Abonamentul"
        message="Ești sigur că vrei să reînnoiești abonamentul? Vei fi facturat imediat pentru perioada următoare."
        confirmText="Reînnoiește"
        cancelText="Anulează"
        variant="info"
        loading={loading}
      />
    </div>
  );
}
