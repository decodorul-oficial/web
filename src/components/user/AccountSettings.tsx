'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserService } from '@/features/user/services/userService';
import { InlineEditableDisplayName, AvatarSelector } from '@/components/user';
import { LogOut, Bookmark, Bell, Key, Edit3 } from 'lucide-react';

interface AccountSettingsProps {
  onSignOut: () => void;
  isSigningOut: boolean;
}

export function AccountSettings({ onSignOut, isSigningOut }: AccountSettingsProps) {
  const { user, profile, refreshProfile } = useAuth();

  const handleDisplayNameSave = async (newDisplayName: string): Promise<boolean> => {
    const success = await UserService.updateProfile({ displayName: newDisplayName });
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  const handleAvatarSelect = async (avatarUrl: string): Promise<boolean> => {
    const success = await UserService.updateProfile({ avatarUrl });
    if (success) {
      await refreshProfile();
    }
    return success;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Profile Information */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {/* Avatar with Click to Edit */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-info to-brand-accent flex items-center justify-center">
              <AvatarSelector
                currentAvatarUrl={profile?.avatarUrl || profile?.avatar_url}
                onAvatarSelect={handleAvatarSelect}
                className="w-16 h-16"
              />
            </div>
          </div>
          
          {/* User Details */}
          <div>
            <InlineEditableDisplayName
              value={profile?.displayName || profile?.full_name || ''}
              onSave={handleDisplayNameSave}
              placeholder="Numele complet"
              className="text-lg font-semibold text-gray-900"
            />
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        
      </div>

      {/* Security and Preferences Actions */}
      <div className="space-y-2">
        <a
          href="/profile/saved-searches"
          className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Bookmark className="w-5 h-5 text-gray-500 group-hover:text-brand-info transition-colors mr-3" />
          <span className="text-gray-900 font-medium">Căutări Salvate</span>
        </a>

        <a
          href="/profile/preferences"
          className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Bell className="w-5 h-5 text-gray-500 group-hover:text-brand-info transition-colors mr-3" />
          <span className="text-gray-900 font-medium">Setări Notificări</span>
        </a>

        <a
          href="/profile/change-password"
          className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Key className="w-5 h-5 text-gray-500 group-hover:text-brand-info transition-colors mr-3" />
          <span className="text-gray-900 font-medium">Schimbă Parola</span>
        </a>

        {/* Sign Out - Destructive Action */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <button
            onClick={onSignOut}
            disabled={isSigningOut}
            className="flex items-center space-x-3 text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">
              {isSigningOut ? 'Se deconectează...' : 'Deconectare'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
