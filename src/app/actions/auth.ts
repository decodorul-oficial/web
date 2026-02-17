'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  
  // Redirect should happen after sign out
  // We don't redirect here to allow the client to handle the redirect if needed
  // or we can redirect to home
  return { success: true };
}

