"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { SearchSpotlight } from '@/components/search/SearchSpotlight';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useConsent } from '@/components/cookies/ConsentProvider';
import { useCategories } from '@/contexts/CategoriesContext';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import { EnhancedUser } from '@/features/subscription/types';
import { User, LogIn, ChevronDown } from 'lucide-react';
import { 
  User as UserIcon, 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  UserX, 
  UserCog, 
  UserSearch, 
  Edit3, 
  Crown, 
  Shield, 
  Star, 
  Heart, 
  Smile, 
  Laugh, 
  Bot, 
  Zap, 
  Sparkles, 
  Target, 
  Award, 
  Trophy 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const navItems: { href: string; label: string }[] = [
  { href: '/', label: 'Acasă' },
  { href: '/stiri', label: 'Căutare Avansată' },
  { href: '/sinteza-zilnica', label: 'Sinteza Zilnică' },
  { href: '/favorite', label: 'Știri Favorite' },
  // slot for dropdown "Category"
  //{ href: '/categorii/administratie', label: 'Category' },
  //{ href: '/categorii/economie', label: 'Category 2' },
  //{ href: '/categorii/legislatie', label: 'Category 3' },
  //{ href: '/join', label: 'Join' },
  //{ href: '/login', label: 'Login' }
];


function CategoryIcon({ slug }: { slug: string }) {
  const common = 'h-4 w-4 text-brand-info';
  switch (slug) {
    case 'administratie':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 10h18v2H3v-2Zm2 4h14v6H5v-6Zm-.5-9h15l1.5 3H3l1.5-3Z" />
        </svg>
      );
    case 'economie':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 18h16v2H4v-2Zm3-4h2v3H7v-3Zm4-6h2v9h-2V8Zm4 3h2v6h-2v-6Z" />
        </svg>
      );
    case 'legislatie':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 4h10v2H7V4Zm-2 4h14l-1 12H6L5 8Zm3 2v8h2v-8H8Zm6 0v8h2v-8h-2Z" />
        </svg>
      );
    case 'transport':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11v6h-2a2 2 0 11-4 0H11a2 2 0 11-4 0H5v-6Zm3.4-4a.5.5 0 00-.48.35L7.3 9h9.4l-.62-1.65A.5.5 0 0015.6 7H8.4Z" />
        </svg>
      );
    case 'energie':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13 2L4 14h6v8l9-12h-6V2Z" />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M17.414 10.586l-6.999 6.999a2 2 0 01-2.828 0L2 12.999V8a2 2 0 012-2h4.999l5.586 5.586a2 2 0 010 2.828zM7 7a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      );
  }
}

function capitalizeFirst(input: string): string {
  if (!input) return '';
  return input.charAt(0).toUpperCase() + input.slice(1);
}

// Avatar icon mapping
const AVATAR_ICONS = {
  'https://lucide.dev/icons/user': UserIcon,
  'https://lucide.dev/icons/user-check': UserCheck,
  'https://lucide.dev/icons/user-plus': UserPlus,
  'https://lucide.dev/icons/user-minus': UserMinus,
  'https://lucide.dev/icons/user-x': UserX,
  'https://lucide.dev/icons/user-cog': UserCog,
  'https://lucide.dev/icons/user-search': UserSearch,
  'https://lucide.dev/icons/edit-3': Edit3,
  'https://lucide.dev/icons/crown': Crown,
  'https://lucide.dev/icons/shield': Shield,
  'https://lucide.dev/icons/star': Star,
  'https://lucide.dev/icons/heart': Heart,
  'https://lucide.dev/icons/smile': Smile,
  'https://lucide.dev/icons/laugh': Laugh,
  'https://lucide.dev/icons/bot': Bot,
  'https://lucide.dev/icons/zap': Zap,
  'https://lucide.dev/icons/sparkles': Sparkles,
  'https://lucide.dev/icons/target': Target,
  'https://lucide.dev/icons/award': Award,
  'https://lucide.dev/icons/trophy': Trophy
};

function getAvatarIcon(avatarUrl?: string) {
  if (!avatarUrl || !AVATAR_ICONS[avatarUrl as keyof typeof AVATAR_ICONS]) {
    return UserIcon;
  }
  return AVATAR_ICONS[avatarUrl as keyof typeof AVATAR_ICONS];
}

// Hook pentru a obține informațiile despre abonament
function useSubscriptionInfo() {
  const { user, trialStatus } = useAuth();
  const [enhancedProfile, setEnhancedProfile] = useState<EnhancedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setEnhancedProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await subscriptionService.getMyProfile();
        setEnhancedProfile(profile);
      } catch (error) {
        console.error('Error fetching enhanced profile:', error);
        setEnhancedProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return {
    enhancedProfile,
    trialStatus,
    loading
  };
}

// Hook pentru a verifica dacă utilizatorul are acces la categorii
function useCategoriesAccess() {
  const { user, hasPremiumAccess } = useAuth();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Dacă nu este autentificat, nu are acces
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Dacă are premium access, are acces
      if (hasPremiumAccess) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Dacă nu are premium access, verifică dacă există eroare de subscription
      if (categoriesError === 'SUBSCRIPTION_REQUIRED' || categoriesError === 'Failed to fetch categories') {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Dacă încă se încarcă, așteaptă
      if (categoriesLoading) {
        setLoading(true);
        return;
      }

      // Dacă s-au încărcat categoriile cu succes, are acces
      setHasAccess(true);
      setLoading(false);
    };

    checkAccess();
  }, [user, hasPremiumAccess, categoriesLoading, categoriesError]);

  return {
    hasAccess,
    loading
  };
}

// PRO Authentication Button Component
function ProAuthButton() {
  const pathname = usePathname();
  const { user, profile, signOut, loading, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure pathname is always defined before using it
  const safePathname = pathname || '';

  const handleGoogleLogin = async () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${returnUrl}`
      }
    });
    
    if (error) {
      console.error('Error with Google login:', error);
    }
  };

  const handleLinkedInLogin = async () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${returnUrl}`
      }
    });
    
    if (error) {
      console.error('Error with LinkedIn login:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setShowDropdown(false);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setSigningOut(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (loading || signingOut) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-20 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-brand-info/30 rounded-md hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-all"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{user.email}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-info to-brand-accent flex items-center justify-center">
                    {(() => {
                      const AvatarIcon = getAvatarIcon(profile?.avatar_url);
                      return <AvatarIcon className="w-4 h-4 text-white" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.full_name || 'Cont PRO'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors hover:text-brand-info"
                onClick={() => setShowDropdown(false)}
              >
                Profil
              </Link>
              {/*<Link
                href="/profile/preferences"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors hover:text-brand-info"
                onClick={() => setShowDropdown(false)}
              >
                Preferințe
              </Link>*/}
              {/* Admin Button - Only for admin users */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors hover:text-brand-info ${safePathname === '/admin' ? 'text-brand-info' : 'text-gray-600'}`}
                  onClick={() => setShowDropdown(false)}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingOut ? 'Se deconectează...' : 'Deconectare'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent border border-brand-info/30 border-l-0 rounded-md hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-all shadow-sm"
      >
        <span className="font-semibold">PRO</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-brand-info/5 to-brand-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-info to-brand-accent flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PRO</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Acces Premium</h3>
                  <p className="text-xs text-gray-600">Conectează-te pentru funcționalități avansate</p>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700 mb-3">
                Deblochează funcționalități premium precum:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-info"></div>
                  Feed personalizat de știri
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-info"></div>
                  Preferințe avansate de categorii
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-info"></div>
                  Acces prioritar la funcții noi
                </li>
              </ul>
              <div className="text-center">
                <Link
                  href="/preturi"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-brand-info border border-brand-info rounded-lg hover:bg-brand-info/5 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Descoperă planurile
                </Link>
              </div>
            </div>

            <div className="px-4 py-2 border-t border-gray-100 space-y-2">
              <Link
                href={`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent border border-transparent rounded-md hover:from-brand-info/90 hover:to-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <LogIn className="w-4 h-4" />
                Autentificare
              </Link>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">sau</span>
                </div>
              </div>
              
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-colors cursor-not-allowed opacity-50"
                onClick={handleGoogleLogin}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuă cu Google
              </button>
              
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info transition-colors cursor-not-allowed opacity-50"
                onClick={handleLinkedInLogin}
              >
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Continuă cu LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, hasPremiumAccess } = useAuth();
  const { consent } = useConsent();
  const { categories, loading: isLoadingCategories } = useCategories();
  const { enhancedProfile, trialStatus, loading: subscriptionLoading } = useSubscriptionInfo();
  const { hasAccess: hasCategoriesAccess, loading: categoriesAccessLoading } = useCategoriesAccess();
  const [megaOpen, setMegaOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const megaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Removed setOpen(false) since 'open' is not used
      }
      if (megaRef.current && !megaRef.current.contains(target)) setMegaOpen(false);
    }
    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick);
  }, []);
  
  // Ensure pathname is always defined before using it
  const safePathname = pathname || '';
  
  return (
    <header className="sticky top-0 z-[80] border-b bg-white/80 backdrop-blur">
      <div className="container-responsive flex h-[var(--header-height)] items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold tracking-tight">
          <Image src="/logo.png" alt={process.env.NEXT_PUBLIC_SITE_NAME || 'Decodorul Oficial'} width={32} height={32} className="h-8 w-8 object-contain" />
          <div className="flex items-center gap-2">
            <span>{process.env.NEXT_PUBLIC_SITE_NAME}</span>
            {user && !subscriptionLoading && (
            <div className="flex items-center gap-2">
              {/* Badge pentru tipul de abonament cu trial ca superscript */}
              <div className="relative inline-flex items-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-brand-info to-brand-accent text-white shadow-sm">
                  {enhancedProfile?.profile?.activeSubscription?.tier?.displayName || 'PRO'}
                </span>
                
                {/* Trial ca superscript */}
                {trialStatus?.isTrial && !trialStatus?.expired && trialStatus?.daysRemaining !== null && (
                  <span className="absolute -top-3 left-10 inline-flex items-center justify-center min-w-[60px] h-5 px-2 text-[10px] font-bold bg-gradient-to-r from-brand-info/10 to-brand-accent/10 border border-brand-info/20 text-gray-700 rounded-full shadow-sm border border-white whitespace-nowrap">
                    Trial - {trialStatus.daysRemaining}{trialStatus.daysRemaining === 1 ? ' zi' : trialStatus.daysRemaining > 1 ? ' zile' : ''}
                  </span>
                )}
              </div>
            </div>
            )}
          </div>
        </Link>
        <nav className="hidden items-center md:flex">
          {/* Home */}
          <Link
            href={navItems[0].href}
            className={`text-sm font-medium transition-colors hover:text-brand-info ${safePathname === navItems[0].href ? 'text-brand-info' : 'text-gray-600'}`}
          >
            {navItems[0].label}
          </Link>
          <span className="text-gray-300 mx-2">|</span>

          {/* Cautare Avansata - Only for authenticated users with premium access */}
          {isAuthenticated && hasPremiumAccess && (
            <>
              <Link
                href={navItems[1].href}
                className={`text-sm font-medium transition-colors hover:text-brand-info ${safePathname === navItems[1].href ? 'text-brand-info' : 'text-gray-600'}`}
              >
                {navItems[1].label}
              </Link>
              <span className="text-gray-300 mx-2">|</span>
            </>
          )}

          {/* Keep other links */}
          {navItems.slice(2).map((item, index) => {
            const active = safePathname === item.href;
            
            // Hide Favorite link for non-authenticated, non-premium users, or no cookie consent
            if (item.href === '/favorite' && (!isAuthenticated || !hasPremiumAccess || !consent)) {
              return null;
            }
            
            return (
              <React.Fragment key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-brand-info ${active ? 'text-brand-info' : 'text-gray-600'}`}
                >
                  {item.label}
                </Link>
                <span className="text-gray-300 mx-2">|</span>
              </React.Fragment>
            );
          })}

          {/* Full width Mega Menu trigger - Only for users with categories access */}
          {hasCategoriesAccess === true ? (
            isLoadingCategories ? (
              <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" aria-hidden />
            ) : categories.length > 0 ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="text-sm font-medium text-gray-600 hover:text-brand-info transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMegaOpen((v) => !v);
                  }}
                  aria-expanded={megaOpen}
                >
                  Categorii
                </button>
              </div>
            ) : (
              <button className="text-sm font-medium text-gray-400 cursor-not-allowed" disabled>
                Categorii
              </button>
            )
          ) : null}

          {/* Add separator before search if categories are shown */}
          {hasCategoriesAccess === true && (
            <span className="text-gray-300 mx-2">|</span>
          )}

          {/* Search */}
          <div className="ml-1">
            <SearchSpotlight />
          </div>

          {/* PRO Authentication Button */}
          <div className="ml-6">
            <ProAuthButton />
          </div>

        </nav>
        <div className="md:hidden flex items-center gap-2">
          <SearchSpotlight />
          <MobileMenu />
        </div>
      </div>
      {/* Mega Menu Panel - Only for users with categories access */}
      {hasCategoriesAccess === true && megaOpen && categories.length > 0 && (
        <div
          ref={megaRef}
          className="fixed inset-x-0 top-[var(--header-height)] z-[100] border-b border-t bg-white shadow-xl ring-1 ring-black/5 overflow-hidden rounded-b-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="container-responsive py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Categorii</span>
              <button
                aria-label="Închide"
                className="p-2 rounded hover:bg-gray-100 text-gray-600"
                onClick={() => setMegaOpen(false)}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="mt-2 max-h-[50vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xl:gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/categorii/${c.slug}`}
                    className="group flex items-start gap-2.5 rounded-md border border-transparent p-1.5 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => setMegaOpen(false)}
                  >
                    <div className="mt-1">
                      <CategoryIcon slug={c.slug} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 group-hover:text-brand-info">
                        {capitalizeFirst(c.name)}
                      </div>
                      <div className="text-xs text-gray-500">{c.count} articole</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


