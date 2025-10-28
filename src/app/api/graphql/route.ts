import { NextRequest, NextResponse } from 'next/server';
import { encryptPasswordServer } from '@/lib/crypto/passwordEncryption';

// Proxy GraphQL requests from the browser through the Next.js server
// Injects X-Internal-API-Key and forwards to the real GraphQL endpoint
// Also handles password encryption for authentication mutations

export async function POST(req: NextRequest) {
  try {
    // Use environment variables to determine the correct external API endpoint
    const browserEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql';
    const externalApiEndpoint = process.env.EXTERNAL_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://decodorul-oficial-api.vercel.app/api/graphql';
    
    // Debug logging to see what values we're working with
    console.log('[GraphQL Proxy Debug] Environment variables:', {
      NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
      EXTERNAL_GRAPHQL_ENDPOINT: process.env.EXTERNAL_GRAPHQL_ENDPOINT,
      browserEndpoint,
      externalApiEndpoint
    });
    
    // Determine the final endpoint for the upstream request
    let endpoint: string;
    if (browserEndpoint.startsWith('/')) {
      // If browser endpoint is relative, use external API endpoint
      endpoint = externalApiEndpoint;
    } else if (browserEndpoint.startsWith('http')) {
      // If browser endpoint is absolute, use it directly
      endpoint = browserEndpoint;
    } else {
      // Fallback to external API endpoint
      endpoint = externalApiEndpoint;
    }
    
    console.log('[GraphQL Proxy Debug] Final endpoint decision:', {
      browserEndpoint,
      externalApiEndpoint,
      finalEndpoint: endpoint,
      isRelative: browserEndpoint.startsWith('/'),
      isAbsolute: browserEndpoint.startsWith('http')
    });
    
    let body = await req.text();

    // Check if this is a signIn or signUp mutation and encrypt the password
    try {
      const parsedBody = JSON.parse(body);
      if (parsedBody.query && parsedBody.variables) {
        const isSignInMutation = parsedBody.query.includes('mutation SignIn');
        const isSignUpMutation = parsedBody.query.includes('mutation SignUp');
        
        if ((isSignInMutation || isSignUpMutation) && parsedBody.variables.input?.password) {
          try {
            // Encrypt the password before forwarding to the API
            const encryptedPassword = encryptPasswordServer(parsedBody.variables.input.password);
            parsedBody.variables.input.password = encryptedPassword;
            body = JSON.stringify(parsedBody);
          } catch (encryptError) {
            console.error('Error encrypting password:', encryptError);
            // Continue with original body if encryption fails
          }
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, continue with original body
      console.warn('Could not parse GraphQL body for password encryption:', parseError);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Adaugă X-Internal-API-Key pentru autentificarea aplicației
    if (process.env.INTERNAL_API_KEY) {
      headers['X-Internal-API-Key'] = process.env.INTERNAL_API_KEY as string;
    }

    // Transmite header-ul Authorization dacă există (pentru utilizatori autentificați)
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Transmite header-ul X-Captcha-Token dacă există (pentru reCAPTCHA)
    const captchaToken = req.headers.get('x-captcha-token');
    if (captchaToken) {
      headers['X-Captcha-Token'] = captchaToken;
    }

    if (process.env.DEBUG_INTERNAL_API_KEY === 'true') {
      try {
        const opMatch = /\b(query|mutation)\s+(\w+)/.exec(body);
        const operationName = opMatch?.[2] ?? 'unknown';
        console.info('[GraphQL][S2S Debug][proxy] forwarding request', {
          browserEndpoint,
          externalApiEndpoint,
          finalEndpoint: endpoint,
          operationName,
          hasInternalKey: Boolean(process.env.INTERNAL_API_KEY),
          internalKeyLength: process.env.INTERNAL_API_KEY?.length ?? 0,
          hasAuthHeader: Boolean(authHeader),
          authHeaderLength: authHeader?.length ?? 0,
          headerNames: Object.keys(headers)
        });
      } catch {}
    }

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers,
      body
    });

    const resText = await upstream.text();
    return new NextResponse(resText, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        // CORS headers for browser requests
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Captcha-Token, X-Internal-API-Key'
      }
    });
  } catch (err) {
    console.error('[GraphQL proxy] error forwarding request:', err);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Captcha-Token, X-Internal-API-Key',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  });
}


