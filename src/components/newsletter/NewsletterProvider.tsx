'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { NewsletterModal } from './NewsletterModal';
import { markNewsletterSubscribed } from '../../lib/utils/newsletterTracking';

interface NewsletterContextType {
  showNewsletterModal: () => void;
  hideNewsletterModal: () => void;
  isNewsletterModalOpen: boolean;
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

export const useNewsletterContext = () => {
  const context = useContext(NewsletterContext);
  if (context === undefined) {
    throw new Error('useNewsletterContext must be used within a NewsletterProvider');
  }
  return context;
};

interface NewsletterProviderProps {
  children: ReactNode;
}

export const NewsletterProvider = ({ children }: NewsletterProviderProps) => {
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  const showNewsletterModal = () => setIsNewsletterModalOpen(true);
  const hideNewsletterModal = () => setIsNewsletterModalOpen(false);

  const handleNewsletterSuccess = () => {
    // Marchează utilizatorul ca fiind abonat la newsletter
    markNewsletterSubscribed();
    console.log('Newsletter subscription successful - user marked as subscribed');
  };

  return (
    <NewsletterContext.Provider
      value={{
        showNewsletterModal,
        hideNewsletterModal,
        isNewsletterModalOpen,
      }}
    >
      {children}
      <NewsletterModal
        isOpen={isNewsletterModalOpen}
        onClose={hideNewsletterModal}
        onSuccess={handleNewsletterSuccess}
      />
    </NewsletterContext.Provider>
  );
};
