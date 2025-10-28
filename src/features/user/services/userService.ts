import { supabase } from '@/lib/supabase/client'
import { UserProfile, SignUpInput, SignInInput, AuthResponse, TrialStatus } from '../types'
import { getGraphQLClient } from '@/lib/graphql/client'
import { UPDATE_PROFILE, GET_MY_PROFILE, UPDATE_USER_PREFERENCES, GET_USER_PREFERENCES, CHANGE_PASSWORD } from '../graphql/userQueries'

// Variabilă la nivel de modul pentru a stoca token-ul de autentificare
let authToken: string | null = null;

// Funcție helper care creează un client API cu token-ul curent
const getApiClient = (additionalHeaders?: Record<string, string>) => {
  const headers: Record<string, string> = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Adaugă header-uri suplimentare (ex: X-Captcha-Token)
  if (additionalHeaders) {
    Object.assign(headers, additionalHeaders);
  }
  
  return getGraphQLClient({
    getAuthToken: () => authToken ?? undefined,
    additionalHeaders: additionalHeaders
  });
};

export const UserService = {
  /**
   * Setează token-ul de autentificare global pentru toate cererile API.
   * Această funcție este esențială și trebuie apelată de AuthProvider.
   * @param token - Token-ul JWT sau null pentru a-l reseta.
   */
  setAuthToken(token: string | null) {
    authToken = token;
  },

  /**
   * Returnează token-ul de autentificare stocat curent.
   * @returns Token-ul JWT sau null.
   */
  getAuthToken(): string | null {
    return authToken;
  },

  // Obține profilul utilizatorului curent prin GraphQL API
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const client = getApiClient();
      const response = await client.request(GET_MY_PROFILE) as { 
        me?: { 
          id: string;
          email: string;
          profile?: {
            id: string;
            subscriptionTier: string;
            displayName?: string;
            avatarUrl?: string;
            isNewsletterSubscribed?: boolean;
            isAdmin?: boolean;
            trialStatus?: {
              isTrial: boolean;
              hasTrial: boolean;
              trialStart?: string;
              trialEnd?: string;
              tierId?: string;
              daysRemaining: number;
              expired: boolean;
            };
            preferences?: {
              preferredCategories: string[];
            };
            createdAt: string;
            updatedAt: string;
          };
        } 
      };

      if (response.me?.profile) {
        const { me } = response;
        const profile = me.profile;
        if (profile) {
          return {
            id: profile.id,
            email: me.email,
            full_name: profile.displayName || undefined,
            avatar_url: profile.avatarUrl || undefined,
            preferred_categories: profile.preferences?.preferredCategories || [],
            subscriptionTier: profile.subscriptionTier as 'free' | 'pro' | 'enterprise',
            trialStatus: profile.trialStatus || {
              isTrial: false,
              hasTrial: false,
              daysRemaining: 0,
              expired: false
            },
            isNewsletterSubscribed: profile.isNewsletterSubscribed,
            isAdmin: profile.isAdmin,
            created_at: profile.createdAt,
            updated_at: profile.updatedAt
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error);
      return null;
    }
  },

  // Creează profilul utilizatorului
  async createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          id: user.id,
          preferred_categories: profile.preferred_categories || [],
          notification_settings: {},
          display_name: profile.full_name || null,
          avatar_url: profile.avatar_url || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }
      if (data) {
        return {
          id: data.id,
          email: user.email || '',
          full_name: data.display_name || null,
          avatar_url: data.avatar_url || null,
          preferred_categories: data.preferred_categories || [],
          subscriptionTier: 'free',
          trialStatus: { isTrial: false, hasTrial: false, daysRemaining: 0, expired: false },
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      }
      return null
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return null
    }
  },
  
  // Actualizează profilul utilizatorului prin GraphQL API
  async updateProfile(updates: {
    displayName?: string;
    avatarUrl?: string;
    subscriptionTier?: 'free' | 'pro' | 'enterprise';
  }): Promise<boolean> {
    try {
      const client = getApiClient();
      const response = await client.request(UPDATE_PROFILE, {
        input: updates
      }) as { updateProfile?: any };

      return !!response.updateProfile;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  },

  // Actualizează preferințele utilizatorului prin GraphQL API
  async updateUserPreferences(categorySlugs: string[]): Promise<boolean> {
    try {
      const client = getApiClient();
      const response = await client.request(UPDATE_USER_PREFERENCES, {
        input: {
          preferredCategories: categorySlugs
        }
      }) as { updateUserPreferences?: any };
      return !!response.updateUserPreferences;
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return false;
    }
  },

  // Obține preferințele utilizatorului prin GraphQL API
  async getUserPreferences(): Promise<string[]> {
    try {
      const client = getApiClient();
      const response = await client.request(GET_USER_PREFERENCES) as { 
        getUserPreferences?: {
          preferredCategories: string[];
        }
      };
      return response.getUserPreferences?.preferredCategories || [];
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return [];
    }
  },

  // Verifică dacă utilizatorul este nou
  async isNewUser(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile()
      return !profile
    } catch (error) {
      console.error('Error in isNewUser:', error)
      return false
    }
  },

  // Verifică dacă utilizatorul este autentificat
  async isAuthenticated(): Promise<boolean> {
    return !!authToken;
  },

  // Verifică status trial
  async getTrialStatus(): Promise<TrialStatus | null> {
    try {
      const profile = await this.getCurrentUserProfile();
      return profile?.trialStatus || null;
    } catch (error) {
      console.error('Error in getTrialStatus:', error);
      return null;
    }
  },

  // Verifică dacă utilizatorul are acces la funcționalități premium
  async hasPremiumAccess(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();
      if (!profile) return false;

      // Verifică dacă are abonament activ sau trial valid
      return profile.subscriptionTier !== 'free' || 
             (profile.trialStatus?.isTrial && !profile.trialStatus?.expired);
    } catch (error) {
      console.error('Error in hasPremiumAccess:', error);
      return false;
    }
  },

  // Înregistrare utilizator nou
  async signUp(input: SignUpInput): Promise<AuthResponse | null> {
    try {
      // Pregătește header-uri suplimentare pentru reCAPTCHA
      const additionalHeaders: Record<string, string> = {};
      if (input.recaptchaToken) {
        additionalHeaders['X-Captcha-Token'] = input.recaptchaToken;
      }
      
      const client = getApiClient(additionalHeaders); // Nu necesită token pentru înregistrare
      const response = await client.request(`
        mutation SignUp($input: SignUpInput!) {
          signUp(input: $input) { token, user { id, email, profile { id, subscriptionTier, trialStatus { isTrial, hasTrial, trialStart, trialEnd, daysRemaining, expired } } } }
        }
      `, { input }) as { signUp?: AuthResponse };
      return response.signUp || null;
    } catch (error) {
      console.error('Error in signUp:', error);
      return null;
    }
  },

  // Autentificare utilizator
  async signIn(input: SignInInput): Promise<AuthResponse | null> {
    try {
      // Pregătește header-uri suplimentare pentru reCAPTCHA
      const additionalHeaders: Record<string, string> = {};
      if (input.recaptchaToken) {
        additionalHeaders['X-Captcha-Token'] = input.recaptchaToken;
      }
      
      const client = getApiClient(additionalHeaders); // Nu necesită token pentru autentificare
      const response = await client.request(`
        mutation SignIn($input: SignInInput!) {
          signIn(input: $input) { token, user { id, email, profile { id, subscriptionTier, trialStatus { isTrial, hasTrial, trialStart, trialEnd, daysRemaining, expired } } } }
        }
      `, { input }) as { signIn?: AuthResponse };
      return response.signIn || null;
    } catch (error) {
      console.error('Error in signIn:', error);
      return null;
    }
  },
  
  // Schimbă parola utilizatorului prin GraphQL API
  async changePassword(params: { currentPassword: string; newPassword: string; recaptchaToken?: string }): Promise<boolean> {
    try {
      // Pregătește header-uri suplimentare pentru reCAPTCHA
      const additionalHeaders: Record<string, string> = {};
      if (params.recaptchaToken) {
        additionalHeaders['X-Captcha-Token'] = params.recaptchaToken;
      }
      
      const client = getApiClient(additionalHeaders);
      const response = await client.request(CHANGE_PASSWORD, {
        input: {
          currentPassword: params.currentPassword,
          newPassword: params.newPassword,
        },
      }) as { changePassword?: boolean };
      return Boolean(response.changePassword);
    } catch (error) {
      console.error('Error in changePassword:', error);
      return false;
    }
  },
};

