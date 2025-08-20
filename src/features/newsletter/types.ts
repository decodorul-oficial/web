export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
  locale: string;
  tags: string[];
  source: string;
  createdAt: string;
  updatedAt: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  unsubscribeReason?: string;
  metadata: Record<string, any>;
}

export interface SubscribeNewsletterInput {
  email: string;
  locale?: string;
  tags?: string[];
  source?: string;
  consentVersion?: string;
  metadata?: Record<string, any>;
}

export interface UnsubscribeNewsletterInput {
  email: string;
  reason: string;
}

export interface NewsletterSubscriptionStatus {
  email: string;
  status: string;
  tags: string[];
  subscribedAt: string;
  unsubscribedAt?: string;
}

export interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface UnsubscribePageProps {
  searchParams: {
    email?: string;
  };
}

export const UNSUBSCRIBE_REASONS = [
  'Nu mai sunt interesat de conținutul oferit',
  'Primesc prea multe email-uri',
  'Conținutul nu este relevant pentru mine',
  'Am înregistrat email-ul greșit',
  'Nu am solicitat această înscriere',
  'Alte motive'
] as const;

export type UnsubscribeReason = typeof UNSUBSCRIBE_REASONS[number];
