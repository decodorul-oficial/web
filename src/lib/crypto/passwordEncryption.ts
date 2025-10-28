import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

/**
 * Password encryption utility using AES-256-GCM
 * Uses INTERNAL_API_KEY as the base for key derivation
 * 
 * IMPORTANT: This should only be used on the server side
 * The INTERNAL_API_KEY must never be exposed to the client
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is 96 bits
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Derives a key from the INTERNAL_API_KEY using PBKDF2
 */
function deriveKey(apiKey: string, salt: Buffer): Buffer {
  return createHash('sha256')
    .update(apiKey)
    .update(salt)
    .digest();
}

/**
 * Encrypts a password using AES-256-GCM
 * @param password - The plain text password to encrypt
 * @param apiKey - The INTERNAL_API_KEY from environment
 * @returns Base64 encoded encrypted password with salt and IV
 */
export function encryptPassword(password: string, apiKey: string): string {
  try {
    // Generate random salt and IV
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);
    
    // Derive key from API key and salt
    const key = deriveKey(apiKey, salt);
    
    // Create cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(salt); // Use salt as additional authenticated data
    
    // Encrypt the password
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Error encrypting password:', error);
    throw new Error('Password encryption failed');
  }
}

/**
 * Decrypts a password using AES-256-GCM
 * @param encryptedPassword - Base64 encoded encrypted password
 * @param apiKey - The INTERNAL_API_KEY from environment
 * @returns The decrypted plain text password
 */
export function decryptPassword(encryptedPassword: string, apiKey: string): string {
  try {
    // Decode from base64
    const combined = Buffer.from(encryptedPassword, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Derive key from API key and salt
    const key = deriveKey(apiKey, salt);
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(salt); // Use salt as additional authenticated data
    decipher.setAuthTag(tag);
    
    // Decrypt the password
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting password:', error);
    throw new Error('Password decryption failed');
  }
}

/**
 * Server-side password encryption for API
 * This function should only be used on the server side
 */
export function encryptPasswordServer(password: string): string {
  const apiKey = process.env.INTERNAL_API_KEY;
  if (!apiKey) {
    throw new Error('INTERNAL_API_KEY not available on server side');
  }
  return encryptPassword(password, apiKey);
}

/**
 * Server-side password decryption for API
 * This function should only be used on the server side
 */
export function decryptPasswordServer(encryptedPassword: string): string {
  const apiKey = process.env.INTERNAL_API_KEY;
  if (!apiKey) {
    throw new Error('INTERNAL_API_KEY not available on server side');
  }
  return decryptPassword(encryptedPassword, apiKey);
}
