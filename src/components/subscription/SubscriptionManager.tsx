'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import { Subscription, SubscriptionTier, SubscriptionUsage, EnhancedUser, Order } from '@/features/subscription/types';
import { AlertCircle, CheckCircle, Clock, Loader2, Check, Download } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

export function SubscriptionManager() {
  const { user, hasPremiumAccess } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [enhancedProfile, setEnhancedProfile] = useState<EnhancedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [planLoading, setPlanLoading] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'subscription' | 'billing'>('subscription');
  const [subscriptionSectionLoading, setSubscriptionSectionLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [subscriptionData, tiersData, profileData] = await Promise.all([
        subscriptionService.getMySubscription(),
        subscriptionService.getAvailableTiers(),
        subscriptionService.getMyProfile()
      ]);
      
      setSubscription(subscriptionData);
      setTiers(tiersData);
      setEnhancedProfile(profileData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Eroare la încărcarea datelor abonamentului');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load orders when billing section is active
  useEffect(() => {
    if (activeSection === 'billing') {
      loadOrders();
    }
  }, [activeSection]);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const ordersData = await subscriptionService.getMyOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Eroare la încărcarea facturilor');
    } finally {
      setOrdersLoading(false);
    }
  };

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

  const handleSubscriptionManagementClick = async () => {
    setActiveSection('subscription');
    // Refresh subscription data when switching to subscription management
    setSubscriptionSectionLoading(true);
    await loadData();
    setSubscriptionSectionLoading(false);
  };

  const handleSelectPlan = async (tierId: string) => {
    if (!user) {
      window.location.href = '/login?redirect=/profile';
      return;
    }

    try {
      setPlanLoading(tierId);
      
      // Get user profile for billing address
      const billingAddress = {
        firstName: user.user_metadata?.full_name?.split(' ')[0] || 'Utilizator',
        lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'PRO',
        address: 'Adresa de facturare',
        city: 'București',
        country: 'RO',
        zipCode: '010001'
      };

      const checkoutSession = await subscriptionService.startNetopiaCheckout(
        tierId,
        user.email || '',
        billingAddress
      );

      // Redirect to Netopia checkout
      window.location.href = checkoutSession.checkoutUrl;
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast.error('Eroare la inițierea procesului de plată. Te rugăm să încerci din nou.');
    } finally {
      setPlanLoading(null);
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

  const formatDateForInvoice = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const generateInvoicePDF = async (order: Order) => {
    setDownloadingInvoice(order.id);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 15;
      
      let currentY = margin;
      
      // Get subscription info (use enhancedProfile as fallback)
      const orderSubscription = subscription || enhancedProfile?.profile?.activeSubscription;
      
      // Company data (from env or defaults)
      const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Monitorul Oficial PRO';
      const companyCUI = process.env.NEXT_PUBLIC_COMPANY_CUI || 'ROxxxxxxxx';
      const companyRegNo = process.env.NEXT_PUBLIC_COMPANY_REG_NO || 'Jxx/xxxx/xxxx';
      const companyAddress = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Adresa completă';
      const companyCity = process.env.NEXT_PUBLIC_COMPANY_CITY || 'București';
      const companyEmail = 'contact@decodoruloficial.ro';
      const companyPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || '';
      const companySocialCapital = process.env.NEXT_PUBLIC_COMPANY_SOCIAL_CAPITAL || '200 lei';
      
      // Load logo image
      let logoData: string | null = null;
      try {
        const logoResponse = await fetch('/logo.png');
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          const reader = new FileReader();
          logoData = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              if (reader.result && typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('Failed to load logo'));
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(logoBlob);
          });
        }
      } catch (error) {
        console.log('Logo not found, continuing without logo');
      }
      
      // Calculate amounts with VAT (19% for Romania)
      const VAT_RATE = 0.19;
      const amountWithVAT = order.amount;
      const amountWithoutVAT = amountWithVAT / (1 + VAT_RATE);
      const vatAmount = amountWithVAT - amountWithoutVAT;
      
      // Brand colors
      const brandInfo = '#38a8a5';
      const brandHighlight = '#3A506B';
      
      // Helper function to add text
      const addText = (text: string, x: number, y: number, fontSize: number, isBold: boolean = false, color: string = '#000000', align: 'left' | 'center' | 'right' = 'left') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color);
        
        // Fix diacritics
        const fixedText = text
          .replace(/ă/g, 'a')
          .replace(/â/g, 'a')
          .replace(/î/g, 'i')
          .replace(/ș/g, 's')
          .replace(/ț/g, 't')
          .replace(/Ă/g, 'A')
          .replace(/Â/g, 'A')
          .replace(/Î/g, 'I')
          .replace(/Ș/g, 'S')
          .replace(/Ț/g, 'T');
        
        pdf.text(fixedText, x, y, { align });
      };
      
      // Helper function to format currency
      const formatCurrency = (amount: number) => {
        return `${amount.toFixed(2)} ${order.currency}`;
      };
      
      // Header background across full width
      const headerHeight = 30;
      pdf.setFillColor(56, 168, 165); // brand-info color
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');

      // White plate for logo (ensures white background under logo)
      if (logoData) {
        try {
          pdf.setFillColor(255, 255, 255);
          const plateX = margin - 2;
          const plateY = 4;
          const plateW = 30;
          const plateH = 22;
          // rounded rectangle under logo
          if ((pdf as any).roundedRect) {
            (pdf as any).roundedRect(plateX, plateY, plateW, plateH, 2, 2, 'F');
          } else {
            pdf.rect(plateX, plateY, plateW, plateH, 'F');
          }

          // Keep image aspect ratio and center it on the white plate
          let logoDrawW = 22;
          let logoDrawH = 18;
          try {
            const img = new Image();
            img.src = logoData;
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
            const naturalW = img.width || 1;
            const naturalH = img.height || 1;
            const aspect = naturalW / naturalH;
            const maxW = 22;
            const maxH = 18;
            if (maxW / maxH < aspect) {
              // Width constrained
              logoDrawW = maxW;
              logoDrawH = maxW / aspect;
            } else {
              // Height constrained
              logoDrawH = maxH;
              logoDrawW = maxH * aspect;
            }
          } catch {}

          const imgX = plateX + (plateW - logoDrawW) / 2;
          const imgY = plateY + (plateH - logoDrawH) / 2;
          pdf.addImage(logoData, 'PNG', imgX, imgY, logoDrawW, logoDrawH);
        } catch (error) {
          console.log('Error adding logo to PDF:', error);
        }
      }

      // Title centered in header
      addText('FACTURA FISCALA', pageWidth / 2, 18, 16, true, '#FFFFFF', 'center');

      // Start content after header
      currentY = headerHeight + 5;
      
      // Company info (left side) - better spacing and font sizes
      addText('FURNIZOR:', margin, currentY, 10, true);
      currentY += 6;
      addText(companyName, margin, currentY, 11, true);
      currentY += 6;
      addText(`CUI: ${companyCUI}`, margin, currentY, 9);
      currentY += 5;
      addText(`Nr. Reg. Com.: ${companyRegNo}`, margin, currentY, 9);
      currentY += 5;
      addText(`Capital social: ${companySocialCapital}`, margin, currentY, 9);
      currentY += 5;
      addText(`Adresa: ${companyAddress}`, margin, currentY, 9);
      currentY += 5;
      addText(`${companyCity}`, margin, currentY, 9);
      if (companyPhone) {
        currentY += 5;
        addText(`Tel: ${companyPhone}`, margin, currentY, 9);
      }
      currentY += 5;
      addText(`Email: ${companyEmail}`, margin, currentY, 9);
      const companyInfoEndY = currentY + 5; // Store where company info ends
      
      // Invoice details (right side) - better alignment
      const rightMargin = pageWidth - margin;
      const invoiceDetailsStartY = 35;
      let invoiceDetailsY = invoiceDetailsStartY;
      
      addText('FACTURA Nr.', rightMargin, invoiceDetailsY, 9, false, '#000000', 'right');
      invoiceDetailsY += 5;
      addText(order.id.slice(-8).toUpperCase(), rightMargin, invoiceDetailsY, 11, true, '#000000', 'right');
      invoiceDetailsY += 7;
      addText('Data emiterii:', rightMargin, invoiceDetailsY, 9, false, '#000000', 'right');
      invoiceDetailsY += 5;
      addText(formatDateForInvoice(order.createdAt), rightMargin, invoiceDetailsY, 10, true, '#000000', 'right');
      invoiceDetailsY += 7;
      addText('Scadenta:', rightMargin, invoiceDetailsY, 9, false, '#000000', 'right');
      invoiceDetailsY += 5;
      addText(formatDateForInvoice(order.createdAt), rightMargin, invoiceDetailsY, 10, true, '#000000', 'right');
      const invoiceDetailsEndY = invoiceDetailsY + 5; // Store where invoice details end
      
      // Calculate where customer section should start (after company info or invoice details, whichever is lower)
      const customerSectionStartY = Math.max(companyInfoEndY, invoiceDetailsEndY) + 8;
      
      // Customer info
      currentY = customerSectionStartY;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 7;
      
      addText('CUMPĂRĂTOR:', margin, currentY, 10, true);
      currentY += 6;
      if (user) {
        if (user.user_metadata?.full_name) {
          addText(user.user_metadata.full_name, margin, currentY, 10);
          currentY += 5;
        }
        addText(user.email || '', margin, currentY, 10);
        currentY += 5;
      }
      
      // Subscription details
      currentY += 5;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 7;
      
      const subscriptionName = orderSubscription?.tier?.displayName || 'Plan Pro';
      const subscriptionInterval = orderSubscription?.tier?.interval === 'MONTHLY' ? 'Lunar' : orderSubscription?.tier?.interval === 'YEARLY' ? 'Anual' : 'Lunar';
      addText('Servicii furnizate:', margin, currentY, 9, true);
      currentY += 5;
      addText(`Abonament ${subscriptionName} - ${subscriptionInterval}`, margin, currentY, 9);
      
      // Invoice table
      currentY += 10;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
      
      // Calculate column positions (distributed evenly across available width)
      const tableWidth = pageWidth - (margin * 2); // 180mm available
      const colNrCrt = margin + 3;
      const colDenumire = margin + 12;
      const colUM = margin + 100;
      const colCant = margin + 115;
      const colPretUnitar = margin + 135;
      const colValoare = rightMargin - 3;
      
      // Table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, currentY - 6, pageWidth - (margin * 2), 8, 'F');
      addText('Nr.', colNrCrt, currentY, 8, true);
      addText('Denumire produs/serviciu', colDenumire, currentY, 8, true);
      addText('U.M.', colUM, currentY, 8, true, '#000000', 'center');
      addText('Cant.', colCant, currentY, 8, true, '#000000', 'center');
      addText('Pret unitar', colPretUnitar, currentY, 8, true, '#000000', 'right');
      addText('Valoare', colValoare, currentY, 8, true, '#000000', 'right');
      currentY += 8;
      
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;
      
      // Invoice item - truncate description if too long to fit
      const description = `Abonament ${subscriptionName} - ${subscriptionInterval}`;
      const maxDescriptionWidth = colUM - colDenumire - 5; // Available width for description
      let displayDescription = description;
      if (description.length > 45) {
        displayDescription = description.substring(0, 42) + '...';
      }
      
      addText('1', colNrCrt, currentY, 9);
      addText(displayDescription, colDenumire, currentY, 9);
      addText('buc', colUM, currentY, 9, false, '#000000', 'center');
      addText('1', colCant, currentY, 9, false, '#000000', 'center');
      addText(formatCurrency(amountWithoutVAT), colPretUnitar, currentY, 9, false, '#000000', 'right');
      addText(formatCurrency(amountWithoutVAT), colValoare, currentY, 9, false, '#000000', 'right');
      currentY += 8;
      
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;
      
      // Totals section
      currentY += 3;
      const totalsX = pageWidth / 2;
      addText('Total fara TVA:', totalsX, currentY, 10, false, '#000000', 'right');
      addText(formatCurrency(amountWithoutVAT), rightMargin - 2, currentY, 10, false, '#000000', 'right');
      currentY += 7;
      addText(`TVA 19%:`, totalsX, currentY, 10, false, '#000000', 'right');
      addText(formatCurrency(vatAmount), rightMargin - 2, currentY, 10, false, '#000000', 'right');
      currentY += 7;
      
      pdf.setDrawColor(56, 168, 165);
      pdf.line(totalsX - 30, currentY, rightMargin, currentY);
      currentY += 8;
      
      addText('TOTAL DE PLATA:', totalsX, currentY, 12, true, '#000000', 'right');
      addText(formatCurrency(amountWithVAT), rightMargin - 2, currentY, 14, true, brandInfo, 'right');
      currentY += 8;
      
      pdf.setDrawColor(56, 168, 165);
      pdf.setLineWidth(0.5);
      pdf.line(totalsX - 30, currentY, rightMargin, currentY);
      
      // Payment status
      currentY += 12;
      const statusText = order.status === 'SUCCEEDED' ? 'Platita' : order.status === 'PENDING' ? 'In asteptare' : order.status === 'FAILED' ? 'Esuata' : 'Anulata';
      const statusColor = order.status === 'SUCCEEDED' ? '#10B981' : order.status === 'PENDING' ? '#F59E0B' : '#EF4444';
      addText(`Status plata: ${statusText}`, margin, currentY, 10, true, statusColor);
      
      // Footer
      currentY = pageHeight - 30;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
      
      addText('Conform art. 319 alin. (2) din Codul Fiscal, factura este valabila fara semnatura si stampila.', pageWidth / 2, currentY, 8, false, '#666666', 'center');
      currentY += 5;
      addText('Va multumim pentru abonare!', pageWidth / 2, currentY, 9, false, '#666666', 'center');
      currentY += 5;
      addText(`Pentru intrebari: ${companyEmail}`, pageWidth / 2, currentY, 8, false, '#999999', 'center');
      
      // Download PDF
      const fileName = `Factura_${order.id.slice(-8)}_${formatDateForInvoice(order.createdAt).replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast.success('Factura a fost descărcată cu succes');
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      toast.error('Eroare la generarea facturii');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Filter and format plans from API
  const plans = tiers
    .filter(tier => tier.isActive && tier.name !== 'free' && tier.interval === selectedInterval)
    .map(tier => ({
      ...tier,
      interval: tier.interval.toLowerCase() as 'monthly' | 'yearly',
      isPopular: tier.isPopular || false
    }))
    .sort((a, b) => a.price - b.price);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-info" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Subscription Header - Integrated Current Plan Info */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Abonamentul tău</h2>
        
        <p className="text-gray-600 mb-6">
          În prezent beneficiezi de planul{' '}
          <span className="font-semibold bg-gradient-to-r from-brand-info to-brand-accent text-white px-2 py-1 rounded-lg">
            {subscription?.tier?.displayName || 
             enhancedProfile?.profile?.activeSubscription?.tier?.displayName || 
             (enhancedProfile?.profile?.subscriptionTier === 'pro' ? 'Pro' : 'Trial Gratuit')}
          </span>
          <span className="font-semibold">
            {subscription?.status === 'ACTIVE' || enhancedProfile?.profile?.activeSubscription?.status === 'ACTIVE' ? ' (Activ)' : 
            enhancedProfile?.profile?.trialStatus?.isTrial ? ' (Trial)' : 
            hasPremiumAccess ? ' (Pro)' : ' (Trial)'}
          </span>
          {subscription?.currentPeriodEnd ? 
            `, valabil până la ${formatDate(subscription.currentPeriodEnd)}` :
            enhancedProfile?.profile?.activeSubscription?.currentPeriodEnd ?
              `, valabil până la ${formatDate(enhancedProfile.profile.activeSubscription.currentPeriodEnd)}` :
              enhancedProfile?.profile?.trialStatus?.isTrial && enhancedProfile.profile.trialStatus.trialEnd ?
                `, valabil până la ${formatDate(enhancedProfile.profile.trialStatus.trialEnd)}` :
                ''}
          .
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSubscriptionManagementClick}
            disabled={subscriptionSectionLoading}
            className={`inline-flex items-center px-6 py-2 text-base font-medium rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeSection === 'subscription'
                ? 'text-white bg-brand-info hover:bg-brand-highlight focus:ring-brand-info'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
            }`}
          >
            {subscriptionSectionLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Se actualizează...
              </>
            ) : (
              'Gestionează Abonamentul'
            )}
          </button>
          
          <button
            onClick={() => setActiveSection('billing')}
            className={`inline-flex items-center px-6 py-2 text-base font-medium rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              activeSection === 'billing'
                ? 'text-white bg-brand-info hover:bg-brand-highlight focus:ring-brand-info'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
            }`}
          >
            Vezi istoricul facturilor
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
        </div>
      </div>

      {/* Visual Separator */}
      <hr className="my-6 border-gray-200" />

      {/* Subscription Management Section */}
      {activeSection === 'subscription' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Alege un plan potrivit pentru tine
          </h3>

          {subscriptionSectionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-info mr-3" />
              <span className="text-lg text-gray-600">Se încarcă abonamentele...</span>
            </div>
          ) : tiers.length > 0 ? (
            <>
              {/* Toggle Switch - Pill Toggle Design */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gradient-to-r from-brand-info to-brand-highlight rounded-full p-1">
              <button
                onClick={() => setSelectedInterval('MONTHLY')}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedInterval === 'MONTHLY' 
                    ? 'bg-white text-brand-info shadow-sm' 
                    : 'bg-transparent text-white hover:text-gray-200'
                }`}
              >
                Lunar
              </button>
              <button
                onClick={() => setSelectedInterval('YEARLY')}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedInterval === 'YEARLY' 
                    ? 'bg-white text-brand-info shadow-sm' 
                    : 'bg-transparent text-white hover:text-gray-300'
                }`}
              >
                Anual
              </button>
            </div>
          </div>

          {selectedInterval === 'YEARLY' && (
            <div className="text-center mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Economisești 2 luni
              </span>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col min-h-full ${
                  plan.isPopular 
                    ? 'border-2 border-gradient-to-r from-brand-info to-brand-highlight border-brand-info shadow-lg bg-white' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-info to-brand-highlight text-white text-sm font-semibold">
                      Recomandat
                    </span>
                  </div>
                )}
                
                <div className="text-center flex-grow flex flex-col">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.displayName}
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-lg text-gray-600 ml-2">
                      lei/{plan.interval === 'monthly' ? 'lună' : 'lună'}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      TVA inclus
                    </div>
                    {plan.interval === 'yearly' && (
                      <div className="text-sm text-gray-500 mt-1">
                        Facturat anual ({Math.round(plan.price * 12)} lei/an)
                      </div>
                    )}
                    {plan.trialDays && plan.trialDays > 0 && !user && (
                      <div className="text-sm text-green-600 mt-1 font-medium">
                        + {plan.trialDays} zile trial gratuit
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-3 flex-grow">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-left">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Button at bottom */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={planLoading === plan.id}
                      className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-colors ease-in-out duration-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-brand-info to-brand-highlight text-white shadow-md hover:bg-gradient-to-r hover:from-brand-highlight hover:to-brand-accent'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-brand-highlight hover:to-brand-accent hover:border-transparent hover:text-white'
                      }`}
                    >
                      {planLoading === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        `Alege - ${plan.displayName}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nu există planuri disponibile</h4>
              <p className="text-gray-600">
                Momentan nu sunt planuri de abonament disponibile.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Billing History Section */}
      {activeSection === 'billing' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Istoricul facturilor
          </h3>
          
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand-info mr-3" />
              <span className="text-gray-600">Se încarcă facturile...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nu există facturi încă</h4>
              <p className="text-gray-600 mb-6">
                Când vei avea un abonament activ, facturile tale vor apărea aici.
              </p>
              <button
                onClick={() => setActiveSection('subscription')}
                className="inline-flex items-center px-6 py-2 text-base font-medium text-white bg-brand-info rounded-lg hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-brand-info transition-colors"
              >
                Alege un plan
              </button>
            </div>
          ) : (
            <TooltipProvider>
              <div className="space-y-3">
                {orders.map((order) => {
                  const orderSubscription = subscription || enhancedProfile?.profile?.activeSubscription;
                  
                  // Status configuration
                  let statusIcon;
                  let statusBgColor;
                  let statusTooltip;
                  let statusDescription;
                  
                  if (order.status === 'SUCCEEDED') {
                    statusIcon = <CheckCircle className="w-5 h-5 text-green-600" />;
                    statusBgColor = 'bg-green-100';
                    statusTooltip = 'Factură plătită';
                    statusDescription = 'Factura a fost plătită cu succes';
                  } else if (order.status === 'PENDING') {
                    statusIcon = <Clock className="w-5 h-5 text-yellow-600" />;
                    statusBgColor = 'bg-yellow-100';
                    statusTooltip = 'Factură în așteptare';
                    statusDescription = 'Factura este în așteptarea plății';
                  } else if (order.status === 'FAILED') {
                    statusIcon = <AlertCircle className="w-5 h-5 text-red-600" />;
                    statusBgColor = 'bg-red-100';
                    statusTooltip = 'Plată eșuată';
                    statusDescription = 'Plata facturii a eșuat';
                  } else {
                    statusIcon = <AlertCircle className="w-5 h-5 text-gray-600" />;
                    statusBgColor = 'bg-gray-100';
                    statusTooltip = 'Factură anulată';
                    statusDescription = 'Factura a fost anulată';
                  }
                  
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`w-10 h-10 ${statusBgColor} rounded-full flex items-center justify-center cursor-help`}>
                              {statusIcon}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-semibold">{statusTooltip}</p>
                              <p className="text-xs text-gray-400 mt-1">{statusDescription}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Factura #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {orderSubscription?.tier?.displayName || 'Plan Pro'} - {orderSubscription?.tier?.interval === 'MONTHLY' ? 'Lunar' : orderSubscription?.tier?.interval === 'YEARLY' ? 'Anual' : 'Lunar'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {statusTooltip}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {order.amount} {order.currency}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => generateInvoicePDF(order)}
                          disabled={downloadingInvoice === order.id}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-info bg-white border border-brand-info rounded-lg hover:bg-brand-info hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-info transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Descarcă factura"
                        >
                          {downloadingInvoice === order.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Se generează...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Descarcă
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
}
