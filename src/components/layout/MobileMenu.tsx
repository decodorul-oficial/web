"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useConsent } from '@/components/cookies/ConsentProvider';
import { useCategories } from '@/contexts/CategoriesContext';
import { User, LogIn, Settings } from 'lucide-react';
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

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { categories } = useCategories();
  const { user, profile, signOut, loading, isAuthenticated, hasPremiumAccess, isAdmin } = useAuth();
  const { consent } = useConsent();
  const [signingOut, setSigningOut] = useState(false);

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
    setOpen(false);
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
    setOpen(false);
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setOpen(false);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setSigningOut(false);
    }
  };
  
  useEffect(() => {
    const el = document.querySelector('.disclaimer-banner') as HTMLElement | null;
    if (!el) return;
    if (open) el.style.display = 'none';
    else el.style.display = '';
    return () => {
      if (el) el.style.display = '';
    };
  }, [open]);
  
  return (
    <div className="flex items-center gap-3 md:hidden">
      {/* Search button visible on mobile */}
      <div>
        {/* Reuse spotlight trigger by rendering its button only */}
        {/* For simplicity, we mount full component; it renders just the icon until opened */}
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <></>
      </div>
      <button
        aria-label="Deschide meniul"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-md border text-gray-700"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
        </svg>
      </button>
      {open &&
        createPortal(
          <div className="fixed left-0 right-0 bottom-0 top-[var(--header-height)] z-[1000] bg-white/80 backdrop-blur" onClick={() => setOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-full p-4 overflow-y-auto overscroll-contain" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-semibold">Meniu</span>
                <button className="p-1" onClick={() => setOpen(false)} aria-label="Închide">
                  ✕
                </button>
              </div>
              <nav className="space-y-1">
                <Link 
                  href="/" 
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-accent transition-colors" 
                  onClick={() => setOpen(false)}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                  Acasă
                </Link>
                {/* Căutare Avansată - Only for authenticated users with premium access */}
                {isAuthenticated && hasPremiumAccess && (
                  <Link
                    href="/stiri"
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-accent transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    Căutare Avansată
                  </Link>
                )}
                <Link 
                  href="/sinteza-zilnica" 
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-accent transition-colors" 
                  onClick={() => setOpen(false)}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Sinteza Zilnică
                </Link>
                
                {/* Știri Favorite link - Only for authenticated users with premium access and cookie consent */}
                {isAuthenticated && hasPremiumAccess && consent && (
                  <Link 
                    href="/favorite" 
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-accent transition-colors" 
                    onClick={() => setOpen(false)}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    Știri Favorite
                  </Link>
                )}

                {/* Categories section - Only for authenticated users */}
                {user && categories.length > 0 && (
                  <details className="group">
                    <summary className="flex items-center gap-3 cursor-pointer select-none rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-accent transition-colors list-none">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      Categorii
                      <svg className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6,9 12,15 18,9"/>
                      </svg>
                    </summary>
                    <div className="ml-6 mt-1 space-y-1">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/categorii/${c.slug}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-accent capitalize transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <span>{c.name}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{c.count}</span>
                        </Link>
                      ))}
                    </div>
                  </details>
                )}

                {/* Authentication Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {loading || signingOut ? (
                    <div className="px-2 py-2 text-sm text-gray-500">
                      {signingOut ? 'Se deconectează...' : 'Se încarcă...'}
                    </div>
                  ) : user ? (
                    <div className="space-y-2">
                      <div className="px-2 py-2 bg-gradient-to-r from-brand-info/10 to-brand-accent/10 rounded-md border border-brand-info/20">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-brand-info to-brand-accent flex items-center justify-center">
                            {(() => {
                              const AvatarIcon = getAvatarIcon(profile?.avatar_url);
                              return <AvatarIcon className="w-3 h-3 text-white" />;
                            })()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-brand-accent">
                              {profile?.full_name || 'Cont PRO'}
                            </p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 rounded px-2 py-2 hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profil
                      </Link>
                      <Link
                        href="/profile/preferences"
                        className="flex items-center gap-2 rounded px-2 py-2 hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Preferințe
                      </Link>
                      {/* Admin section - Only for admin users */}
                      {isAdmin && (
                        <Link 
                          href="/admin" 
                          className="flex items-center gap-2 rounded-lg px-2 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-accent transition-colors" 
                          onClick={() => setOpen(false)}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 15l-3-3h6l-3 3z"/>
                            <path d="M12 3l3 3H9l3-3z"/>
                            <path d="M12 21l-3-3h6l-3 3z"/>
                            <path d="M3 12l3-3v6l-3-3z"/>
                            <path d="M21 12l-3-3v6l3-3z"/>
                          </svg>
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="flex items-center gap-2 w-full text-left rounded px-2 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LogIn className="w-4 h-4" />
                        Deconectare
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="px-3 py-3 bg-gradient-to-r from-brand-info/10 to-brand-accent/10 rounded-lg border border-brand-info/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-info to-brand-accent flex items-center justify-center">
                            <span className="text-white font-bold text-sm">PRO</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-brand-accent">Acces Premium</p>
                            <p className="text-xs text-gray-600">Conectează-te pentru funcționalități avansate</p>
                          </div>
                          <Link
                            href="/preturi"
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-brand-info border border-brand-info rounded-md hover:bg-brand-info/5 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            Descoperă planurile
                          </Link>
                        </div>
                      </div>
                      
                      <Link
                        href={`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                        className="flex items-center gap-3 w-full text-left rounded-lg px-3 py-3 text-base font-medium text-white bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <LogIn className="w-5 h-5" />
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
                        onClick={handleGoogleLogin}
                        className="flex items-center gap-3 w-full text-left rounded-lg px-3 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-not-allowed opacity-50"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continuă cu Google
                      </button>
                      <button
                        disabled
                        onClick={handleLinkedInLogin}
                        className="flex items-center gap-3 w-full text-left rounded-lg px-3 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-not-allowed opacity-50"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Continuă cu LinkedIn
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}


