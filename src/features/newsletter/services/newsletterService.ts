import { getGraphQLClient } from '@/lib/graphql/client';
import { 
  NewsletterSubscriber, 
  SubscribeNewsletterInput, 
  UnsubscribeNewsletterInput,
  NewsletterSubscriptionStatus 
} from '../types';

const SUBSCRIBE_MUTATION = `
  mutation Subscribe($input: SubscribeNewsletterInput!) {
    subscribeNewsletter(input: $input) {
      email
      status
      locale
      tags
      subscribedAt
    }
  }
`;

const UNSUBSCRIBE_MUTATION = `
  mutation Unsubscribe($input: UnsubscribeNewsletterInput!) {
    unsubscribeNewsletter(input: $input) {
      email
      status
      unsubscribedAt
      unsubscribeReason
    }
  }
`;

const SUBSCRIPTION_STATUS_QUERY = `
  query SubStatus($email: String!) {
    getNewsletterSubscription(email: $email) {
      email
      status
      tags
      subscribedAt
      unsubscribedAt
    }
  }
`;

export class NewsletterService {
  private static client = getGraphQLClient();

  static async subscribe(input: SubscribeNewsletterInput): Promise<Partial<NewsletterSubscriber>> {
    try {
      const data = await this.client.request<{ subscribeNewsletter: Partial<NewsletterSubscriber> }>(
        SUBSCRIBE_MUTATION,
        { input }
      );
      return data.subscribeNewsletter;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw new Error('Eroare la înscrierea la newsletter. Te rugăm să încerci din nou.');
    }
  }

  static async unsubscribe(input: UnsubscribeNewsletterInput): Promise<Partial<NewsletterSubscriber>> {
    try {
      const data = await this.client.request<{ unsubscribeNewsletter: Partial<NewsletterSubscriber> }>(
        UNSUBSCRIBE_MUTATION,
        { input }
      );
      return data.unsubscribeNewsletter;
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      throw new Error('Eroare la dezabonarea de la newsletter. Te rugăm să încerci din nou.');
    }
  }

  static async getSubscriptionStatus(email: string): Promise<NewsletterSubscriptionStatus | null> {
    try {
      const data = await this.client.request<{ getNewsletterSubscription: NewsletterSubscriptionStatus | null }>(
        SUBSCRIPTION_STATUS_QUERY,
        { email }
      );
      return data.getNewsletterSubscription;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return null;
    }
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus(email);
      return status !== null;
    } catch (error) {
      return false;
    }
  }
}
