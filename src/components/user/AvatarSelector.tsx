'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  User, 
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

interface AvatarSelectorProps {
  currentAvatarUrl?: string;
  onAvatarSelect: (avatarUrl: string) => Promise<boolean>;
  className?: string;
}

const AVATAR_ICONS = [
  { name: 'User', icon: User, url: 'https://lucide.dev/icons/user' },
  { name: 'UserCheck', icon: UserCheck, url: 'https://lucide.dev/icons/user-check' },
  { name: 'UserPlus', icon: UserPlus, url: 'https://lucide.dev/icons/user-plus' },
  { name: 'UserMinus', icon: UserMinus, url: 'https://lucide.dev/icons/user-minus' },
  { name: 'UserX', icon: UserX, url: 'https://lucide.dev/icons/user-x' },
  { name: 'UserCog', icon: UserCog, url: 'https://lucide.dev/icons/user-cog' },
  { name: 'UserSearch', icon: UserSearch, url: 'https://lucide.dev/icons/user-search' },
  { name: 'Edit3', icon: Edit3, url: 'https://lucide.dev/icons/edit-3' },
  { name: 'Crown', icon: Crown, url: 'https://lucide.dev/icons/crown' },
  { name: 'Shield', icon: Shield, url: 'https://lucide.dev/icons/shield' },
  { name: 'Star', icon: Star, url: 'https://lucide.dev/icons/star' },
  { name: 'Heart', icon: Heart, url: 'https://lucide.dev/icons/heart' },
  { name: 'Smile', icon: Smile, url: 'https://lucide.dev/icons/smile' },
  { name: 'Laugh', icon: Laugh, url: 'https://lucide.dev/icons/laugh' },
  { name: 'Bot', icon: Bot, url: 'https://lucide.dev/icons/bot' },
  { name: 'Zap', icon: Zap, url: 'https://lucide.dev/icons/zap' },
  { name: 'Sparkles', icon: Sparkles, url: 'https://lucide.dev/icons/sparkles' },
  { name: 'Target', icon: Target, url: 'https://lucide.dev/icons/target' },
  { name: 'Award', icon: Award, url: 'https://lucide.dev/icons/award' },
  { name: 'Trophy', icon: Trophy, url: 'https://lucide.dev/icons/trophy' }
];

export function AvatarSelector({ 
  currentAvatarUrl, 
  onAvatarSelect, 
  className = "" 
}: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find current avatar icon
  const currentAvatar = AVATAR_ICONS.find(avatar => avatar.url === currentAvatarUrl) || AVATAR_ICONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (avatarUrl === currentAvatarUrl) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const success = await onAvatarSelect(avatarUrl);
      if (success) {
        setIsOpen(false);
      } else {
        setError('Eroare la salvarea avatarului. Te rugăm să încerci din nou.');
      }
    } catch {
      setError('Eroare la salvarea avatarului. Te rugăm să încerci din nou.');
    } finally {
      setIsSaving(false);
    }
  };

  const isLarge = className?.includes('w-16');
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className={`flex items-center justify-center bg-gradient-to-r from-brand-info to-brand-accent hover:from-brand-info/90 hover:to-brand-accent/90 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLarge ? 'w-16 h-16' : 'w-12 h-12'}`}
        title="Schimbă avatarul"
      >
        <currentAvatar.icon className={`text-white ${isLarge ? 'w-8 h-8' : 'w-6 h-6'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Alege un avatar</h3>
          
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_ICONS.map((avatar) => {
              const IconComponent = avatar.icon;
              const isSelected = avatar.url === currentAvatarUrl;
              
              return (
                <button
                  key={avatar.name}
                  onClick={() => handleAvatarSelect(avatar.url)}
                  disabled={isSaving}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={avatar.name}
                >
                  <IconComponent className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
            >
              Anulează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
