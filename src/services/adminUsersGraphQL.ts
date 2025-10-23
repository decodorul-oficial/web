import { gql } from 'graphql-request';
import { getGraphQLClient } from '@/lib/graphql/client';
import { UserService } from '@/features/user/services/userService';

// Tipuri pentru API-ul GraphQL Admin Users
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
  isAdmin: boolean;
  statusLabel: string;
  subscription?: Subscription;
  favoriteNews: FavoriteNews[];
  savedSearches: SavedSearch[];
  preferences: UserPreferences;
  paymentHistory: Payment[];
}

export interface Subscription {
  id: string;
  type: 'FREE' | 'PRO_MONTHLY' | 'PRO_YEARLY' | 'ENTERPRISE_MONTHLY' | 'ENTERPRISE_YEARLY';
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING' | 'PENDING' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
  currency: string;
  typeLabel: string;
  statusLabel: string;
}

export interface FavoriteNews {
  id: string;
  title: string;
  url: string;
  addedAt: string;
  category: string;
}

export interface SavedSearch {
  id: string;
  query: string;
  filters: {
    categories?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  createdAt: string;
  lastUsed: string;
}

export interface UserPreferences {
  categories: string[];
  notifications: {
    email: boolean;
    push: boolean;
    newsletter: boolean;
  };
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  method: 'CARD' | 'PAYPAL' | 'BANK_TRANSFER';
  transactionId: string;
  createdAt: string;
  description: string;
  statusLabel: string;
  methodLabel: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type SortField = 'name' | 'email' | 'createdAt' | 'lastLoginAt' | 'isActive' | 'subscriptionType' | 'subscriptionStatus';
export type SortDirection = 'asc' | 'desc';

export interface UserFilters {
  status?: 'all' | 'active' | 'inactive';
  subscriptionType?: 'all' | 'FREE' | 'PRO_MONTHLY' | 'PRO_YEARLY' | 'ENTERPRISE_MONTHLY' | 'ENTERPRISE_YEARLY';
  subscriptionStatus?: 'all' | 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING' | 'PENDING' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED';
  isAdmin?: 'all' | 'admin' | 'user';
}

export interface ActionResult {
  success: boolean;
  message: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;        // Utilizatori cu subscription_tier = null
  proUsers: number;         // Utilizatori cu subscription_tier = 'pro' (PRO_MONTHLY + PRO_YEARLY)
  enterpriseUsers: number;  // Utilizatori cu subscription_tier = 'enterprise*' (ENTERPRISE_MONTHLY + ENTERPRISE_YEARLY)
}

// GraphQL Queries
export const GET_ADMIN_USERS = gql`
  query GetAdminUsers(
    $page: Int
    $limit: Int
    $search: String
    $sortField: AdminSortField
    $sortDirection: AdminSortDirection
    $filters: AdminUserFilters
  ) {
    adminUsers(
      page: $page
      limit: $limit
      search: $search
      sortField: $sortField
      sortDirection: $sortDirection
      filters: $filters
    ) {
      users {
        id
        name
        email
        avatar
        createdAt
        lastLoginAt
        isActive
        isAdmin
        statusLabel
        subscription {
          id
          type
          status
          startDate
          endDate
          autoRenew
          price
          currency
          typeLabel
          statusLabel
        }
        favoriteNews {
          id
          title
          url
          addedAt
          category
        }
        savedSearches {
          id
          query
          filters {
            categories
            dateRange {
              start
              end
            }
          }
          createdAt
          lastUsed
        }
        preferences {
          categories
          notifications {
            email
            push
            newsletter
          }
          language
          theme
        }
        paymentHistory {
          id
          amount
          currency
          status
          method
          transactionId
          createdAt
          description
          statusLabel
          methodLabel
        }
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

export const GET_ADMIN_USER_STATS = gql`
  query GetAdminUserStats {
    adminUserStats {
      totalUsers
      activeUsers
      freeUsers
      proUsers
      enterpriseUsers
    }
  }
`;

// GraphQL Mutations
export const ADMIN_USERS_CANCEL_SUBSCRIPTION = gql`
  mutation AdminUsersCancelSubscription($userId: ID!, $subscriptionId: ID!) {
    adminUsersCancelSubscription(userId: $userId, subscriptionId: $subscriptionId) {
      success
      message
    }
  }
`;

export const ADMIN_USERS_REACTIVATE_SUBSCRIPTION = gql`
  mutation AdminUsersReactivateSubscription($userId: ID!, $subscriptionId: ID!) {
    adminUsersReactivateSubscription(userId: $userId, subscriptionId: $subscriptionId) {
      success
      message
    }
  }
`;

export const ADMIN_USERS_SUSPEND_USER = gql`
  mutation AdminUsersSuspendUser($userId: ID!) {
    adminUsersSuspendUser(userId: $userId) {
      success
      message
    }
  }
`;

export const ADMIN_USERS_ACTIVATE_USER = gql`
  mutation AdminUsersActivateUser($userId: ID!) {
    adminUsersActivateUser(userId: $userId) {
      success
      message
    }
  }
`;

export const ADMIN_USERS_DELETE_USER = gql`
  mutation AdminUsersDeleteUser($userId: ID!) {
    adminUsersDeleteUser(userId: $userId) {
      success
      message
    }
  }
`;

export const ADMIN_USERS_PROMOTE_TO_ADMIN = gql`
  mutation AdminUsersPromoteToAdmin($userId: ID!) {
    adminUsersPromoteToAdmin(userId: $userId) {
      success
      message
    }
  }
`;

export const ADMIN_USERS_DEMOTE_FROM_ADMIN = gql`
  mutation AdminUsersDemoteFromAdmin($userId: ID!) {
    adminUsersDemoteFromAdmin(userId: $userId) {
      success
      message
    }
  }
`;

/**
 * Serviciul pentru API-ul GraphQL Admin Users
 * 
 * ARHITECTURĂ CONFORM GHIDULUI DE AUTENTIFICARE:
 * - Respectă principiul Single Source of Truth: UserService este gardianul token-ului
 * - NU încearcă să obțină token-ul din localStorage, cookies sau direct de la Supabase
 * - Folosește UserService.getAuthToken() pentru a obține token-ul curent
 * - Toate apelurile API sunt autentificate automat prin getApiClient()
 * 
 * FLUXUL DE DATE:
 * 1. AuthProvider.tsx gestionează starea de autentificare
 * 2. AuthProvider configurează UserService cu token-ul prin UserService.setAuthToken()
 * 3. AdminUsersGraphQLService obține token-ul de la UserService prin getAuthToken()
 * 4. Toate apelurile API sunt făcute cu token-ul de autentificare
 */
export class AdminUsersGraphQLService {
  // Creează un client API autentificat folosind token-ul de la UserService
  // Conform ghidului: "NU încearcă să obțină token-ul din localStorage, cookies sau direct de la Supabase"
  private static getApiClient() {
    const token = UserService.getAuthToken(); // Obține token-ul de la gardian
    return getGraphQLClient({
      getAuthToken: () => token ?? undefined
    });
  }

  // Obține lista de utilizatori cu filtrare și sortare
  // Folosește token-ul de la UserService pentru autentificare
  static async getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortField?: SortField,
    sortDirection?: SortDirection,
    filters?: UserFilters
  ): Promise<UsersResponse> {
    try {
      // Convertim filtrele locale în formatul API-ului
      const apiFilters = filters ? {
        status: filters.status !== 'all' ? { eq: filters.status === 'active' } : undefined,
        subscriptionType: filters.subscriptionType !== 'all' ? { eq: filters.subscriptionType } : undefined,
        subscriptionStatus: filters.subscriptionStatus !== 'all' ? { eq: filters.subscriptionStatus } : undefined,
        isAdmin: filters.isAdmin !== 'all' ? { eq: filters.isAdmin === 'admin' } : undefined,
      } : undefined;

      // Convertim sortField în formatul API-ului
      const apiSortField = sortField ? sortField.toUpperCase() as SortField : undefined;
      const apiSortDirection = sortDirection ? sortDirection.toUpperCase() as SortDirection : undefined;

      const response = await this.getApiClient().request<{ adminUsers: UsersResponse }>(GET_ADMIN_USERS, {
        page,
        limit,
        search,
        sortField: apiSortField,
        sortDirection: apiSortDirection,
        filters: apiFilters
      });

      return response.adminUsers;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw new Error('Eroare la încărcarea utilizatorilor');
    }
  }

  // Obține statisticile utilizatorilor
  // Folosește token-ul de la UserService pentru autentificare
  static async getStats(): Promise<UserStats> {
    try {
      const response = await this.getApiClient().request<{ adminUserStats: UserStats }>(GET_ADMIN_USER_STATS);
      return response.adminUserStats;
    } catch (error) {
      console.error('Error fetching admin user stats:', error);
      throw new Error('Eroare la încărcarea statisticilor');
    }
  }

  // Anulează o subscripție
  // Folosește token-ul de la UserService pentru autentificare
  static async adminUsersCancelSubscription(userId: string, subscriptionId: string): Promise<ActionResult> {
    try {
      const response = await this.getApiClient().request<{ adminUsersCancelSubscription: ActionResult }>(ADMIN_USERS_CANCEL_SUBSCRIPTION, {
        userId,
        subscriptionId
      });
      return response.adminUsersCancelSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Eroare la anularea subscripției');
    }
  }

  // Reactivează o subscripție
  static async adminUsersReactivateSubscription(userId: string, subscriptionId: string): Promise<ActionResult> {
    try {
      const response = await this.getApiClient().request<{ adminUsersReactivateSubscription: ActionResult }>(ADMIN_USERS_REACTIVATE_SUBSCRIPTION, {
        userId,
        subscriptionId
      });
      return response.adminUsersReactivateSubscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('Eroare la reactivarea subscripției');
    }
  }

  // Suspendă un utilizator
  static async adminUsersSuspendUser(userId: string): Promise<ActionResult> {
    try {
      const response = await this.getApiClient().request<{ adminUsersSuspendUser: ActionResult }>(ADMIN_USERS_SUSPEND_USER, {
        userId
      });
      return response.adminUsersSuspendUser;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw new Error('Eroare la suspendarea utilizatorului');
    }
  }

  // Reactivează un utilizator
  static async adminUsersActivateUser(userId: string): Promise<ActionResult> {
    try {
      const response = await this.getApiClient().request<{ adminUsersActivateUser: ActionResult }>(ADMIN_USERS_ACTIVATE_USER, {
        userId
      });
      return response.adminUsersActivateUser;
    } catch (error) {
      console.error('Error activating user:', error);
      throw new Error('Eroare la reactivarea utilizatorului');
    }
  }

  // Șterge un utilizator
  static async adminUsersDeleteUser(userId: string): Promise<ActionResult> {
    try {
      const response = await this.getApiClient().request<{ adminUsersDeleteUser: ActionResult }>(ADMIN_USERS_DELETE_USER, {
        userId
      });
      return response.adminUsersDeleteUser;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Eroare la ștergerea utilizatorului');
    }
  }

  // Promovează utilizator la administrator
  static async adminUsersPromoteToAdmin(userId: string): Promise<ActionResult> {
    try {
      const response = await this.getApiClient().request<{ adminUsersPromoteToAdmin: ActionResult }>(ADMIN_USERS_PROMOTE_TO_ADMIN, {
        userId
      });
      return response.adminUsersPromoteToAdmin;
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw new Error('Eroare la promovarea utilizatorului');
    }
  }

  // Demotează administrator la utilizator
  static async adminUsersDemoteFromAdmin(userId: string): Promise<ActionResult> {
    try {
      const response = await this.getApiClient().request<{ adminUsersDemoteFromAdmin: ActionResult }>(ADMIN_USERS_DEMOTE_FROM_ADMIN, {
        userId
      });
      return response.adminUsersDemoteFromAdmin;
    } catch (error) {
      console.error('Error demoting admin to user:', error);
      throw new Error('Eroare la demotarea administratorului');
    }
  }
}
