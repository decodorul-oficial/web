import { createClient } from '@supabase/supabase-js';

// Configurare Supabase pentru logging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface WebhookLogEntry {
  orderId: string;
  webhookType: 'netopia_ipn' | 'netopia_success_redirect';
  status: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  errorCode?: string;
  errorMessage?: string;
  rawData: Record<string, unknown>;
  clientIP?: string;
  userAgent?: string;
  processedAt: string;
  success: boolean;
  processingTimeMs?: number;
}

export interface ErrorLogEntry {
  errorType: 'validation' | 'processing' | 'network' | 'database' | 'unknown';
  errorMessage: string;
  errorStack?: string;
  context: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

/**
 * Logger avansat pentru webhook-urile Netopia
 * 
 * Acest utilitar oferă logging structurat și gestionarea erorilor
 * pentru toate operațiunile legate de plăți.
 */
export class NetopiaLogger {
  private static instance: NetopiaLogger;
  private logBuffer: WebhookLogEntry[] = [];
  private errorBuffer: ErrorLogEntry[] = [];
  private readonly maxBufferSize = 100;
  private readonly flushInterval = 30000; // 30 secunde

  private constructor() {
    // Pornește flush-ul periodic
    setInterval(() => this.flushLogs(), this.flushInterval);
  }

  public static getInstance(): NetopiaLogger {
    if (!NetopiaLogger.instance) {
      NetopiaLogger.instance = new NetopiaLogger();
    }
    return NetopiaLogger.instance;
  }

  /**
   * Loghează un eveniment webhook
   */
  public async logWebhookEvent(entry: Omit<WebhookLogEntry, 'processedAt' | 'success'> & { success: boolean }): Promise<void> {
    try {
      const logEntry: WebhookLogEntry = {
        ...entry,
        processedAt: new Date().toISOString(),
        success: entry.success
      };

      // Adaugă în buffer pentru batch processing
      this.logBuffer.push(logEntry);

      // Log în consolă pentru debugging
      console.log(`[Netopia Logger] Webhook event logged:`, {
        orderId: entry.orderId,
        webhookType: entry.webhookType,
        status: entry.status,
        success: entry.success,
        timestamp: logEntry.processedAt
      });

      // Flush imediat dacă buffer-ul este plin
      if (this.logBuffer.length >= this.maxBufferSize) {
        await this.flushLogs();
      }

    } catch (error) {
      console.error('[Netopia Logger] Error logging webhook event:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        entry,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Loghează o eroare
   */
  public async logError(entry: Omit<ErrorLogEntry, 'timestamp'>): Promise<void> {
    try {
      const errorEntry: ErrorLogEntry = {
        ...entry,
        timestamp: new Date().toISOString()
      };

      // Adaugă în buffer pentru batch processing
      this.errorBuffer.push(errorEntry);

      // Log în consolă pentru debugging
      const logLevel = this.getLogLevel(entry.severity);
      console[logLevel](`[Netopia Logger] Error logged:`, {
        errorType: entry.errorType,
        errorMessage: entry.errorMessage,
        severity: entry.severity,
        context: entry.context,
        timestamp: errorEntry.timestamp
      });

      // Flush imediat pentru erori critice
      if (entry.severity === 'critical') {
        await this.flushErrors();
      }

    } catch (error) {
      console.error('[Netopia Logger] Error logging error entry:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        entry,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Flush-ează toate log-urile în baza de date
   */
  public async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      console.log(`[Netopia Logger] Flushing ${this.logBuffer.length} webhook logs to database`);

      const { error } = await supabase
        .from('webhook_logs')
        .insert(this.logBuffer.map(entry => ({
          order_id: entry.orderId,
          webhook_type: entry.webhookType,
          status: entry.status,
          transaction_id: entry.transactionId,
          amount: entry.amount,
          currency: entry.currency,
          error_code: entry.errorCode,
          error_message: entry.errorMessage,
          raw_data: entry.rawData,
          client_ip: entry.clientIP,
          user_agent: entry.userAgent,
          processed_at: entry.processedAt,
          success: entry.success,
          processing_time_ms: entry.processingTimeMs,
          created_at: new Date().toISOString()
        })));

      if (error) {
        console.error('[Netopia Logger] Error flushing webhook logs:', {
          error: error.message,
          count: this.logBuffer.length,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('[Netopia Logger] Successfully flushed webhook logs:', {
          count: this.logBuffer.length,
          timestamp: new Date().toISOString()
        });
      }

      // Golește buffer-ul
      this.logBuffer = [];

    } catch (error) {
      console.error('[Netopia Logger] Unexpected error flushing webhook logs:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        count: this.logBuffer.length,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Flush-ează toate erorile în baza de date
   */
  public async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    try {
      console.log(`[Netopia Logger] Flushing ${this.errorBuffer.length} error logs to database`);

      const { error } = await supabase
        .from('error_logs')
        .insert(this.errorBuffer.map(entry => ({
          error_type: entry.errorType,
          error_message: entry.errorMessage,
          error_stack: entry.errorStack,
          context: entry.context,
          severity: entry.severity,
          created_at: entry.timestamp
        })));

      if (error) {
        console.error('[Netopia Logger] Error flushing error logs:', {
          error: error.message,
          count: this.errorBuffer.length,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('[Netopia Logger] Successfully flushed error logs:', {
          count: this.errorBuffer.length,
          timestamp: new Date().toISOString()
        });
      }

      // Golește buffer-ul
      this.errorBuffer = [];

    } catch (error) {
      console.error('[Netopia Logger] Unexpected error flushing error logs:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        count: this.errorBuffer.length,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Măsoară timpul de procesare
   */
  public startTimer(): () => number {
    const startTime = Date.now();
    return () => Date.now() - startTime;
  }

  /**
   * Determină nivelul de log în funcție de severitate
   */
  private getLogLevel(severity: ErrorLogEntry['severity']): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'low':
        return 'log';
      case 'medium':
        return 'warn';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'log';
    }
  }

  /**
   * Creează un context structurat pentru logging
   */
  public createContext(data: Record<string, unknown>): Record<string, unknown> {
    return {
      ...data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  /**
   * Flush-ează toate log-urile (webhook + erori)
   */
  public async flushAll(): Promise<void> {
    await Promise.all([
      this.flushLogs(),
      this.flushErrors()
    ]);
  }
}

// Export instanța singleton
export const netopiaLogger = NetopiaLogger.getInstance();

/**
 * Funcții helper pentru logging rapid
 */
export const logWebhookSuccess = async (data: {
  orderId: string;
  webhookType: WebhookLogEntry['webhookType'];
  status: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  rawData: Record<string, unknown>;
  clientIP?: string;
  userAgent?: string;
  processingTimeMs?: number;
}) => {
  await netopiaLogger.logWebhookEvent({
    ...data,
    success: true
  });
};

export const logWebhookError = async (data: {
  orderId: string;
  webhookType: WebhookLogEntry['webhookType'];
  status: string;
  errorCode?: string;
  errorMessage?: string;
  rawData: Record<string, unknown>;
  clientIP?: string;
  userAgent?: string;
  processingTimeMs?: number;
}) => {
  await netopiaLogger.logWebhookEvent({
    ...data,
    success: false
  });
};

export const logProcessingError = async (data: {
  errorType: ErrorLogEntry['errorType'];
  errorMessage: string;
  errorStack?: string;
  context: Record<string, unknown>;
  severity: ErrorLogEntry['severity'];
}) => {
  await netopiaLogger.logError(data);
};
