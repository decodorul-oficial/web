import { gql } from 'graphql-request';
import { getGraphQLClient } from '@/lib/graphql/client';
import { UserService } from '@/features/user/services/userService';

// Tipuri pentru API-ul GraphQL Admin Newsletter Subscribers
export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  statusLabel: string;
  locale: string;
  tags: string[];
  source: string;
  createdAt: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  unsubscribeReason?: string;
  lastIp?: string;
  lastUserAgent?: string;
  consentVersion?: string;
  consentAt?: string;
  metadata?: Record<string, any>;
}

export interface NewsletterSubscribersResponse {
  subscribers: NewsletterSubscriber[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AdminNewsletterSubscriberFilters {
  status?: { eq?: string; in?: string[] };
  email?: { contains?: string; eq?: string };
  locale?: { eq?: string };
  source?: { eq?: string };
}

export interface ActionResult {
  success: boolean;
  message: string;
}

export interface UpdateSubscriberStatusInput {
  subscriberId: string;
  status: string;
}

export interface UpdateSubscriberStatusResponse {
  id: string;
  email: string;
  status: string;
  statusLabel: string;
  updatedAt: string;
}

export interface NewsletterSubscriberStatus {
  value: string;
  label: string;
}

export interface NewsletterSubscriberStatusesResponse {
  adminNewsletterSubscriberStatuses: NewsletterSubscriberStatus[];
}

// GraphQL Queries
export const GET_NEWSLETTER_SUBSCRIBERS = gql`
  query GetNewsletterSubscribers(
    $page: Int
    $limit: Int
    $filters: AdminNewsletterSubscriberFilters
  ) {
    adminNewsletterSubscribers(
      page: $page
      limit: $limit
      sortField: CREATED_AT
      sortDirection: DESC
      filters: $filters
    ) {
      subscribers {
        id
        email
        status
        statusLabel
        locale
        tags
        source
        createdAt
        subscribedAt
        unsubscribedAt
        unsubscribeReason
        lastIp
        lastUserAgent
        consentVersion
        consentAt
        metadata
      }
      pagination {
        totalCount
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// GraphQL Mutations
export const DELETE_NEWSLETTER_SUBSCRIBER = gql`
  mutation DeleteSubscriber($subscriberId: ID!) {
    adminNewsletterSubscribersDelete(subscriberId: $subscriberId) {
      success
      message
    }
  }
`;

export const UPDATE_SUBSCRIBER_STATUS = gql`
  mutation UpdateSubscriberStatus($input: UpdateNewsletterSubscriberStatusInput!) {
    adminNewsletterSubscribersUpdateStatus(input: $input) {
      id
      email
      status
      statusLabel
      updatedAt
    }
  }
`;

export const GET_SUBSCRIBER_STATUSES = gql`
  query GetStatuses {
    adminNewsletterSubscriberStatuses {
      value
      label
    }
  }
`;

/**
 * Serviciul pentru API-ul GraphQL Admin Newsletter Subscribers
 * 
 * ARHITECTURĂ CONFORM GHIDULUI DE AUTENTIFICARE:
 * - Respectă principiul Single Source of Truth: UserService este gardianul token-ului
 * - NU încearcă să obțină token-ul din localStorage, cookies sau direct de la Supabase
 * - Folosește UserService.getAuthToken() pentru a obține token-ul curent
 * - Toate apelurile API sunt autentificate automat prin getApiClient()
 */
export class AdminNewsletterSubscribersGraphQLService {
  // Creează un client API autentificat folosind token-ul de la UserService
  private static getApiClient() {
    const token = UserService.getAuthToken();
    return getGraphQLClient({
      getAuthToken: () => token ?? undefined
    });
  }

  // Obține lista de abonați cu filtrare și paginare
  static async getSubscribers(
    page: number = 1,
    limit: number = 10,
    filters?: AdminNewsletterSubscriberFilters
  ): Promise<NewsletterSubscribersResponse> {
    try {
      const response = await this.getApiClient().request<{ 
        adminNewsletterSubscribers: NewsletterSubscribersResponse 
      }>(GET_NEWSLETTER_SUBSCRIBERS, {
        page,
        limit,
        filters
      });

      return response.adminNewsletterSubscribers;
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
      throw new Error('Eroare la încărcarea abonaților');
    }
  }

  // Șterge un abonat
  static async deleteSubscriber(subscriberId: string): Promise<ActionResult> {
    try {
      const response = await this.getApiClient().request<{ 
        adminNewsletterSubscribersDelete: ActionResult 
      }>(DELETE_NEWSLETTER_SUBSCRIBER, {
        subscriberId
      });

      return response.adminNewsletterSubscribersDelete;
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      throw new Error('Eroare la ștergerea abonatului');
    }
  }

  // Actualizează statusul unui abonat
  static async updateSubscriberStatus(
    subscriberId: string,
    status: string
  ): Promise<UpdateSubscriberStatusResponse> {
    try {
      const response = await this.getApiClient().request<{ 
        adminNewsletterSubscribersUpdateStatus: UpdateSubscriberStatusResponse 
      }>(UPDATE_SUBSCRIBER_STATUS, {
        input: {
          subscriberId,
          status
        }
      });

      return response.adminNewsletterSubscribersUpdateStatus;
    } catch (error) {
      console.error('Error updating subscriber status:', error);
      throw new Error('Eroare la actualizarea statusului abonatului');
    }
  }

  // Obține statusurile disponibile pentru abonați
  static async getAvailableStatuses(): Promise<NewsletterSubscriberStatus[]> {
    try {
      const response = await this.getApiClient().request<NewsletterSubscriberStatusesResponse>(
        GET_SUBSCRIBER_STATUSES
      );

      return response.adminNewsletterSubscriberStatuses;
    } catch (error) {
      console.error('Error fetching subscriber statuses:', error);
      throw new Error('Eroare la încărcarea statusurilor disponibile');
    }
  }
}
