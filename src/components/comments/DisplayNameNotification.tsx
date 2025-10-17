'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserService } from '@/features/user/services/userService';
import { X, User, AlertCircle } from 'lucide-react';

interface DisplayNameNotificationProps {
  onDisplayNameSet?: (displayName: string) => void;
  onContinueWithoutName?: () => void;
  className?: string;
}

export function DisplayNameNotification({
  onDisplayNameSet,
  onContinueWithoutName,
  className = ''
}: DisplayNameNotificationProps) {
  const { profile, refreshProfile } = useAuth();
  const [isSettingName, setIsSettingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showNotification, setShowNotification] = useState(true);

  const handleSetDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim() || isSettingName) {
      return;
    }

    setIsSettingName(true);
    try {
      const success = await UserService.updateProfile({ displayName: displayName.trim() });
      if (success) {
        await refreshProfile();
        onDisplayNameSet?.(displayName.trim());
        setShowNotification(false);
      }
    } catch (error) {
      console.error('Error setting display name:', error);
    } finally {
      setIsSettingName(false);
    }
  };

  const handleContinueWithoutName = () => {
    onContinueWithoutName?.();
    setShowNotification(false);
  };

  // Don't show notification if user already has a display name
  if (!showNotification || (profile?.displayName || profile?.full_name)) {
    return null;
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800 mb-2">
            Numele de afișare nu este setat
          </h3>
          <p className="text-sm text-amber-700 mb-4">
            Pentru a afișa un nume personalizat cu comentariile dvs., vă rugăm să setați un nume de afișare.
            Altfel, comentariile vor apărea cu "Utilizator necunoscut".
          </p>
          
          <form onSubmit={handleSetDisplayName} className="space-y-3">
            <div>
              <label htmlFor="display-name" className="sr-only">
                Numele de afișare
              </label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-amber-600" />
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Introduceți numele de afișare"
                  className="flex-1 px-3 py-2 border border-amber-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={isSettingName}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={!displayName.trim() || isSettingName}
                className="inline-flex items-center px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSettingName ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Se salvează...
                  </>
                ) : (
                  'Setează numele'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleContinueWithoutName}
                disabled={isSettingName}
                className="inline-flex items-center px-3 py-2 text-amber-700 text-sm font-medium hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuă fără nume
              </button>
            </div>
          </form>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleContinueWithoutName}
            disabled={isSettingName}
            className="text-amber-400 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
