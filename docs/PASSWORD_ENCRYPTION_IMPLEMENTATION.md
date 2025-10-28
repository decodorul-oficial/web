# Password Encryption Implementation

## Overview

This document describes the implementation of password encryption for the login and signup pages to secure password transmission to the GraphQL API.

## Security Architecture

The implementation uses a server-side encryption model where:

1. **Client Side**: Passwords are sent in plain text to Next.js server
2. **Server Side**: Passwords are encrypted using `INTERNAL_API_KEY` before being forwarded to the GraphQL API
3. **Key Management**: The `INTERNAL_API_KEY` environment variable is used as the encryption key

## Implementation Details

### Encryption Algorithm

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: SHA-256 hash of `INTERNAL_API_KEY` + random salt
- **IV Length**: 16 bytes (128 bits)
- **Salt Length**: 32 bytes (256 bits)
- **Tag Length**: 16 bytes (128 bits)

### Files Created/Modified

#### New Files

1. **`src/lib/crypto/passwordEncryption.ts`**
   - Server-side encryption functions
   - Uses Node.js crypto module
   - Implements AES-256-GCM with random salt and IV

2. **`src/lib/crypto/__tests__/passwordEncryption.test.ts`**
   - Unit tests for encryption functions

#### Modified Files

1. **`src/app/api/graphql/route.ts`**
   - Added password encryption logic
   - Encrypts passwords before forwarding to GraphQL API
   - Handles both `SignIn` and `SignUp` mutations

## Security Features

### 1. Key Security
- `INTERNAL_API_KEY` is never exposed to the client
- Encryption happens server-side only
- Key derivation uses random salt for each encryption

### 2. Encryption Security
- AES-256-GCM provides authenticated encryption
- Random salt and IV prevent rainbow table attacks
- Authentication tag prevents tampering

### 3. Transport Security
- Passwords are encrypted before transmission to GraphQL API
- Original passwords are sent in plain text to Next.js server (over HTTPS)
- Encryption happens server-side before API forwarding

## Usage Flow

### Login Process
1. User enters password on login page
2. Password sent in plain text to Next.js server (over HTTPS)
3. Next.js server encrypts password using `INTERNAL_API_KEY`
4. Encrypted password sent to GraphQL API
5. API processes authentication with encrypted password

### Signup Process
1. User enters password on signup page
2. Password sent in plain text to Next.js server (over HTTPS)
3. Next.js server encrypts password using `INTERNAL_API_KEY`
4. Encrypted password sent to GraphQL API
5. API processes registration with encrypted password

## Environment Variables

Required environment variable:
- `INTERNAL_API_KEY`: Used as the base for password encryption key derivation

## Testing

Run the encryption tests:
```bash
npm test src/lib/crypto/__tests__/passwordEncryption.test.ts
```

## Security Considerations

1. **Key Management**: Ensure `INTERNAL_API_KEY` is kept secure and rotated regularly
2. **HTTPS**: All communication should use HTTPS in production
3. **Rate Limiting**: Consider implementing rate limiting on the encryption endpoint
4. **Logging**: Avoid logging encrypted passwords or sensitive data
5. **Error Handling**: Decryption failures should not expose sensitive information

## Future Improvements

1. **Key Rotation**: Implement automatic key rotation
2. **Rate Limiting**: Add rate limiting to encryption endpoint
3. **Audit Logging**: Add audit logs for authentication attempts
4. **Performance**: Consider caching for frequently used operations
