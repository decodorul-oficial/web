'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { UserProfile, SignUpInput, SignInInput, AuthResponse, TrialStatus } from '@/features/user/types';
import { UserService } from '@/features/user/services/userService';
import { signOutAction } from '@/app/actions/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<AuthResponse | null>;
  signIn: (input: SignInInput) => Promise<AuthResponse | null>;
  trialStatus: TrialStatus | null;
  hasPremiumAccess: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        
        // Set the auth token in UserService for centralized authentication
        UserService.setAuthToken(session?.access_token ?? null);

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          try {
            let userProfile = await UserService.getCurrentUserProfile();
            if (!userProfile) {
              console.log('Profile not found for user, creating one...');
              await UserService.createUserProfile({
                email: currentUser.email,
                full_name: currentUser.user_metadata?.full_name,
              });
              userProfile = await UserService.getCurrentUserProfile();
            }
            if (isMounted) {
              setProfile(userProfile);
              if (userProfile) {
                setTrialStatus(userProfile.trialStatus || null);
                setHasPremiumAccess(
                  userProfile.subscriptionTier !== 'free' ||
                  (userProfile.trialStatus?.isTrial && !userProfile.trialStatus?.expired)
                );
                setIsAdmin(userProfile.isAdmin || false);
              }
            }
          } catch (error) {
            console.error('Error during profile fetching/creation:', error);
            if (isMounted) {
              setProfile(null);
              setTrialStatus(null);
              setHasPremiumAccess(false);
              setIsAdmin(false);
            }
          }
        } else {
          setProfile(null);
          setTrialStatus(null);
          setHasPremiumAccess(false);
          setIsAdmin(false);
        }
        
        if (loading) {
          setLoading(false);
        }
      }
    );
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading && !!user) {
      const authPages = ['/login', '/register'];
      if (authPages.includes(pathname)) {
        router.replace('/');
      }
    }
  }, [user, loading, pathname, router]);

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await UserService.getCurrentUserProfile();
      setProfile(userProfile);
      if (userProfile) {
        setTrialStatus(userProfile.trialStatus);
        setHasPremiumAccess(
          userProfile.subscriptionTier !== 'free' || 
          (userProfile.trialStatus.isTrial && !userProfile.trialStatus.expired)
        );
        setIsAdmin(userProfile.isAdmin || false);
      }
    }
  };

  const signOut = async () => {
    try {
      // Server-side sign out to clear HTTP-only cookies
      await signOutAction();

      // Revoke refresh token on server and clear local session for safety
      try {
        // @supabase/supabase-js v2 supports scoping
        // Global: revoke refresh token; Local: clear local storage/session
        // Run both to be thorough
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.auth as any).signOut?.({ scope: 'global' });
      } catch {}
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.auth as any).signOut?.({ scope: 'local' });
      } catch {}

      // Fallback: standard signOut
      try {
        await supabase.auth.signOut();
      } catch {}

      // Clear our app token/cache
      UserService.setAuthToken(null);

      // Proactively remove any Supabase persisted session keys and legacy tokens
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;
            // Supabase v2 stores under sb-<project-ref>-auth-token (and backup variants)
            if (k.startsWith('sb-')) keysToRemove.push(k);
            if (k === 'DO_TOKEN') keysToRemove.push(k);
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        }
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const keysToRemoveSession: string[] = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (!k) continue;
            if (k.startsWith('sb-')) keysToRemoveSession.push(k);
          }
          keysToRemoveSession.forEach((k) => sessionStorage.removeItem(k));
        }
      } catch {}
    } finally {
      // Hard redirect to ensure a clean app state
      window.location.href = '/';
    }
  };

  const signIn = async (input: SignInInput): Promise<AuthResponse | null> => {
    try {
      const response = await UserService.signIn(input);
      if (response?.token) {
        const { error } = await supabase.auth.setSession({
          access_token: response.token,
          refresh_token: response.token,
        });
        if (error) {
          console.error('Error setting Supabase session:', error);
          return null;
        }
      }
      return response;
    } catch (error) {
      console.error('Error in signIn:', error);
      return null;
    }
  };
  
  const signUp = async (input: SignUpInput): Promise<AuthResponse | null> => {
    try {
      const response = await UserService.signUp(input);
      if (response?.token) {
        const { error } = await supabase.auth.setSession({
          access_token: response.token,
          refresh_token: response.token,
        });
        if (error) {
          console.error('Error setting Supabase session on sign-up:', error);
          return null;
        }
      }
      return response;
    } catch (error) {
      console.error('Error in signUp:', error);
      return null;
    }
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
    // isAuthenticated is true if the user object exists. 
    // Components that need profile data should check for `profile` separately.
    isAuthenticated: !!user,
    refreshProfile,
    signUp,
    signIn,
    trialStatus,
    hasPremiumAccess,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

