'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToggleEmailNotifications, useEmailNotificationInfo } from '@/features/saved-searches/hooks/useSavedSearches';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import toast from 'react-hot-toast';

interface NotificationBellProps {
  searchId: string;
  searchName: string;
  isEnabled: boolean;
  onToggle?: () => void;
  className?: string;
}

export function NotificationBell({ 
  searchId, 
  searchName, 
  isEnabled, 
  onToggle,
  className = ''
}: NotificationBellProps) {
  const { user, hasPremiumAccess } = useAuth();
  const { data: notificationInfo, refetch: refetchNotificationInfo } = useEmailNotificationInfo();
  const { toggleEmailNotifications, loading } = useToggleEmailNotifications();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (!user || !hasPremiumAccess) {
      toast.error('Funcționalitate disponibilă pentru abonamentele PRO și Enterprise.');
      return;
    }

    if (!notificationInfo?.canEnableMore && !isEnabled) {
      toast.error(`Ați atins limita de ${notificationInfo?.limit} notificări active.`);
      return;
    }

    setIsToggling(true);
    
    try {
      const result = await toggleEmailNotifications(searchId, !isEnabled);
      if (result) {
        const message = !isEnabled 
          ? `Notificările pentru căutarea "${searchName}" au fost activate.`
          : `Notificările pentru căutarea "${searchName}" au fost dezactivate.`;
        
        toast.success(message);
        
        // Refetch notification info to update the counter
        refetchNotificationInfo();
        
        // Call the optional callback
        if (onToggle) {
          onToggle();
        }
      }
    } catch (error) {
      console.error('Error toggling email notifications:', error);
      toast.error('A apărut o eroare. Vă rugăm să încercați din nou.');
    } finally {
      setIsToggling(false);
    }
  };

  // Determine if the bell should be disabled
  const isDisabled = !user || !hasPremiumAccess || (!notificationInfo?.canEnableMore && !isEnabled);
  
  // Determine the tooltip message
  const getTooltipMessage = () => {
    if (!user || !hasPremiumAccess) {
      return 'Funcționalitate disponibilă pentru abonamentele PRO și Enterprise.';
    }
    
    if (!notificationInfo?.canEnableMore && !isEnabled) {
      return `Ați atins limita de ${notificationInfo?.limit} notificări active.`;
    }
    
    return isEnabled 
      ? 'Dezactivează notificările email pentru această căutare'
      : 'Activează notificările email pentru această căutare';
  };

  const BellIcon = isEnabled ? Bell : BellOff;
  const iconColor = isEnabled ? 'text-brand-info' : 'text-gray-400';
  const hoverColor = isEnabled ? 'hover:text-brand-highlight' : 'hover:text-brand-info';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            disabled={isDisabled || loading || isToggling}
            className={`p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${iconColor} ${!isDisabled ? hoverColor : ''} ${className}`}
            title={getTooltipMessage()}
          >
            {loading || isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BellIcon className="h-4 w-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

