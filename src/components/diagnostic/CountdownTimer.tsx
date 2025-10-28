'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  nextRun: string | null;
  lastRun: string | null;
  status?: string;
  className?: string;
}

export function CountdownTimer({ nextRun, lastRun, status, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('Calculând...');
  const [isExpired, setIsExpired] = useState(false);
  const [hasRunBefore, setHasRunBefore] = useState<boolean>(false);

  useEffect(() => {
    // Verifică dacă job-ul a rulat vreodată
    setHasRunBefore(!!lastRun);

    if (!nextRun) {
      setTimeLeft('Nu este programat');
      setIsExpired(false);
      return;
    }

    const calculateTimeLeft = () => {
      try {
        const now = new Date().getTime();
        const nextRunTime = new Date(nextRun).getTime();
        
        // Verifică dacă data este validă
        if (isNaN(nextRunTime)) {
          setTimeLeft('Data invalidă');
          setIsExpired(false);
          return;
        }
        
        const difference = nextRunTime - now;

        // Pentru job-urile IDLE, afișează întotdeauna countdown-ul către următoarea rulare
        // Pentru că IDLE înseamnă că job-ul este activ și va rula în viitor
        if (status === 'IDLE') {
          if (difference <= 0) {
            // Dacă nextRun a trecut pentru un job IDLE, înseamnă că job-ul ar trebui să ruleze acum
            // Pentru job-urile IDLE, afișăm că va rula în curând
            setTimeLeft('Va rula în curând');
            setIsExpired(false);
          } else {
            // Afișează countdown-ul real către următoarea rulare
            setIsExpired(false);
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            if (days > 0) {
              setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else if (hours > 0) {
              setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else if (minutes > 0) {
              setTimeLeft(`${minutes}m ${seconds}s`);
            } else {
              setTimeLeft(`${seconds}s`);
            }
          }
          return;
        }

        // Pentru alte statusuri, folosește logica veche
        if (difference <= 0) {
          setIsExpired(true);
          // Dacă nextRun a trecut și lastRun este null sau mai vechi decât nextRun, 
          // înseamnă că job-ul nu a rulat după ce a fost programat
          if (!lastRun) {
            setTimeLeft('Programat - nu a rulat');
          } else {
            const lastRunTime = new Date(lastRun).getTime();
            if (lastRunTime < nextRunTime) {
              setTimeLeft('Programat - nu a rulat');
            } else {
              setTimeLeft('Tocmai a rulat');
            }
          }
          return;
        }

        setIsExpired(false);

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } catch {
        setTimeLeft('Eroare calculare');
        setIsExpired(false);
      }
    };

    // Calculează imediat
    calculateTimeLeft();

    // Actualizează la fiecare secundă
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [nextRun, lastRun, status]);

  const getTextColor = () => {
    if (!nextRun) return 'text-gray-500';
    
    // Pentru job-urile IDLE, "Va rula în curând" nu trebuie să fie roșu
    if (status === 'IDLE' && timeLeft === 'Va rula în curând') {
      return 'text-blue-600 font-medium';
    }
    
    // Pentru job-urile DISABLED, "Programat - nu a rulat" nu trebuie să fie roșu
    if (status === 'DISABLED' && timeLeft.includes('nu a rulat')) {
      return 'text-gray-600 font-medium';
    }
    
    if (isExpired) {
      // Dacă a expirat, verifică dacă a rulat sau nu
      if (timeLeft.includes('nu a rulat')) {
        return 'text-red-600 font-semibold';
      } else {
        return 'text-green-600';
      }
    }
    
    try {
      // Dacă mai sunt mai puțin de 5 minute, afișează cu roșu
      const now = new Date().getTime();
      const nextRunTime = new Date(nextRun).getTime();
      const difference = nextRunTime - now;
      
      if (difference < 1 * 60 * 1000) { // 1 minut
        return 'text-red-600 font-bold';
      } else if (difference < 5 * 60 * 1000) { // 5 minute
        return 'text-orange-600 font-semibold';
      } else if (difference < 30 * 60 * 1000) { // 30 minute
        return 'text-yellow-600';
      }
      
      return 'text-blue-600';
    } catch {
      return 'text-gray-500';
    }
  };

  const getPulseAnimation = () => {
    if (!nextRun) return '';
    
    // Dacă a expirat și nu a rulat, afișează pulsare pentru atenționare
    if (isExpired && timeLeft.includes('nu a rulat')) {
      return 'animate-pulse';
    }
    
    try {
      const now = new Date().getTime();
      const nextRunTime = new Date(nextRun).getTime();
      const difference = nextRunTime - now;
      
      if (difference < 1 * 60 * 1000) { // 1 minut
        return 'animate-pulse';
      }
    } catch {
      // Ignore errors
    }
    
    return '';
  };

  const formatNextRunTime = () => {
    if (!nextRun) return null;
    try {
      const nextRunTime = new Date(nextRun);
      return nextRunTime.toLocaleString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return null;
    }
  };

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <div className="flex items-center space-x-1">
        <Clock className={`w-4 h-4 text-gray-500 ${getPulseAnimation()}`} />
        <span className={`text-sm font-medium ${getTextColor()}`}>
          {timeLeft}
        </span>
      </div>
      {nextRun && !isExpired && (
        <div className="text-xs text-gray-500 ml-5">
          Programat: {formatNextRunTime()}
        </div>
      )}
    </div>
  );
}
