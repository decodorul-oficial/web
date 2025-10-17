import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Asigură-te că variabilele de mediu sunt definite (altfel aruncă o eroare la build time)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
}
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Client pentru server-side cu service role - doar pentru server-side
export const supabaseAdmin = (() => {
  // Verifică dacă suntem pe server
  if (typeof window === 'undefined') {
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }
    
    return createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  
  // Pe client, returnează null sau un client mock
  return null
})()
