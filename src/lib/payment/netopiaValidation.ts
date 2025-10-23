import crypto from 'crypto';

/**
 * Utilitare pentru validarea și securitatea webhook-urilor Netopia
 * 
 * Aceste funcții asigură că webhook-urile primite sunt autentice
 * și provin de la Netopia, prevenind atacurile de tip man-in-the-middle.
 */

export interface NetopiaWebhookData {
  orderId: string;
  status: string;
  transactionId?: string;
  amount?: string;
  currency?: string;
  signature?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: NetopiaWebhookData;
}

/**
 * Validează semnătura webhook-ului Netopia
 * 
 * @param webhookData - Datele primite în webhook
 * @param secretKey - Cheia secretă pentru validarea semnăturii
 * @returns Rezultatul validării
 */
export function validateNetopiaSignature(
  webhookData: Record<string, unknown>,
  secretKey: string
): ValidationResult {
  try {
    console.log('[Netopia Validation] Starting signature validation:', {
      hasSignature: !!webhookData.signature,
      hasSecretKey: !!secretKey,
      timestamp: new Date().toISOString()
    });

    // Verifică dacă avem semnătura în datele primite
    if (!webhookData.signature) {
      console.warn('[Netopia Validation] No signature found in webhook data');
      return {
        isValid: false,
        error: 'Missing signature in webhook data'
      };
    }

    // Verifică dacă avem cheia secretă configurată
    if (!secretKey) {
      console.error('[Netopia Validation] No secret key configured');
      return {
        isValid: false,
        error: 'Secret key not configured'
      };
    }

    // Extrage semnătura din datele primite
    const receivedSignature = webhookData.signature;
    
    // Creează semnătura așteptată
    const expectedSignature = generateNetopiaSignature(webhookData, secretKey);
    
    console.log('[Netopia Validation] Signature comparison:', {
      received: receivedSignature,
      expected: expectedSignature,
      match: receivedSignature === expectedSignature,
      timestamp: new Date().toISOString()
    });

    // Compară semnăturile
    if (receivedSignature !== expectedSignature) {
      console.error('[Netopia Validation] Signature mismatch');
      return {
        isValid: false,
        error: 'Invalid signature'
      };
    }

    console.log('[Netopia Validation] Signature validation successful');
    return {
      isValid: true,
      data: webhookData as NetopiaWebhookData
    };

  } catch (error) {
    console.error('[Netopia Validation] Error validating signature:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

/**
 * Generează semnătura Netopia pentru validare
 * 
 * @param data - Datele webhook-ului
 * @param secretKey - Cheia secretă
 * @returns Semnătura generată
 */
function generateNetopiaSignature(
  data: Record<string, unknown>,
  secretKey: string
): string {
  try {
    // Creează string-ul pentru semnătură (exclude semnătura din calcul)
    const { signature, ...dataForSignature } = data;
    
    // Sortează cheile pentru consistență
    const sortedKeys = Object.keys(dataForSignature).sort();
    
    // Creează string-ul de semnătură
    const signatureString = sortedKeys
      .map(key => `${key}=${dataForSignature[key]}`)
      .join('&');
    
    console.log('[Netopia Validation] Signature string:', {
      signatureString,
      timestamp: new Date().toISOString()
    });

    // Generează HMAC SHA256
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signatureString);
    const generatedSignature = hmac.digest('hex');
    
    console.log('[Netopia Validation] Generated signature:', {
      signature: generatedSignature,
      timestamp: new Date().toISOString()
    });

    return generatedSignature;

  } catch (error) {
    console.error('[Netopia Validation] Error generating signature:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Validează IP-ul sursă al webhook-ului
 * 
 * @param clientIP - IP-ul clientului
 * @param allowedIPs - Lista de IP-uri permise
 * @returns Rezultatul validării IP-ului
 */
export function validateNetopiaIP(
  clientIP: string,
  allowedIPs: string[]
): ValidationResult {
  try {
    console.log('[Netopia Validation] Validating IP:', {
      clientIP,
      allowedIPs,
      timestamp: new Date().toISOString()
    });

    // Verifică dacă IP-ul este în lista de IP-uri permise
    const isAllowed = allowedIPs.some(allowedIP => {
      // Suport pentru CIDR notation
      if (allowedIP.includes('/')) {
        return isIPInCIDR(clientIP, allowedIP);
      }
      // Suport pentru IP-uri exacte
      return clientIP === allowedIP;
    });

    if (!isAllowed) {
      console.error('[Netopia Validation] IP not allowed:', {
        clientIP,
        allowedIPs,
        timestamp: new Date().toISOString()
      });
      return {
        isValid: false,
        error: 'IP address not allowed'
      };
    }

    console.log('[Netopia Validation] IP validation successful');
    return {
      isValid: true
    };

  } catch (error) {
    console.error('[Netopia Validation] Error validating IP:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown IP validation error'
    };
  }
}

/**
 * Verifică dacă un IP este în intervalul CIDR
 * 
 * @param ip - IP-ul de verificat
 * @param cidr - Intervalul CIDR
 * @returns True dacă IP-ul este în interval
 */
function isIPInCIDR(ip: string, cidr: string): boolean {
  try {
    const [network, prefixLength] = cidr.split('/');
    const prefix = parseInt(prefixLength, 10);
    
    // Converteste IP-urile la numere
    const ipNum = ipToNumber(ip);
    const networkNum = ipToNumber(network);
    
    // Calculează masca de rețea
    const mask = (0xffffffff << (32 - prefix)) >>> 0;
    
    return (ipNum & mask) === (networkNum & mask);
  } catch (error) {
    console.error('[Netopia Validation] Error checking CIDR:', {
      ip,
      cidr,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

/**
 * Convertește un IP la număr
 * 
 * @param ip - IP-ul de convertit
 * @returns Numărul IP
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Validează timestamp-ul webhook-ului pentru a preveni atacurile de replay
 * 
 * @param timestamp - Timestamp-ul din webhook
 * @param maxAgeSeconds - Vârsta maximă permisă în secunde (default: 300 = 5 minute)
 * @returns Rezultatul validării timestamp-ului
 */
export function validateWebhookTimestamp(
  timestamp: string | number,
  maxAgeSeconds: number = 300
): ValidationResult {
  try {
    console.log('[Netopia Validation] Validating timestamp:', {
      timestamp,
      maxAgeSeconds,
      currentTime: new Date().toISOString()
    });

    const webhookTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const ageSeconds = (currentTime - webhookTime) / 1000;

    if (ageSeconds > maxAgeSeconds) {
      console.error('[Netopia Validation] Timestamp too old:', {
        webhookTime: new Date(webhookTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        ageSeconds,
        maxAgeSeconds,
        timestamp: new Date().toISOString()
      });
      return {
        isValid: false,
        error: 'Webhook timestamp too old'
      };
    }

    if (ageSeconds < 0) {
      console.error('[Netopia Validation] Timestamp in future:', {
        webhookTime: new Date(webhookTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        ageSeconds,
        timestamp: new Date().toISOString()
      });
      return {
        isValid: false,
        error: 'Webhook timestamp in future'
      };
    }

    console.log('[Netopia Validation] Timestamp validation successful');
    return {
      isValid: true
    };

  } catch (error) {
    console.error('[Netopia Validation] Error validating timestamp:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown timestamp validation error'
    };
  }
}

/**
 * Validează complet un webhook Netopia
 * 
 * @param webhookData - Datele webhook-ului
 * @param clientIP - IP-ul clientului
 * @param options - Opțiuni de validare
 * @returns Rezultatul validării complete
 */
export function validateNetopiaWebhook(
  webhookData: Record<string, unknown>,
  clientIP: string,
  options: {
    secretKey?: string;
    allowedIPs?: string[];
    validateTimestamp?: boolean;
    maxAgeSeconds?: number;
  } = {}
): ValidationResult {
  try {
    console.log('[Netopia Validation] Starting complete webhook validation:', {
      hasData: Object.keys(webhookData).length > 0,
      clientIP,
      options,
      timestamp: new Date().toISOString()
    });

    // Validează IP-ul dacă este configurat
    if (options.allowedIPs && options.allowedIPs.length > 0) {
      const ipValidation = validateNetopiaIP(clientIP, options.allowedIPs);
      if (!ipValidation.isValid) {
        return ipValidation;
      }
    }

    // Validează timestamp-ul dacă este configurat
    if (options.validateTimestamp && webhookData.timestamp) {
      const timestampValidation = validateWebhookTimestamp(
        webhookData.timestamp as string | number,
        options.maxAgeSeconds
      );
      if (!timestampValidation.isValid) {
        return timestampValidation;
      }
    }

    // Validează semnătura dacă este configurată
    if (options.secretKey) {
      const signatureValidation = validateNetopiaSignature(webhookData, options.secretKey);
      if (!signatureValidation.isValid) {
        return signatureValidation;
      }
    }

    console.log('[Netopia Validation] Complete webhook validation successful');
    return {
      isValid: true,
      data: webhookData as NetopiaWebhookData
    };

  } catch (error) {
    console.error('[Netopia Validation] Error in complete webhook validation:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}
