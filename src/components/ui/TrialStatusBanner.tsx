'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function TrialStatusBanner() {
  const { isAuthenticated, trialStatus } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Verifică dacă banner-ul trebuie afișat
  const shouldShowBanner = isAuthenticated && trialStatus?.isTrial && !trialStatus.expired;

  // Funcție pentru a reseta timer-ul de ascundere
  const resetHideTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      setIsExpanded(false);
    }, 15000); // 15 secunde
    setTimeoutId(newTimeoutId);
  };

  // Funcție pentru a gestiona hover-ul
  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsExpanded(true);
    resetHideTimer();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    resetHideTimer();
  };

  // Funcție pentru a gestiona click-ul pe mobil
  const handleClick = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      resetHideTimer();
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  };

  // Cleanup la unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Nu afișa banner-ul dacă utilizatorul nu este autentificat sau nu are trial activ
  if (!shouldShowBanner) {
    return null;
  }

  // Animații
  const iconVariants = {
    collapsed: {
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    expanded: {
      scale: 1.1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Animație de pulse pentru icon când este colapsat
  const pulseVariants = {
    pulse: {
      scale: [1.2, 1.50, 1.2],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    },
    stop: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const
      }
    }
  };

  const bannerVariants = {
    collapsed: {
      width: "44px", // Aceeași dimensiune ca butonul de font (w-11 = 44px)
      height: "44px",
      paddingLeft: "12px",
      paddingRight: "12px",
      paddingTop: "12px",
      paddingBottom: "12px",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    expanded: {
      width: "auto",
      height: "44px", // Păstrăm înălțimea constantă
      paddingLeft: "12px",
      paddingRight: "12px",
      paddingTop: "12px",
      paddingBottom: "12px",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  const contentVariants = {
    collapsed: {
      opacity: 0,
      width: 0,
      marginLeft: 0,
      x: -20, // Animație de la stânga
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const
      }
    },
    expanded: {
      opacity: 1,
      width: "auto",
      marginLeft: "8px",
      x: 0, // Poziția finală
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
        delay: 0.1
      }
    }
  };

  return (
    <motion.div
      className="backdrop-blur bg-white/80 border border-blue-100 shadow-lg rounded-full flex items-center justify-center cursor-pointer"
      variants={bannerVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
        <motion.div
          variants={iconVariants}
          animate={isExpanded ? "expanded" : "collapsed"}
        >
          <motion.div
            variants={pulseVariants}
            animate={isExpanded ? "stop" : "pulse"}
          >
            <Clock className="w-4 h-4 text-brand-info" />
          </motion.div>
        </motion.div>
        
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="flex items-center gap-2"
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            <span className="text-xs text-brand-accent font-medium whitespace-nowrap">
              {trialStatus.daysRemaining} zile rămase din trial Pro
            </span>
            <Link
              href="/profile"
              className="text-xs text-brand-info hover:text-brand-info font-semibold underline whitespace-nowrap"
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
            >
              Upgrade
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
