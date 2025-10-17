'use client';

import { useState, useEffect, useRef } from 'react';
import { User, LogIn, Mail, Github } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './AuthProvider';
import Link from 'next/link';

export function LoginButton() {
  const { user, signOut, loading, trialStatus, hasPremiumAccess } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Error with Google login:', error);
    }
  };

  const handleLinkedInLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
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

  // Închide dropdown-ul când se face click în afara lui
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
        <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <User className="w-4 h-4" />
          <span>{user.email}</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              {/* Trial Status Banner */}
              {trialStatus?.isTrial && !trialStatus.expired && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
                  <div className="text-xs text-blue-600 font-medium">
                    Trial Pro - {trialStatus.daysRemaining} zile rămase
                  </div>
                </div>
              )}
              
              {trialStatus?.expired && (
                <div className="px-4 py-2 bg-orange-50 border-b border-orange-200">
                  <div className="text-xs text-orange-600 font-medium">
                    Trial expirat - Upgrade pentru a continua
                  </div>
                </div>
              )}

              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                Profil
              </Link>
              <Link
                href="/profile/preferences"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                Preferințe
              </Link>
              <Link
                href="/preturi"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                Abonamente
              </Link>
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
    <div className="flex items-center space-x-2">
      <Link
        href="/login"
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Autentificare
      </Link>
      
      <button
        onClick={handleGoogleLogin}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Mail className="w-4 h-4 mr-2" />
        Google
      </button>
      
      <button
        onClick={handleLinkedInLogin}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
        LinkedIn
      </button>
    </div>
  );
}
