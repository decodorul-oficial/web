'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import { Subscription, SubscriptionTier, Order, BillingDetails } from '@/features/subscription/types';
import { AlertCircle, CheckCircle, Clock, Loader2, Check, Download, FileText, CreditCard, History, XCircle, ChevronRight, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { BillingDetailsForm } from './BillingDetailsForm';
import { ROBOTO_REGULAR_URL } from '@/lib/fonts';

export function SubscriptionManager() {
  const { user, hasPremiumAccess } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [enhancedProfile, setEnhancedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [planLoading, setPlanLoading] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'subscription' | 'billing' | 'billing_details'>('subscription');
  const [subscriptionSectionLoading, setSubscriptionSectionLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  
  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Checkout/Billing Confirmation State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<SubscriptionTier | null>(null);

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

      // Smart Tab Switching
      const activeSub = subscriptionData || profileData?.profile?.activeSubscription;
      if (activeSub && activeSub.status === 'ACTIVE') {
        const currentInterval = activeSub.tier?.interval || (activeSub.tier as any)?.name?.includes('year') ? 'YEARLY' : 'MONTHLY';
        if (currentInterval === 'MONTHLY') {
            setSelectedInterval('YEARLY');
        } else if (currentInterval === 'YEARLY') {
            setSelectedInterval('MONTHLY');
        }
      }

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

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!subscription) return;

    try {
      setCancelling(true);
      setShowCancelModal(false);
      
      await subscriptionService.cancelSubscription({
        subscriptionId: subscription.id,
        immediate: false,
        refund: false,
        reason: cancelReason || 'Utilizator a solicitat anularea'
      });

      toast.success('Abonamentul a fost anulat cu succes');
      const updatedSubscription = await subscriptionService.getMySubscription();
      setSubscription(updatedSubscription);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Eroare la anularea abonamentului');
    } finally {
      setCancelling(false);
      setCancelReason('');
    }
  };

  const handleSubscriptionManagementClick = async () => {
    setActiveSection('subscription');
    setSubscriptionSectionLoading(true);
    await loadData();
    setSubscriptionSectionLoading(false);
  };

  const handleInitiateCheckout = (tier: SubscriptionTier) => {
      setSelectedTierForCheckout(tier);
      setShowCheckoutModal(true);
  };

  const getPrimaryBillingDetails = (): BillingDetails | undefined => {
      const details = enhancedProfile?.profile?.billingDetails;
      if (Array.isArray(details) && details.length > 0) {
          return details[0]; 
      }
      return undefined;
  };

  const handleConfirmAndPay = async () => {
    if (!user || !selectedTierForCheckout) return;

    const billingDetails = getPrimaryBillingDetails();
    if (!billingDetails || !billingDetails.address || !billingDetails.city) {
        toast.error('Datele de facturare sunt incomplete.');
        return; 
    }

    try {
      setPlanLoading(selectedTierForCheckout.id);
      setShowCheckoutModal(false); 
      
      const billingAddress = {
        firstName: billingDetails.firstName,
        lastName: billingDetails.lastName,
        address: billingDetails.address,
        city: billingDetails.city,
        country: billingDetails.country || 'RO',
        zipCode: billingDetails.zipCode || '000000'
      };

      const checkoutSession = await subscriptionService.startNetopiaCheckout(
        selectedTierForCheckout.id,
        user.email || '',
        billingAddress
      );

      window.location.href = checkoutSession.checkoutUrl;
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast.error('Eroare la inițierea procesului de plată.');
      setPlanLoading(null);
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

  // Helper to load font
  const loadFont = async () => {
      try {
          const response = await fetch(ROBOTO_REGULAR_URL);
          if (!response.ok) throw new Error('Failed to load font');
          const buffer = await response.arrayBuffer();
          // Convert to base64
          let binary = '';
          const bytes = new Uint8Array(buffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
          }
          return window.btoa(binary);
      } catch (e) {
          console.error('Font load error:', e);
          return null;
      }
  }

  const generateInvoicePDF = async (order: Order) => {
    setDownloadingInvoice(order.id);
    try {
      // Load custom font to support Romanian diacritics
      const fontBase64 = await loadFont();

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      if (fontBase64) {
          // Add font to jsPDF
          pdf.addFileToVFS("Roboto-Regular.ttf", fontBase64);
          pdf.addFont("Roboto-Regular.ttf", "Roboto", "normal");
          pdf.setFont("Roboto"); // Set as default
      } else {
          console.warn("Using default font, diacritics may be broken");
      }

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 15;
      
      let currentY = margin;
      
      const orderSubscription = subscription || enhancedProfile?.profile?.activeSubscription;
      
      // Company data
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
      
      // Amounts
      const VAT_RATE = 0.19;
      const amountWithVAT = order.amount;
      const amountWithoutVAT = amountWithVAT / (1 + VAT_RATE);
      const vatAmount = amountWithVAT - amountWithoutVAT;
      
      const brandInfo = '#38a8a5';
      
      // Helper function to add text
      const addText = (text: string, x: number, y: number, fontSize: number, isBold: boolean = false, color: string = '#000000', align: 'left' | 'center' | 'right' = 'left', maxWidth?: number) => {
        pdf.setFontSize(fontSize);
        // If we loaded Roboto, we use it. 'bold' might need separate font file, so we stick to normal or simulate bold if supported, 
        // OR we just use normal but larger size for visual weight if bold font not loaded.
        // jsPDF can simulate bold via 'bold' if font mapped, but we only loaded Regular.
        // So 'bold' might revert to default font if we are strict. 
        // We will stick to "Roboto" normal for everything if bold not available, or use default font for bold parts (titles) if they don't have diacritics.
        // But titles like "CUMPĂRĂTOR" have diacritics.
        // We will use "Roboto" for everything to be safe with diacritics.
        
        if (fontBase64) {
            pdf.setFont("Roboto", "normal"); 
            // If we want bold-ish, we can set stroke width slightly? No, that's complex.
            // Just use size for hierarchy.
        } else {
            pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        }
        
        pdf.setTextColor(color);
        
        // If we have custom font, we DON'T strip diacritics.
        // If we don't, we strip them.
        let finalText = text;
        if (!fontBase64) {
             finalText = text
              .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't')
              .replace(/Ă/g, 'A').replace(/Â/g, 'A').replace(/Î/g, 'I').replace(/Ș/g, 'S').replace(/Ț/g, 'T');
        }

        if (maxWidth) {
            const lines = pdf.splitTextToSize(finalText, maxWidth);
            pdf.text(lines, x, y, { align });
            return lines.length * (fontSize * 0.3527 * 1.2); // approx height in mm
        } else {
            pdf.text(finalText, x, y, { align });
            return fontSize * 0.3527;
        }
      };
      
      // Format Currency
      const formatCurrency = (amount: number) => {
        return `${amount.toFixed(2)} ${order.currency}`;
      };
      
      // Header
      const headerHeight = 30;
      pdf.setFillColor(56, 168, 165); 
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');

      if (logoData) {
        try {
          pdf.setFillColor(255, 255, 255);
          const plateX = margin - 2;
          const plateY = 4;
          const plateW = 30;
          const plateH = 22;
          if ((pdf as any).roundedRect) {
            (pdf as any).roundedRect(plateX, plateY, plateW, plateH, 2, 2, 'F');
          } else {
            pdf.rect(plateX, plateY, plateW, plateH, 'F');
          }

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
              logoDrawW = maxW;
              logoDrawH = maxW / aspect;
            } else {
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

      addText('FACTURA FISCALA', pageWidth / 2, 18, 16, true, '#FFFFFF', 'center');

      currentY = headerHeight + 5;
      
      // Supplier
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
      // Address wrapping
      const addrHeight = addText(`Adresa: ${companyAddress}`, margin, currentY, 9, false, '#000000', 'left', 90);
      currentY += addrHeight ? addrHeight + 2 : 5;
      
      addText(`${companyCity}`, margin, currentY, 9);
      if (companyPhone) {
        currentY += 5;
        addText(`Tel: ${companyPhone}`, margin, currentY, 9);
      }
      currentY += 5;
      addText(`Email: ${companyEmail}`, margin, currentY, 9);
      const companyInfoEndY = currentY + 5; 
      
      // Invoice Info
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
      const invoiceDetailsEndY = invoiceDetailsY + 5; 
      
      const customerSectionStartY = Math.max(companyInfoEndY, invoiceDetailsEndY) + 8;
      
      // Customer
      currentY = customerSectionStartY;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 7;
      
      addText('CUMPĂRĂTOR:', margin, currentY, 10, true);
      currentY += 6;

      const billingDetails = getPrimaryBillingDetails();

      if (billingDetails) {
        if (billingDetails.type === 'company' && billingDetails.companyName) {
           addText(billingDetails.companyName, margin, currentY, 10);
           currentY += 5;
           addText(`CUI: ${billingDetails.cui || '-'}`, margin, currentY, 10);
           currentY += 5;
           addText(`Reg. Com: ${billingDetails.regCom || '-'}`, margin, currentY, 10);
           currentY += 5;
        } else {
           addText(`${billingDetails.firstName} ${billingDetails.lastName}`, margin, currentY, 10);
           currentY += 5;
        }
        
        // Wrap address text properly
        // Combined address string
        const fullAddressStr = `${billingDetails.address}, ${billingDetails.city}, ${billingDetails.county}, ${billingDetails.country || ''} ${billingDetails.zipCode || ''}`;
        
        // Use splitTextToSize for auto-wrapping
        // Max width = page width - 2*margin
        const maxTextWidth = pageWidth - 2 * margin;
        
        // Manually handle wrapping via addText helper which uses splitTextToSize
        const addedHeight = addText(fullAddressStr, margin, currentY, 10, false, '#000000', 'left', maxTextWidth);
        currentY += addedHeight + 2; 
        
      } else if (user) {
        if (user.user_metadata?.full_name) {
          addText(user.user_metadata.full_name, margin, currentY, 10);
          currentY += 5;
        }
        addText(user.email || '', margin, currentY, 10);
        currentY += 5;
      }
      
      // Services
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
      
      // Table
      currentY += 10;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
      
      const colNrCrt = margin + 3;
      const colDenumire = margin + 12;
      const colUM = margin + 100;
      const colCant = margin + 115;
      const colPretUnitar = margin + 135;
      const colValoare = rightMargin - 3;
      
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
      
      const description = `Abonament ${subscriptionName} - ${subscriptionInterval}`;
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
      
      // Totals
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
      
      currentY += 12;
      const statusText = order.status === 'SUCCEEDED' ? 'Platita' : order.status === 'PENDING' ? 'In asteptare' : order.status === 'FAILED' ? 'Esuata' : 'Anulata';
      const statusColor = order.status === 'SUCCEEDED' ? '#10B981' : order.status === 'PENDING' ? '#F59E0B' : '#EF4444';
      addText(`Status plata: ${statusText}`, margin, currentY, 10, true, statusColor);
      
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

  const plans = tiers
    .filter(tier => tier.isActive && tier.name !== 'free' && tier.interval === selectedInterval)
    .map(tier => ({
      ...tier,
      interval: tier.interval, // Keep original interval type
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

  const isActivePlan = (tierId: string) => {
     const activeSub = subscription || enhancedProfile?.profile?.activeSubscription;
     if (!activeSub || activeSub.status !== 'ACTIVE') return false;
     return activeSub.tier?.id === tierId || (activeSub.tier as any)?.name === tierId;
  };

  const primaryBillingDetails = getPrimaryBillingDetails();

  return (
    <div className="space-y-8">
      {/* ... rest of the component remains exactly the same ... */}
      {/* For brevity, I'm not repeating the full render block if it wasn't changed, 
          but the tool expects the FULL file content.
          I will paste the full content again to ensure integrity. 
      */}
      {/* Subscription Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Abonamentul tău</h2>
                <p className="text-gray-600">
                În prezent beneficiezi de planul{' '}
                <span className="font-semibold bg-gradient-to-r from-brand-info to-brand-accent text-white px-2 py-1 rounded-lg text-sm">
                    {subscription?.tier?.displayName || 
                    enhancedProfile?.profile?.activeSubscription?.tier?.displayName || 
                    (enhancedProfile?.profile?.subscriptionTier === 'pro' ? 'Pro' : 'Trial Gratuit')}
                </span>
                <span className="font-semibold text-sm ml-1">
                    {subscription?.status === 'ACTIVE' || enhancedProfile?.profile?.activeSubscription?.status === 'ACTIVE' ? '(Activ)' : 
                    enhancedProfile?.profile?.trialStatus?.isTrial ? '(Trial)' : 
                    hasPremiumAccess ? '(Pro)' : '(Trial)'}
                </span>
                {subscription?.currentPeriodEnd && (
                    <span className="text-sm ml-1 text-gray-500">
                     • Valabil până la {formatDate(subscription.currentPeriodEnd)}
                    </span>
                )}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={handleSubscriptionManagementClick}
            disabled={subscriptionSectionLoading}
            className={`flex items-center justify-center px-4 py-3 rounded-xl border transition-all duration-200 group ${
              activeSection === 'subscription'
                ? 'bg-brand-info text-white border-brand-info shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-brand-info hover:shadow-sm'
            }`}
          >
             <CreditCard className={`w-5 h-5 mr-3 ${activeSection === 'subscription' ? 'text-white' : 'text-brand-info group-hover:scale-110 transition-transform'}`} />
             <span className="font-medium">Planuri & Tarife</span>
          </button>

           <button
            onClick={() => setActiveSection('billing_details')}
            className={`flex items-center justify-center px-4 py-3 rounded-xl border transition-all duration-200 group ${
              activeSection === 'billing_details'
                ? 'bg-brand-info text-white border-brand-info shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-brand-info hover:shadow-sm'
            }`}
          >
            <FileText className={`w-5 h-5 mr-3 ${activeSection === 'billing_details' ? 'text-white' : 'text-brand-info group-hover:scale-110 transition-transform'}`} />
            <span className="font-medium">Date Facturare</span>
          </button>
          
          <button
            onClick={() => setActiveSection('billing')}
            className={`flex items-center justify-center px-4 py-3 rounded-xl border transition-all duration-200 group ${
              activeSection === 'billing'
                ? 'bg-brand-info text-white border-brand-info shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-brand-info hover:shadow-sm'
            }`}
          >
            <History className={`w-5 h-5 mr-3 ${activeSection === 'billing' ? 'text-white' : 'text-brand-info group-hover:scale-110 transition-transform'}`} />
            <span className="font-medium">Istoric Plăți</span>
          </button>

          {subscription?.status === 'ACTIVE' && !subscription?.cancelAtPeriodEnd ? (
            <button
              onClick={handleCancelClick}
              disabled={cancelling}
              className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200 group"
            >
              {cancelling ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Anulează</span>
                </>
              )}
            </button>
          ) : (
             <div className="hidden md:block"></div> 
          )}
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      {activeSection === 'billing_details' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
            Date Facturare
            </h3>
            <p className="text-gray-600 mb-6">
                Completează datele de facturare pentru a apărea corect pe facturile fiscale. Aceste date sunt <strong>obligatorii</strong> pentru emiterea facturii la achiziționarea unui abonament.
            </p>
            <BillingDetailsForm 
                initialData={enhancedProfile?.profile?.billingDetails} 
                onSuccess={(data) => {
                    loadData(); 
                }}
            />
        </div>
      )}

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

          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => {
              const isCurrent = isActivePlan(plan.id);
              
              return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 shadow-sm transition-all duration-300 flex flex-col min-h-full ${
                  isCurrent
                     ? 'border-2 border-brand-info bg-brand-info/5'
                     : plan.isPopular 
                        ? 'border-2 border-brand-info bg-white shadow-md hover:shadow-lg' 
                        : 'border border-gray-200 bg-white hover:shadow-lg'
                }`}
              >
                {plan.isPopular && !isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-info to-brand-highlight text-white text-sm font-semibold">
                      Recomandat
                    </span>
                  </div>
                )}

                {isCurrent && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-info text-white text-sm font-semibold shadow-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Plan Activ
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
                      lei/{plan.interval === 'MONTHLY' ? 'lună' : 'lună'}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      TVA inclus
                    </div>
                    {plan.interval === 'YEARLY' && (
                      <div className="text-sm text-gray-500 mt-1">
                        Facturat anual ({Math.round(plan.price * 12)} lei/an)
                      </div>
                    )}
                    {plan.trialDays && plan.trialDays > 0 && !user && (
                      <div className="text-sm text-brand-info mt-1 font-medium">
                        + {plan.trialDays} zile trial gratuit
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-3 flex-grow">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start text-sm text-gray-600">
                        <Check className={`w-4 h-4 ${isCurrent ? 'text-brand-info' : 'text-brand-info'} mr-3 flex-shrink-0 mt-0.5`} />
                        <span className="text-left">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-auto">
                    <button
                      onClick={() => handleInitiateCheckout(plan)}
                      disabled={isCurrent || planLoading === plan.id}
                      className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ease-in-out duration-600 disabled:opacity-70 disabled:cursor-not-allowed ${
                        isCurrent 
                            ? 'bg-brand-info/10 text-brand-info border-transparent cursor-default'
                            : plan.isPopular
                                ? 'bg-gradient-to-r from-brand-info to-brand-highlight text-white shadow-md hover:bg-gradient-to-r hover:from-brand-highlight hover:to-brand-accent focus:ring-brand-info'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-brand-highlight hover:to-brand-accent hover:border-transparent hover:text-white focus:ring-brand-info'
                      }`}
                    >
                      {planLoading === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Se procesează...
                        </>
                      ) : isCurrent ? (
                        <>
                             <Check className="w-5 h-5 mr-2" />
                             Abonament Activ
                        </>
                      ) : (
                        `Alege - ${plan.displayName}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )})}
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

      {showCheckoutModal && selectedTierForCheckout && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={() => setShowCheckoutModal(false)}>
                    <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-6 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <CreditCard className="w-6 h-6 mr-2 text-brand-info" />
                                Confirmare Comandă
                            </h3>
                            <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Produs:</span>
                                <span className="font-semibold text-gray-900">{selectedTierForCheckout.displayName} ({selectedTierForCheckout.interval === 'MONTHLY' ? 'Lunar' : 'Anual'})</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total de plată:</span>
                                <span className="text-xl font-bold text-brand-info">{selectedTierForCheckout.price} LEI <span className="text-xs font-normal text-gray-500">(TVA inclus)</span></span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Date Facturare
                                </h4>
                                {primaryBillingDetails?.address && (
                                    <button 
                                        onClick={() => {
                                            setShowCheckoutModal(false);
                                            setActiveSection('billing_details');
                                        }}
                                        className="text-sm text-brand-info hover:text-brand-highlight flex items-center"
                                    >
                                        <Edit2 className="w-3 h-3 mr-1" />
                                        Modifică
                                    </button>
                                )}
                            </div>

                            {primaryBillingDetails?.address ? (
                                <div className="border border-gray-200 rounded-lg p-4 text-sm text-gray-700 bg-white">
                                    {primaryBillingDetails.type === 'company' ? (
                                        <>
                                            <p className="font-semibold">{primaryBillingDetails.companyName}</p>
                                            <p>CUI: {primaryBillingDetails.cui}</p>
                                            <p>Reg. Com: {primaryBillingDetails.regCom}</p>
                                        </>
                                    ) : (
                                        <p className="font-semibold">{primaryBillingDetails.firstName} {primaryBillingDetails.lastName}</p>
                                    )}
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p>{primaryBillingDetails.address}</p>
                                        <p>{primaryBillingDetails.city}, {primaryBillingDetails.county}</p>
                                        <p>{primaryBillingDetails.country} {primaryBillingDetails.zipCode}</p>
                                    </div>
                                    <div className="mt-3 p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                                        <p>⚠ Te rugăm să verifici datele. Factura va fi emisă automat pe aceste date și nu poate fi modificată ulterior.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-red-200 rounded-lg p-6 text-center bg-red-50">
                                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-red-700 font-medium mb-2">Datele de facturare lipsesc!</p>
                                    <p className="text-sm text-gray-600 mb-4">Conform legislației, avem nevoie de datele tale pentru a emite factura.</p>
                                    <button
                                        onClick={() => {
                                            setShowCheckoutModal(false);
                                            setActiveSection('billing_details');
                                        }}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-info rounded-lg hover:bg-brand-highlight"
                                    >
                                        Completează Datele Acum
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                            <button
                                onClick={handleConfirmAndPay}
                                disabled={!primaryBillingDetails?.address || !!planLoading}
                                className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-100"
                            >
                                {planLoading === selectedTierForCheckout.id ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Se procesează...
                                    </>
                                ) : (
                                    <>
                                        Confirmă și Plătește
                                        <ChevronRight className="w-5 h-5 ml-1" />
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowCheckoutModal(false)}
                                disabled={!!planLoading}
                                className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Anulează
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={() => setShowCancelModal(false)}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Anulare Abonament
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Ești sigur că vrei să anulezi abonamentul? Vei păstra accesul până la sfârșitul perioadei curente.
                                    </p>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ne poți spune de ce renunți? (Opțional)
                                    </label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full shadow-sm focus:ring-brand-info focus:border-brand-info sm:text-sm border-gray-300 rounded-md"
                                        rows={3}
                                        placeholder="Feedback-ul tău ne ajută să îmbunătățim serviciul..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleConfirmCancel}
                            disabled={cancelling}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            {cancelling ? 'Se anulează...' : 'Confirmă Anularea'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCancelModal(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Renunță
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
