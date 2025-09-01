'use client';

import { useState, useEffect } from 'react';
import { 
  Share2, 
  Check, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail,
  Link as LinkIcon
} from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'floating';
  showLabels?: boolean;
}

export function ShareButtons({ 
  url, 
  title, 
  description = '', 
  className = '',
  variant = 'horizontal',
  showLabels = true
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Eroare la copierea link-ului:', err);
      // Fallback pentru browsere mai vechi
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareData = {
    title,
    text: description,
    url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Eroare la partajare:', err);
      }
    }
  };

  const shareButtons = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-600 hover:text-white',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
      label: 'Partajează pe Facebook'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-sky-500 hover:text-white',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      label: 'Partajează pe Twitter'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-700 hover:text-white',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      label: 'Partajează pe LinkedIn'
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'hover:bg-gray-600 hover:text-white',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${description}\n\n${url}`)}`,
      label: 'Trimite prin email'
    }
  ];

  const baseButtonClasses = "flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all duration-200 border border-gray-200 bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px]";

  const containerClasses = {
    horizontal: "flex items-center gap-1.5 sm:gap-2 flex-wrap",
    vertical: "flex flex-col items-center gap-2",
    floating: "fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200"
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* Copy Link Button - Always first */}
      <button
        onClick={handleCopyLink}
        className={`${baseButtonClasses} ${copied ? 'bg-green-50 border-green-200 text-green-700' : 'hover:bg-gray-50'}`}
        title="Copiază link-ul"
        aria-label="Copiază link-ul"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
        {showLabels && (
          <span className="ml-2 text-sm font-medium hidden sm:inline">
            {copied ? 'Copiat!' : 'Copiază link'}
          </span>
        )}
      </button>

      {/* Native Share Button (mobile) */}
      {isClient && typeof navigator.share === 'function' && (
        <button
          onClick={handleNativeShare}
          className={`${baseButtonClasses} hover:bg-brand hover:text-white`}
          title="Partajează"
          aria-label="Partajează"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {showLabels && (
            <span className="ml-2 text-sm font-medium hidden sm:inline">Partajează</span>
          )}
        </button>
      )}

      {/* Social Media Share Buttons */}
      {shareButtons.map((button) => (
        <a
          key={button.name}
          href={button.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseButtonClasses} ${button.color}`}
          title={button.label}
          aria-label={button.label}
        >
          <button.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {showLabels && (
            <span className="ml-2 text-sm font-medium hidden sm:inline">{button.name}</span>
          )}
        </a>
      ))}
    </div>
  );
}

// Floating Share Sidebar Component
export function FloatingShareSidebar({ url, title, description }: Omit<ShareButtonsProps, 'variant' | 'className' | 'showLabels'>) {
  return (
    <div className="hidden lg:block">
      <ShareButtons
        url={url}
        title={title}
        description={description}
        variant="floating"
        showLabels={false}
      />
    </div>
  );
}

// Article Share Section Component
export function ArticleShareSection({ url, title, description }: Omit<ShareButtonsProps, 'variant' | 'className' | 'showLabels'>) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Ți-a plăcut acest articol?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0 sm:ml-2">
            Distribuie-l cu prietenii și colegii tăi!
          </p>
        </div>
        <Share2 className="w-5 h-5 text-gray-500" />
      </div>
      <ShareButtons
        url={url}
        title={title}
        description={description}
        variant="horizontal"
        showLabels={true}
        className="justify-start flex-wrap gap-2"
      />
    </div>
  );
}
