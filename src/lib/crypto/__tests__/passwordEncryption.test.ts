import { encryptPassword, decryptPassword } from '../passwordEncryption';

describe('Password Encryption', () => {
  const testApiKey = 'test-internal-api-key-12345';
  const testPassword = 'TestPassword123!';

  it('should encrypt and decrypt password correctly', () => {
    // Encrypt the password
    const encrypted = encryptPassword(testPassword, testApiKey);
    
    // Verify encrypted password is different from original
    expect(encrypted).not.toBe(testPassword);
    expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 format
    
    // Decrypt the password
    const decrypted = decryptPassword(encrypted, testApiKey);
    
    // Verify decrypted password matches original
    expect(decrypted).toBe(testPassword);
  });

  it('should produce different encrypted values for same password', () => {
    const encrypted1 = encryptPassword(testPassword, testApiKey);
    const encrypted2 = encryptPassword(testPassword, testApiKey);
    
    // Due to random salt and IV, encrypted values should be different
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to the same password
    expect(decryptPassword(encrypted1, testApiKey)).toBe(testPassword);
    expect(decryptPassword(encrypted2, testApiKey)).toBe(testPassword);
  });

  it('should fail to decrypt with wrong API key', () => {
    const encrypted = encryptPassword(testPassword, testApiKey);
    const wrongApiKey = 'wrong-api-key';
    
    expect(() => {
      decryptPassword(encrypted, wrongApiKey);
    }).toThrow('Password decryption failed');
  });

  it('should handle empty password', () => {
    const emptyPassword = '';
    const encrypted = encryptPassword(emptyPassword, testApiKey);
    const decrypted = decryptPassword(encrypted, testApiKey);
    
    expect(decrypted).toBe(emptyPassword);
  });

  it('should handle special characters in password', () => {
    const specialPassword = 'P@ssw0rd!@#$%^&*()_+-=[]{}|;:,.<>?';
    const encrypted = encryptPassword(specialPassword, testApiKey);
    const decrypted = decryptPassword(encrypted, testApiKey);
    
    expect(decrypted).toBe(specialPassword);
  });
});
