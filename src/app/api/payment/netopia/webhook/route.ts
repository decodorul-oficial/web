import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateNetopiaWebhook } from '@/lib/payment/netopiaValidation';
import { netopiaLogger, logWebhookSuccess, logWebhookError, logProcessingError } from '@/lib/payment/netopiaLogger';

// Configurare Supabase pentru log-uri și actualizări
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Webhook IPN (Instant Payment Notification) pentru Netopia
 * 
 * Acest endpoint primește notificări despre starea tranzacțiilor de la Netopia
 * și actualizează starea comenzilor în sistemul nostru.
 * 
 * Documentație Netopia: https://doc.netopia-payments.com/docs/payment-sdks/nodejs/
 */
export async function POST(request: NextRequest) {
  const timer = netopiaLogger.startTimer();
  const startTime = new Date().toISOString();
  
  console.log('[Netopia Webhook IPN] Received notification at:', startTime);
  
  try {
    // Parsează datele primite de la Netopia în mod robust (acceptă mai multe Content-Type)
    const contentType = request.headers.get('content-type') || '';
    const allHeaders = Object.fromEntries(request.headers);
    let webhookData: Record<string, unknown> = {};
    let rawBodyText = '';

    try {
      if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        webhookData = Object.fromEntries(formData.entries());
      } else if (contentType.includes('application/json')) {
        webhookData = await request.json();
      } else {
        // Fallback: citește ca text și încearcă să parsezi urlencoded; dacă nu iese, lasă ca text brut într-un câmp
        rawBodyText = await request.text();
        try {
          const params = new URLSearchParams(rawBodyText);
          webhookData = Object.fromEntries(params.entries());
        } catch {
          webhookData = { _raw: rawBodyText };
        }
      }
    } catch (parseErr) {
      rawBodyText = rawBodyText || (await request.text().catch(() => ''));
      const parseErrorMessage = parseErr instanceof Error ? parseErr.message : 'Unknown error';
      console.error('[Netopia Webhook IPN] Body parse error', {
        contentType,
        rawBodyLength: rawBodyText.length,
        error: parseErrorMessage,
        timestamp: new Date().toISOString()
      });
      // Log pentru audit, inclusiv corpul brut (trunchiat dacă e prea mare)
      try {
        const truncatedRaw = rawBodyText.length > 4000 ? rawBodyText.slice(0, 4000) + '...[truncated]' : rawBodyText;
        await logProcessingError({
          errorType: 'processing',
          errorMessage: 'Invalid request body: ' + parseErrorMessage,
          errorStack: parseErr instanceof Error ? parseErr.stack : undefined,
          context: netopiaLogger.createContext({
            contentType,
            rawBodyLength: rawBodyText.length,
            rawBodyPreview: truncatedRaw
          }),
          severity: 'high'
        });
      } catch {}
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Log de diagnostic pentru a urmări ce am primit efectiv
    console.log('[Netopia Webhook IPN] Incoming request meta:', {
      contentType,
      headerNames: Object.keys(allHeaders),
      rawBodyLength: rawBodyText ? rawBodyText.length : undefined,
      parsedKeys: Object.keys(webhookData || {}),
      hasData: webhookData && Object.keys(webhookData).length > 0,
      timestamp: new Date().toISOString()
    });

    // Validează că avem date de procesat
    if (!webhookData || Object.keys(webhookData).length === 0) {
      console.error('[Netopia Webhook IPN] No data received in webhook');
      return NextResponse.json(
        { error: 'No data received' }, 
        { status: 400 }
      );
    }

    // Obține IP-ul clientului pentru validare
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Validează webhook-ul pentru securitate
    const validation = validateNetopiaWebhook(webhookData, clientIP, {
      secretKey: process.env.NETOPIA_WEBHOOK_SECRET,
      allowedIPs: process.env.NETOPIA_ALLOWED_IPS?.split(',') || [],
      validateTimestamp: true,
      maxAgeSeconds: 300 // 5 minute
    });

    if (!validation.isValid) {
      console.error('[Netopia Webhook IPN] Webhook validation failed:', {
        error: validation.error,
        clientIP,
        timestamp: new Date().toISOString()
      });

      // Log error pentru audit
      await logProcessingError({
        errorType: 'validation',
        errorMessage: validation.error || 'Webhook validation failed',
        context: netopiaLogger.createContext({
          clientIP,
          webhookData: Object.keys(webhookData),
          validationError: validation.error
        }),
        severity: 'high'
      });

      return NextResponse.json(
        { error: 'Webhook validation failed', details: validation.error }, 
        { status: 401 }
      );
    }

    console.log('[Netopia Webhook IPN] Webhook validation successful');

    // Log-uri pentru debugging
    console.log('[Netopia Webhook IPN] Processing webhook data:', {
      data: webhookData,
      timestamp: new Date().toISOString()
    });

    // Extrage informațiile relevante din webhook (suportă structură nested a Netopia)
    const getNested = (obj: any, paths: string[]): any => {
      for (const path of paths) {
        const value = path.split('.').reduce((acc: any, key: string) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
        if (value !== undefined && value !== null && value !== '') return value;
      }
      return undefined;
    };

    const extracted = {
      orderId: getNested(webhookData, ['orderId', 'order_id', 'order.orderID', 'order.orderId', 'order.data.orderID']),
      status: getNested(webhookData, ['status', 'payment_status', 'payment.status', 'payment.message', 'payment.code']),
      transactionId: getNested(webhookData, ['transactionId', 'transaction_id', 'payment.ntpID', 'payment.data.tranId']),
      amount: getNested(webhookData, ['amount', 'payment.amount']),
      currency: getNested(webhookData, ['currency', 'payment.currency']) || 'RON'
    };

    // Map numeric/status Netopia -> string status intern preliminar
    const normalizeStatus = (raw: any): string => {
      if (raw === undefined || raw === null) return '';
      const s = String(raw).toLowerCase();
      // Cazuri cunoscute Netopia
      // payment.status poate fi numeric: 3 = paid/approved (în practică)
      if (!isNaN(Number(s))) {
        const code = Number(s);
        if (code === 3) return 'paid';
        if (code === 2) return 'confirmed';
        if (code === 1) return 'pending';
        if (code === 0) return 'pending';
      }
      if (s === '00' || s === '0') return 'paid';
      if (s.includes('approved')) return 'paid';
      if (s.includes('confirm')) return 'confirmed';
      if (s.includes('paid')) return 'paid';
      if (s.includes('pending')) return 'pending';
      if (s.includes('cancel')) return 'cancelled';
      if (s.includes('fail')) return 'failed';
      return s;
    };

    const orderId = String(extracted.orderId || '');
    const status = String(normalizeStatus(extracted.status));
    const transactionId = extracted.transactionId ? String(extracted.transactionId) : '';
    const amount = extracted.amount !== undefined ? String(extracted.amount) : '';
    const currency = String(extracted.currency || 'RON');

    console.log('[Netopia Webhook IPN] Extracted data:', {
      orderId,
      status,
      transactionId,
      amount,
      currency,
      usedPaths: {
        orderId: ['orderId','order_id','order.orderID','order.orderId','order.data.orderID'],
        status: ['status','payment_status','payment.status','payment.message','payment.code'],
        transactionId: ['transactionId','transaction_id','payment.ntpID','payment.data.tranId'],
        amount: ['amount','payment.amount'],
        currency: ['currency','payment.currency']
      },
      timestamp: new Date().toISOString()
    });

    if (!orderId) {
      console.error('[Netopia Webhook IPN] Missing orderId in webhook data');
      return NextResponse.json(
        { error: 'Missing orderId' }, 
        { status: 400 }
      );
    }

    // Procesează starea plății
    const paymentResult = await processPaymentStatus({
      orderId,
      status,
      transactionId,
      amount,
      currency,
      rawData: webhookData
    });

    const processingTime = timer();
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (paymentResult.success) {
      console.log('[Netopia Webhook IPN] Payment processed successfully:', {
        orderId,
        status,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      });

      // Log success pentru audit
      await logWebhookSuccess({
        orderId,
        webhookType: 'netopia_ipn',
        status,
        transactionId,
        amount: amount ? parseFloat(amount) : undefined,
        currency,
        rawData: webhookData,
        clientIP,
        userAgent,
        processingTimeMs: processingTime
      });
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Payment processed successfully',
          orderId 
        },
        { status: 200 }
      );
    } else {
      console.error('[Netopia Webhook IPN] Payment processing failed:', {
        orderId,
        error: paymentResult.error,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      });

      // Log error pentru audit
      await logWebhookError({
        orderId,
        webhookType: 'netopia_ipn',
        status,
        errorMessage: paymentResult.error,
        rawData: webhookData,
        clientIP,
        userAgent,
        processingTimeMs: processingTime
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: paymentResult.error,
          orderId 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    const processingTime = timer();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Netopia Webhook IPN] Unexpected error:', {
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
        errorType: 'unexpected_error'
      }),
      severity: 'critical'
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Procesează starea plății și actualizează comanda în sistem
 */
async function processPaymentStatus({
  orderId,
  status,
  transactionId,
  amount,
  currency,
  rawData
}: {
  orderId: string;
  status: string;
  transactionId?: string;
  amount?: string;
  currency: string;
  rawData: Record<string, unknown>;
}) {
  try {
    console.log('[Netopia Webhook IPN] Processing payment status:', {
      orderId,
      status,
      transactionId,
      amount,
      currency,
      timestamp: new Date().toISOString()
    });

    // Mapează statusurile Netopia la statusurile noastre
    const statusMapping: Record<string, string> = {
      'confirmed': 'SUCCEEDED',
      'confirmed_pending': 'PENDING',
      'paid': 'SUCCEEDED',
      'pending': 'PENDING',
      'cancelled': 'CANCELLED',
      'failed': 'FAILED',
      'refunded': 'REFUNDED'
    };

    const mappedStatus = statusMapping[status?.toLowerCase()] || 'PENDING';

    console.log('[Netopia Webhook IPN] Status mapping:', {
      originalStatus: status,
      mappedStatus,
      timestamp: new Date().toISOString()
    });

    // Actualizează comanda prin GraphQL API
    const updateResult = await updateOrderStatus({
      orderId,
      status: mappedStatus,
      transactionId,
      amount,
      currency,
      rawData
    });

    if (updateResult.success) {
      // Log-uri pentru audit
      await logWebhookEvent({
        orderId,
        status: mappedStatus,
        transactionId,
        amount,
        currency,
        rawData,
        processedAt: new Date().toISOString()
      });

      return { success: true };
    } else {
      return { 
        success: false, 
        error: updateResult.error || 'Failed to update order status' 
      };
    }

  } catch (error) {
    console.error('[Netopia Webhook IPN] Error processing payment status:', {
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
 * Actualizează starea comenzii prin GraphQL API
 */
async function updateOrderStatus({
  orderId,
  status,
  transactionId,
  amount,
  currency,
  rawData
}: {
  orderId: string;
  status: string;
  transactionId?: string;
  amount?: string;
  currency: string;
  rawData: Record<string, unknown>;
}) {
  try {
    // Use external API endpoint for server-side requests (webhooks)
    const endpoint = process.env.EXTERNAL_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://decodorul-oficial-api.vercel.app/api/graphql';
    
    const mutation = `
      mutation UpdateOrderStatus($orderId: ID!, $status: String!, $transactionId: String, $amount: String, $currency: String, $rawData: JSON) {
        updateOrderStatus(
          orderId: $orderId
          status: $status
          transactionId: $transactionId
          amount: $amount
          currency: $currency
          rawData: $rawData
        ) {
          success
          message
          order {
            id
            status
            amount
            currency
            updatedAt
          }
        }
      }
    `;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Adaugă cheia API internă pentru autentificare
    if (process.env.INTERNAL_API_KEY) {
      headers['X-Internal-API-Key'] = process.env.INTERNAL_API_KEY;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: mutation,
        variables: {
          orderId,
          status,
          transactionId,
          amount,
          currency,
          rawData
        }
      })
    });

    const result = await response.json();

    console.log('[Netopia Webhook IPN] GraphQL update result:', {
      orderId,
      success: response.ok,
      status: response.status,
      result,
      timestamp: new Date().toISOString()
    });

    const op = result?.data?.updateOrderStatus;
    // Considerăm succes dacă API-ul a răspuns cu 200 și mutația raportează success=true,
    // chiar dacă există warnings/erori non-critice în `errors`.
    if (response.ok && op?.success === true) {
      return { success: true, data: op };
    }
    return {
      success: false,
      error: result.errors?.[0]?.message || op?.message || 'GraphQL update failed'
    };

  } catch (error) {
    console.error('[Netopia Webhook IPN] Error updating order status:', {
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
 * Loghează evenimentul webhook pentru audit
 */
async function logWebhookEvent({
  orderId,
  status,
  transactionId,
  amount,
  currency,
  rawData,
  processedAt
}: {
  orderId: string;
  status: string;
  transactionId?: string;
  amount?: string;
  currency: string;
  rawData: Record<string, unknown>;
  processedAt: string;
}) {
  try {
    // Log prin RPC (schema payments) – non-blocking
    const payload = [{
      order_id: orderId,
      webhook_type: 'netopia_ipn',
      status,
      transaction_id: transactionId,
      amount: amount ? parseFloat(amount) : null,
      currency,
      raw_data: rawData,
      processed_at: processedAt
    }];

    const { error } = await supabase.rpc('webhook_processing', {
      payload: { type: 'webhook_logs', entries: payload }
    });

    if (error) {
      console.error('[Netopia Webhook IPN] Error logging webhook event:', {
        orderId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('[Netopia Webhook IPN] Webhook event logged successfully:', {
        orderId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[Netopia Webhook IPN] Error in logWebhookEvent:', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Suport pentru GET requests pentru verificarea health-ului endpoint-ului
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Netopia Webhook IPN',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
