import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { netopiaLogger, logWebhookSuccess, logWebhookError, logProcessingError } from '@/lib/payment/netopiaLogger';

// Configurare Supabase pentru log-uri
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Success Redirect URL pentru Netopia
 * 
 * Acest endpoint este apelat când utilizatorul este redirecționat înapoi
 * în aplicație după finalizarea plății pe platforma Netopia.
 * 
 * Documentație Netopia: https://doc.netopia-payments.com/docs/payment-sdks/nodejs/
 */
export async function GET(request: NextRequest) {
  const timer = netopiaLogger.startTimer();
  const startTime = new Date().toISOString();
  
  console.log('[Netopia Success Redirect] Received redirect at:', startTime);
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Extrage parametrii din URL
    const orderId = searchParams.get('orderId') || searchParams.get('order_id');
    const status = searchParams.get('status') || searchParams.get('payment_status');
    const transactionId = searchParams.get('transactionId') || searchParams.get('transaction_id');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency') || 'RON';
    const errorCode = searchParams.get('errorCode') || searchParams.get('error_code');
    const errorMessage = searchParams.get('errorMessage') || searchParams.get('error_message');

    console.log('[Netopia Success Redirect] Extracted parameters:', {
      orderId,
      status,
      transactionId,
      amount,
      currency,
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString()
    });

    // Validează că avem orderId
    if (!orderId) {
      console.error('[Netopia Success Redirect] Missing orderId in redirect parameters');
      
      // Log error pentru audit
      await logProcessingError({
        errorType: 'validation',
        errorMessage: 'Missing orderId in redirect parameters',
        context: netopiaLogger.createContext({
          searchParams: Object.fromEntries(searchParams.entries()),
          url: request.url
        }),
        severity: 'high'
      });

      return NextResponse.redirect(
        new URL(`/payment/result?error=missing_order_id&timestamp=${Date.now()}`, request.url)
      );
    }

    // Log-uri pentru audit
    await logRedirectEvent({
      orderId,
      status,
      transactionId,
      amount,
      currency,
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString()
    });

    // Procesează redirect-ul în funcție de status
    const redirectResult = await processRedirect({
      orderId,
      status,
      transactionId,
      amount,
      currency,
      errorCode,
      errorMessage
    });

    const processingTime = timer();
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (redirectResult.success) {
      console.log('[Netopia Success Redirect] Redirect processed successfully:', {
        orderId,
        status,
        redirectUrl: redirectResult.redirectUrl,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      });

      // Log success pentru audit
      await logWebhookSuccess({
        orderId,
        webhookType: 'netopia_success_redirect',
        status: status || 'unknown',
        transactionId: transactionId || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        currency,
        rawData: Object.fromEntries(searchParams.entries()),
        clientIP: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent,
        processingTimeMs: processingTime
      });

      return NextResponse.redirect(redirectResult.redirectUrl!);
    } else {
      console.error('[Netopia Success Redirect] Redirect processing failed:', {
        orderId,
        error: redirectResult.error,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      });

      // Log error pentru audit
      await logWebhookError({
        orderId,
        webhookType: 'netopia_success_redirect',
        status: status || 'unknown',
        errorMessage: redirectResult.error,
        rawData: Object.fromEntries(searchParams.entries()),
        clientIP: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent,
        processingTimeMs: processingTime
      });

      return NextResponse.redirect(
        new URL(`/payment/result?error=processing_failed&orderId=${orderId}&timestamp=${Date.now()}`, request.url)
      );
    }

  } catch (error) {
    const processingTime = timer();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Netopia Success Redirect] Unexpected error:', {
      error: errorMessage,
      stack: errorStack,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString()
    });

    // Log error critic pentru audit
    await logProcessingError({
      errorType: 'processing',
      errorMessage,
      errorStack,
      context: netopiaLogger.createContext({
        processingTimeMs: processingTime,
        errorType: 'unexpected_error',
        url: request.url
      }),
      severity: 'critical'
    });

    return NextResponse.redirect(
      new URL(`/payment/result?error=unexpected_error&timestamp=${Date.now()}`, request.url)
    );
  }
}

/**
 * Procesează redirect-ul și determină URL-ul de destinație
 */
async function processRedirect({
  orderId,
  status,
  transactionId,
  amount,
  currency,
  errorCode,
  errorMessage
}: {
  orderId: string;
  status: string | null;
  transactionId: string | null;
  amount: string | null;
  currency: string;
  errorCode: string | null;
  errorMessage: string | null;
}) {
  try {
    console.log('[Netopia Success Redirect] Processing redirect:', {
      orderId,
      status,
      transactionId,
      amount,
      currency,
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString()
    });

    // Mapează statusurile Netopia la statusurile noastre
    const statusMapping: Record<string, string> = {
      'confirmed': 'success',
      'paid': 'success',
      'pending': 'pending',
      'cancelled': 'cancelled',
      'failed': 'failed',
      'error': 'error'
    };

    const mappedStatus = statusMapping[status?.toLowerCase() || ''] || 'pending';

    console.log('[Netopia Success Redirect] Status mapping:', {
      originalStatus: status,
      mappedStatus,
      timestamp: new Date().toISOString()
    });

    // Construiește URL-ul de redirect cu parametrii necesari
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro';
    const redirectUrl = new URL('/payment/result', baseUrl);
    
    // Adaugă parametrii necesari pentru pagina de rezultat
    redirectUrl.searchParams.set('orderId', orderId);
    redirectUrl.searchParams.set('status', mappedStatus);
    
    if (transactionId) {
      redirectUrl.searchParams.set('transactionId', transactionId);
    }
    
    if (amount) {
      redirectUrl.searchParams.set('amount', amount);
    }
    
    if (currency) {
      redirectUrl.searchParams.set('currency', currency);
    }
    
    if (errorCode) {
      redirectUrl.searchParams.set('errorCode', errorCode);
    }
    
    if (errorMessage) {
      redirectUrl.searchParams.set('errorMessage', errorMessage);
    }

    // Adaugă timestamp pentru cache busting
    redirectUrl.searchParams.set('timestamp', Date.now().toString());

    console.log('[Netopia Success Redirect] Generated redirect URL:', {
      orderId,
      redirectUrl: redirectUrl.toString(),
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      redirectUrl: redirectUrl.toString()
    };

  } catch (error) {
    console.error('[Netopia Success Redirect] Error processing redirect:', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Loghează evenimentul de redirect pentru audit
 */
async function logRedirectEvent({
  orderId,
  status,
  transactionId,
  amount,
  currency,
  errorCode,
  errorMessage,
  timestamp
}: {
  orderId: string;
  status: string | null;
  transactionId: string | null;
  amount: string | null;
  currency: string;
  errorCode: string | null;
  errorMessage: string | null;
  timestamp: string;
}) {
  try {
    // Log prin RPC (schema payments) – non-blocking
    const payload = [{
      order_id: orderId,
      webhook_type: 'netopia_success_redirect',
      status: status || 'unknown',
      transaction_id: transactionId || undefined,
      amount: amount ? parseFloat(amount) : null,
      currency,
      error_code: errorCode || undefined,
      error_message: errorMessage || undefined,
      processed_at: timestamp
    }];

    const { error } = await supabase.rpc('webhook_processing', {
      payload: { type: 'webhook_logs', entries: payload }
    });

    if (error) {
      console.error('[Netopia Success Redirect] Error logging redirect event:', {
        orderId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('[Netopia Success Redirect] Redirect event logged successfully:', {
        orderId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[Netopia Success Redirect] Error in logRedirectEvent:', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Suport pentru POST requests (în cazul în care Netopia trimite POST)
export async function POST(request: NextRequest) {
  console.log('[Netopia Success Redirect] Received POST request, redirecting to GET');
  return GET(request);
}
