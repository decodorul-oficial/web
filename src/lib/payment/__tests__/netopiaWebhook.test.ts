import { validateNetopiaWebhook, validateNetopiaSignature, validateNetopiaIP } from '../netopiaValidation';
import { netopiaLogger } from '../netopiaLogger';
import * as crypto from 'crypto';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NETOPIA_WEBHOOK_SECRET: 'test_secret_key',
    NETOPIA_ALLOWED_IPS: '192.168.1.1,10.0.0.1,203.0.113.0/24'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Netopia Webhook Validation', () => {
  describe('validateNetopiaSignature', () => {
    it('should validate correct signature', () => {
      const webhookData = {
        orderId: 'test_123',
        status: 'confirmed',
        amount: '99.99',
        currency: 'RON',
        signature: 'expected_signature' // This would be calculated properly in real scenario
      };

      // Mock crypto.createHmac to return predictable signature
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('expected_signature')
      };
      
      jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac);

      const result = validateNetopiaSignature(webhookData, 'test_secret_key');
      
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(webhookData);
    });

    it('should reject invalid signature', () => {
      const webhookData = {
        orderId: 'test_123',
        status: 'confirmed',
        amount: '99.99',
        currency: 'RON',
        signature: 'invalid_signature'
      };

      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('expected_signature')
      };
      
      jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac);

      const result = validateNetopiaSignature(webhookData, 'test_secret_key');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('should reject missing signature', () => {
      const webhookData = {
        orderId: 'test_123',
        status: 'confirmed',
        amount: '99.99',
        currency: 'RON'
      };

      const result = validateNetopiaSignature(webhookData, 'test_secret_key');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing signature in webhook data');
    });
  });

  describe('validateNetopiaIP', () => {
    it('should allow whitelisted IPs', () => {
      const result = validateNetopiaIP('192.168.1.1', ['192.168.1.1', '10.0.0.1']);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject non-whitelisted IPs', () => {
      const result = validateNetopiaIP('192.168.1.2', ['192.168.1.1', '10.0.0.1']);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('IP address not allowed');
    });

    it('should handle CIDR notation', () => {
      const result = validateNetopiaIP('203.0.113.5', ['203.0.113.0/24']);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateNetopiaWebhook', () => {
    it('should validate complete webhook with all checks', () => {
      const webhookData = {
        orderId: 'test_123',
        status: 'confirmed',
        amount: '99.99',
        currency: 'RON',
        signature: 'expected_signature',
        timestamp: Date.now().toString()
      };

      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('expected_signature')
      };
      
      jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac);

      const result = validateNetopiaWebhook(webhookData, '192.168.1.1', {
        secretKey: 'test_secret_key',
        allowedIPs: ['192.168.1.1'],
        validateTimestamp: true,
        maxAgeSeconds: 300
      });
      
      expect(result.isValid).toBe(true);
    });

    it('should reject webhook with invalid IP', () => {
      const webhookData = {
        orderId: 'test_123',
        status: 'confirmed',
        amount: '99.99',
        currency: 'RON',
        signature: 'expected_signature',
        timestamp: Date.now().toString()
      };

      const result = validateNetopiaWebhook(webhookData, '192.168.1.2', {
        secretKey: 'test_secret_key',
        allowedIPs: ['192.168.1.1'],
        validateTimestamp: true,
        maxAgeSeconds: 300
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('IP address not allowed');
    });
  });
});

describe('Netopia Logger', () => {
  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create timer correctly', () => {
    const timer = netopiaLogger.startTimer();
    
    // Wait a bit
    setTimeout(() => {
      const elapsed = timer();
      expect(elapsed).toBeGreaterThan(0);
    }, 10);
  });

  it('should create context with metadata', () => {
    const context = netopiaLogger.createContext({
      orderId: 'test_123',
      status: 'confirmed'
    });

    expect(context).toHaveProperty('orderId', 'test_123');
    expect(context).toHaveProperty('status', 'confirmed');
    expect(context).toHaveProperty('timestamp');
    expect(context).toHaveProperty('environment');
    expect(context).toHaveProperty('version');
  });
});

describe('Webhook Integration Tests', () => {
  it('should process valid webhook data', async () => {
    const webhookData = {
      orderId: 'test_123',
      status: 'confirmed',
      transactionId: 'txn_456',
      amount: '99.99',
      currency: 'RON',
      signature: 'expected_signature',
      timestamp: Date.now().toString()
    };

    const mockHmac = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('expected_signature')
    };
    
    jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac);

    const validation = validateNetopiaWebhook(webhookData, '192.168.1.1', {
      secretKey: 'test_secret_key',
      allowedIPs: ['192.168.1.1'],
      validateTimestamp: true,
      maxAgeSeconds: 300
    });

    expect(validation.isValid).toBe(true);
    expect(validation.data).toEqual(webhookData);
  });

  it('should handle webhook with missing required fields', () => {
    const webhookData = {
      status: 'confirmed',
      // Missing orderId
    };

    const validation = validateNetopiaWebhook(webhookData, '192.168.1.1', {
      secretKey: 'test_secret_key',
      allowedIPs: ['192.168.1.1'],
      validateTimestamp: false
    });

    // Should still validate if we're not checking signature
    expect(validation.isValid).toBe(true);
  });

  it('should reject webhook with old timestamp', () => {
    const webhookData = {
      orderId: 'test_123',
      status: 'confirmed',
      timestamp: (Date.now() - 400000).toString() // 400 seconds ago
    };

    const validation = validateNetopiaWebhook(webhookData, '192.168.1.1', {
      secretKey: 'test_secret_key',
      allowedIPs: ['192.168.1.1'],
      validateTimestamp: true,
      maxAgeSeconds: 300 // 5 minutes
    });

    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('Webhook timestamp too old');
  });
});
