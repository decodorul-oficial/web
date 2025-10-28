'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import { Subscription, SubscriptionTier, SubscriptionUsage, EnhancedUser } from '@/features/subscription/types';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Clock, Loader2, ChevronDown, ChevronUp, BarChart3, CreditCard as CardIcon, History } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PricingSection from './PricingSection';

export function SubscriptionManagement() {
  const { user, trialStatus, hasPremiumAccess } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [enhancedProfile, setEnhancedProfile] = useState<EnhancedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const [isPlansExpanded, setIsPlansExpanded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subscriptionData, tiersData, usageData, profileData] = await Promise.all([
          subscriptionService.getMySubscription(),
          subscriptionService.getAvailableTiers(),
          subscriptionService.getSubscriptionUsageFromProfile(),
          subscriptionService.getMyProfile()
        ]);
        
        setSubscription(subscriptionData);
        setTiers(tiersData);
        setUsage(usageData);
        setEnhancedProfile(profileData);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        toast.error('Eroare la încărcarea datelor abonamentului');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('Ești sigur că vrei să anulezi abonamentul? Vei păstra accesul până la sfârșitul perioadei curente.')) {
      return;
    }

    try {
      setCancelling(true);
      
      await subscriptionService.cancelSubscription({
        subscriptionId: subscription.id,
        immediate: false,
        refund: false,
        reason: 'Utilizator a solicitat anularea'
      });

      toast.success('Abonamentul a fost anulat cu succes');
      
      // Reload subscription data
      const updatedSubscription = await subscriptionService.getMySubscription();
      setSubscription(updatedSubscription);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Eroare la anularea abonamentului');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'TRIAL':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activ';
      case 'TRIAL':
        return 'Trial';
      case 'CANCELLED':
        return 'Anulat';
      case 'EXPIRED':
        return 'Expirat';
      case 'PENDING':
        return 'În așteptare';
      case 'FAILED':
        return 'Eșuat';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-info" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Trial Status */}
      {(trialStatus && trialStatus.hasTrial) || (enhancedProfile?.profile?.trialStatus && enhancedProfile.profile.trialStatus.hasTrial) ? (
        <div className="bg-gradient-to-r from-brand-info/10 to-brand-accent/10 border border-brand-info/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-brand-info" />
            <h3 className="text-lg font-semibold text-brand-info">Status Trial</h3>
          </div>
          <div className="text-sm text-brand-info/80">
            {(() => {
              const currentTrialStatus = enhancedProfile?.profile?.trialStatus || trialStatus;
              if (currentTrialStatus?.isTrial && !currentTrialStatus?.expired) {
                return <p>Ai {currentTrialStatus.daysRemaining} zile rămase din trial-ul Pro</p>;
              } else if (currentTrialStatus?.expired) {
                return <p>Trial-ul a expirat. Upgrade pentru a continua</p>;
              } else {
                return <p>Ai folosit deja trial-ul Pro</p>;
              }
            })()}
          </div>
        </div>
      ) : null}

      {/* Current Subscription */}
      {(subscription || enhancedProfile?.profile?.activeSubscription || (hasPremiumAccess && enhancedProfile?.profile?.subscriptionTier === 'pro')) ? (
        <div className="space-y-6">
          {/* Plan Name and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-2xl font-bold text-gray-900">
                {subscription?.tier?.displayName || 
                 enhancedProfile?.profile?.activeSubscription?.tier?.displayName || 
                 (enhancedProfile?.profile?.subscriptionTier === 'pro' ? 'Pro' : 'Pro')}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription?.status === 'ACTIVE' || enhancedProfile?.profile?.activeSubscription?.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : enhancedProfile?.profile?.trialStatus?.isTrial 
                    ? 'bg-brand-info/20 text-brand-info' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {subscription?.status === 'ACTIVE' || enhancedProfile?.profile?.activeSubscription?.status === 'ACTIVE' ? 'Activ' : 
                 enhancedProfile?.profile?.trialStatus?.isTrial ? 'Trial' : 
                 hasPremiumAccess ? 'Pro' : 'Pro'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {subscription?.tier?.price ? 
                  `${subscription.tier.price} ${subscription.tier.currency}` :
                  enhancedProfile?.profile?.activeSubscription?.tier?.price ?
                    `${enhancedProfile.profile.activeSubscription.tier.price} ${enhancedProfile.profile.activeSubscription.tier.currency}` :
                    enhancedProfile?.profile?.trialStatus?.isTrial ? 'Trial Gratuit' : 'Pro'
                }
              </p>
              <p className="text-gray-500">
                {subscription?.tier?.interval ? 
                  `/${subscription.tier.interval === 'MONTHLY' ? 'lună' : 'an'}` :
                  enhancedProfile?.profile?.activeSubscription?.tier?.interval ?
                    `/${enhancedProfile.profile.activeSubscription.tier.interval === 'MONTHLY' ? 'lună' : 'an'}` :
                    enhancedProfile?.profile?.trialStatus?.isTrial ? 'Trial activ' : 'Abonament activ'
                }
              </p>
            </div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Cost</h4>
              <p className="text-lg font-semibold text-gray-900">
                {subscription?.tier?.price ? 
                  `${subscription.tier.price} ${subscription.tier.currency} / ${subscription.tier.interval === 'MONTHLY' ? 'lună' : 'an'}` :
                  enhancedProfile?.profile?.activeSubscription?.tier?.price ?
                    `${enhancedProfile.profile.activeSubscription.tier.price} ${enhancedProfile.profile.activeSubscription.tier.currency} / ${enhancedProfile.profile.activeSubscription.tier.interval === 'MONTHLY' ? 'lună' : 'an'}` :
                    enhancedProfile?.profile?.trialStatus?.isTrial ? 'Trial Gratuit' : 'Pro - Acces complet'
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
              <p className="text-lg font-semibold text-gray-900">
                {subscription?.cancelAtPeriodEnd || enhancedProfile?.profile?.activeSubscription?.cancelAtPeriodEnd ? 
                  'Se va anula' : 
                  subscription?.status === 'ACTIVE' || enhancedProfile?.profile?.activeSubscription?.status === 'ACTIVE' ? 
                    'Plată recurentă activă' : 
                    enhancedProfile?.profile?.trialStatus?.isTrial ? 
                      `Trial (${enhancedProfile.profile.trialStatus.daysRemaining} zile)` : 
                      'Activ'
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                {enhancedProfile?.profile?.trialStatus?.isTrial ? 'Trial se termină' : 'Data reînnoirii'}
              </h4>
              <p className="text-lg font-semibold text-gray-900">
                {subscription?.currentPeriodEnd ? 
                  `Se reînnoiește la ${formatDate(subscription.currentPeriodEnd)}` :
                  enhancedProfile?.profile?.activeSubscription?.currentPeriodEnd ?
                    `Se reînnoiește la ${formatDate(enhancedProfile.profile.activeSubscription.currentPeriodEnd)}` :
                    enhancedProfile?.profile?.trialStatus?.isTrial && enhancedProfile.profile.trialStatus.trialEnd ?
                      `La ${formatDate(enhancedProfile.profile.trialStatus.trialEnd)}` :
                      'Abonament activ'
                }
              </p>
            </div>
          </div>

          {/* Usage Statistics */}
          {(usage || enhancedProfile?.profile?.subscriptionUsage) && (
            <div className="bg-gradient-to-r from-brand-info/10 to-brand-accent/10 border border-brand-info/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-brand-info" />
                <h3 className="text-lg font-semibold text-brand-info">Statistici de utilizare</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-info">
                    {usage?.requestsUsed || enhancedProfile?.profile?.subscriptionUsage?.requestsUsed || 0}
                  </p>
                  <p className="text-sm text-brand-info/80">Cereri folosite</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-info">
                    {usage?.requestsRemaining || enhancedProfile?.profile?.subscriptionUsage?.requestsRemaining || 0}
                  </p>
                  <p className="text-sm text-brand-info/80">Cereri rămase</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-info">
                    {usage?.requestsLimit || enhancedProfile?.profile?.subscriptionUsage?.requestsLimit || 0}
                  </p>
                  <p className="text-sm text-brand-info/80">Limită totală</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-brand-info/20 rounded-full h-2">
                  <div 
                    className="bg-brand-info h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${((usage?.requestsUsed || enhancedProfile?.profile?.subscriptionUsage?.requestsUsed || 0) / 
                               (usage?.requestsLimit || enhancedProfile?.profile?.subscriptionUsage?.requestsLimit || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-brand-info mt-1 text-center">
                  {Math.round(((usage?.requestsUsed || enhancedProfile?.profile?.subscriptionUsage?.requestsUsed || 0) / 
                              (usage?.requestsLimit || enhancedProfile?.profile?.subscriptionUsage?.requestsLimit || 1)) * 100)}% utilizat
                </p>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {enhancedProfile?.profile?.paymentMethods && enhancedProfile.profile.paymentMethods.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CardIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Metode de plată</h3>
              </div>
              <div className="space-y-3">
                {enhancedProfile.profile.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <CardIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.brand.toUpperCase()} •••• {method.last4}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expiră {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                        </p>
                        {method.isDefault && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Implicit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription History */}
          {enhancedProfile?.profile?.subscriptionHistory && enhancedProfile.profile.subscriptionHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <History className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Istoric abonamente</h3>
              </div>
              <div className="space-y-3">
                {enhancedProfile.profile.subscriptionHistory.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        {getStatusIcon(entry.status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.tier.displayName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getStatusText(entry.status)} • {formatDate(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {entry.tier.price} {entry.tier.currency}
                      </p>
                      <p className="text-xs text-gray-500">
                        /{entry.tier.interval === 'MONTHLY' ? 'lună' : 'an'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/preturi"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-brand-info rounded-lg hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-brand-info transition-colors"
            >
              Schimbă Planul
            </Link>
            
            <button className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors">
              Vezi Istoric Facturi
            </button>

            {subscription?.status === 'ACTIVE' && !subscription?.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se anulează...
                  </>
                ) : (
                  'Anulează Abonamentul'
                )}
              </button>
            )}
            
            {subscription?.cancelAtPeriodEnd && (
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-4 h-4 mr-2" />
                Se va anula la sfârșitul perioadei
              </div>
            )}
          </div>
        </div>
      ) : !hasPremiumAccess ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Nu ai abonament activ</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Upgrade la un plan Pro pentru a accesa toate funcționalitățile premium și a beneficia de funcții avansate
          </p>
          <Link
            href="/preturi"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-brand-info rounded-lg hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-brand-info transition-colors"
          >
            Alege un Plan
          </Link>
        </div>
      ) : null}

      {/* Available Plans - Collapsible section */}
      {tiers.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={() => setIsPlansExpanded(!isPlansExpanded)}
            className="flex items-center justify-between w-full text-left mb-6 hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900">Explorează alte planuri</h3>
            {isPlansExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {isPlansExpanded && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <PricingSection />
            </div>
          )}
        </div>
      )}
    </div>
  );
}