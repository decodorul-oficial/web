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
    // Parsează datele primite de la Netopia
    const formData = await request.formData();
    const webhookData = Object.fromEntries(formData.entries());
    
    console.log('[Netopia Webhook IPN] Raw data received:', {
      keys: Object.keys(webhookData),
      hasData: Object.keys(webhookData).length > 0,
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

    // Extrage informațiile relevante din webhook
    const orderId = String(webhookData.orderId || webhookData.order_id || '');
    const status = String(webhookData.status || webhookData.payment_status || '');
    const transactionId = String(webhookData.transactionId || webhookData.transaction_id || '');
    const amount = String(webhookData.amount || '');
    const currency = String(webhookData.currency || 'RON');

    console.log('[Netopia Webhook IPN] Extracted data:', {
      orderId,
      status,
      transactionId,
      amount,
      currency,
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
    const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://decodorul-oficial-api.vercel.app/api/graphql';
    
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

    if (!response.ok || result.errors) {
      return { 
        success: false, 
        error: result.errors?.[0]?.message || 'GraphQL update failed' 
      };
    }

    return { 
      success: true, 
      data: result.data?.updateOrderStatus 
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
    // Log în Supabase pentru audit
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        order_id: orderId,
        status,
        transaction_id: transactionId,
        amount: amount ? parseFloat(amount) : null,
        currency,
        raw_data: rawData,
        processed_at: processedAt,
        webhook_type: 'netopia_ipn',
        created_at: new Date().toISOString()
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
