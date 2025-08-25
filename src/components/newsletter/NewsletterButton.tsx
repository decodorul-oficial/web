'use client';

import { useNewsletterContext } from './NewsletterProvider';

interface NewsletterButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const NewsletterButton = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '',
  children 
}: NewsletterButtonProps) => {
  const { showNewsletterModal } = useNewsletterContext();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-brand-info text-white hover:bg-brand-highlight focus:ring-brand-info',
    secondary: 'bg-brand-highlight text-white hover:bg-brand focus:ring-brand-highlight',
    outline: 'border border-brand-info text-brand-info hover:bg-brand-info/10 focus:ring-brand-info'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      onClick={showNewsletterModal}
      className={classes}
      aria-label="Înscrie-te la newsletter"
    >
      {children || (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Newsletter
        </>
      )}
    </button>
  );
};
