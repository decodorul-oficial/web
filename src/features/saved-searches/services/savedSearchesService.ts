import { getGraphQLClient } from '@/lib/graphql/client';
import { UserService } from '@/features/user/services/userService';
import { ensureSessionCookie } from '@/lib/utils/sessionCookie';
import {
  GET_SAVED_SEARCHES,
  GET_SAVED_SEARCH_BY_ID,
  SAVE_SEARCH,
  UPDATE_SAVED_SEARCH,
  DELETE_SAVED_SEARCH,
  TOGGLE_FAVORITE_SEARCH,
  GET_EMAIL_NOTIFICATION_INFO,
  TOGGLE_EMAIL_NOTIFICATIONS
} from '../graphql/queries';
import {
  SavedSearch,
  SavedSearchResponse,
  SaveSearchInput,
  UpdateSavedSearchInput,
  GetSavedSearchesParams,
  EmailNotificationInfo
} from '../types';

/**
 * Creează un client GraphQL care este automat autentificat
 * dacă un token este disponibil în UserService.
 */
const getApiClient = () => {
  const token = UserService.getAuthToken();
  return getGraphQLClient({
    getAuthToken: () => token ?? undefined
  });
};

export class SavedSearchesService {
  /**
   * Obține lista de căutări salvate ale utilizatorului
   */
  static async getSavedSearches(params: GetSavedSearchesParams = {}): Promise<SavedSearchResponse> {
    const {
      limit = 20,
      offset = 0,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      favoritesOnly = false
    } = params;

    const limitClamped = Math.max(1, Math.min(50, limit));
    ensureSessionCookie();

    try {
      const client = getApiClient();
      const data = await client.request<{ getSavedSearches: SavedSearchResponse }>(
        GET_SAVED_SEARCHES,
        {
          limit: limitClamped,
          offset,
          orderBy,
          orderDirection,
          favoritesOnly
        }
      );
      return data.getSavedSearches;
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      throw error;
    }
  }

  /**
   * Obține o căutare salvată specifică după ID
   */
  static async getSavedSearchById(id: string): Promise<SavedSearch | null> {
    ensureSessionCookie();

    try {
      const client = getApiClient();
      const data = await client.request<{ getSavedSearchById?: SavedSearch }>(
        GET_SAVED_SEARCH_BY_ID,
        { id }
      );
      return data.getSavedSearchById ?? null;
    } catch (error) {
      console.error(`Error fetching saved search by id ${id}:`, error);
      return null;
    }
  }

  /**
   * Salvează o nouă căutare
   */
  static async saveSearch(input: SaveSearchInput): Promise<SavedSearch> {
    ensureSessionCookie();

    try {
      const client = getApiClient();
      const data = await client.request<{ saveSearch: SavedSearch }>(
        SAVE_SEARCH,
        { input }
      );
      return data.saveSearch;
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  }

  /**
   * Actualizează o căutare salvată existentă
   */
  static async updateSavedSearch(id: string, input: UpdateSavedSearchInput): Promise<SavedSearch> {
    ensureSessionCookie();

    try {
      const client = getApiClient();
      const data = await client.request<{ updateSavedSearch: SavedSearch }>(
        UPDATE_SAVED_SEARCH,
        { id, input }
      );
      return data.updateSavedSearch;
    } catch (error) {
      console.error(`Error updating saved search ${id}:`, error);
      throw error;
    }
  }

  /**
   * Șterge o căutare salvată
   */
  static async deleteSavedSearch(id: string): Promise<boolean> {
    ensureSessionCookie();

    try {
      const client = getApiClient();
      const data = await client.request<{ deleteSavedSearch: boolean }>(
        DELETE_SAVED_SEARCH,
        { id }
      );
      return data.deleteSavedSearch;
    } catch (error) {
      console.error(`Error deleting saved search ${id}:`, error);
      throw error;
    }
  }

  /**
   * Comută statusul de favorit pentru o căutare salvată
   */
  static async toggleFavoriteSearch(id: string): Promise<SavedSearch> {
    ensureSessionCookie();

    try {
      const client = getApiClient();
      const data = await client.request<{ toggleFavoriteSearch: SavedSearch }>(
        TOGGLE_FAVORITE_SEARCH,
        { id }
      );
      return data.toggleFavoriteSearch;
    } catch (error) {
      console.error(`Error toggling favorite search ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obține informațiile despre notificările email ale utilizatorului
   */
  static async getEmailNotificationInfo(): Promise<EmailNotificationInfo> {
    ensureSessionCookie();

    try {
      const client = getApiClient();
      const data = await client.request<{ getEmailNotificationInfo: EmailNotificationInfo }>(
        GET_EMAIL_NOTIFICATION_INFO,
        {}
      );
      return data.getEmailNotificationInfo;
    } catch (error) {
      console.error('Error getting email notification info:', error);
      throw error;
    }
  }

  /**
   * Comută notificările email pentru o căutare salvată
   */
  static async toggleEmailNotifications(id: string, enabled: boolean): Promise<SavedSearch> {
    ensureSessionCookie();

    try {
      const client = getApiClient();
      const data = await client.request<{ toggleEmailNotifications: SavedSearch }>(
        TOGGLE_EMAIL_NOTIFICATIONS,
        { id, enabled }
      );
      return data.toggleEmailNotifications;
    } catch (error) {
      console.error(`Error toggling email notifications for search ${id}:`, error);
      throw error;
    }
  }
}
