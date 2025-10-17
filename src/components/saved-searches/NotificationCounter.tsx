'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useEmailNotificationInfo } from '@/features/saved-searches/hooks/useSavedSearches';
import { Bell } from 'lucide-react';

interface NotificationCounterProps {
  className?: string;
}

export function NotificationCounter({ className = '' }: NotificationCounterProps) {
  const { user, hasPremiumAccess } = useAuth();
  const { data: notificationInfo, loading } = useEmailNotificationInfo();

  // Don't show counter for users without premium access
  if (!user || !hasPremiumAccess) {
    return null;
  }

  // Don't show counter while loading
  if (loading || !notificationInfo) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
      <Bell className="h-4 w-4" />
      <span>
        Notificări active: <span className="font-medium">{notificationInfo.currentCount}</span> / <span className="font-medium">{notificationInfo.limit}</span>
      </span>
    </div>
  );
}

