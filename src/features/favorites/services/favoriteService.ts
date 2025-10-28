import { getGraphQLClient } from '@/lib/graphql/client';
import { UserService } from '@/features/user/services/userService';
import {
  GET_FAVORITE_NEWS,
  IS_FAVORITE_NEWS,
  GET_FAVORITE_NEWS_STATS,
  ADD_FAVORITE_NEWS,
  REMOVE_FAVORITE_NEWS,
  TOGGLE_FAVORITE_NEWS,
  CLEAR_ALL_FAVORITE_NEWS,
  FavoriteNewsResponse,
  ToggleFavoriteNewsResponse,
  FavoriteNewsStats
} from '../graphql/queries';

export interface GetFavoriteNewsParams {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at';
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * Funcție helper care creează un client API cu token-ul curent.
 * Respectă ghidul de implementare a autentificării:
 * - UserService este gardianul token-ului de autentificare
 * - Nu încercăm să obținem token-ul din localStorage, cookies sau direct de la Supabase
 * - Folosim UserService.getAuthToken() pentru a obține token-ul curent
 */
const getApiClient = () => {
  const token = UserService.getAuthToken(); // Obține token-ul de la gardian
  return getGraphQLClient({
    getAuthToken: () => token ?? undefined
  });
};

export class FavoriteService {
  /**
   * Obține știrile favorite ale utilizatorului cu paginare
   */
  static async getFavoriteNews(params: GetFavoriteNewsParams = {}): Promise<FavoriteNewsResponse> {
    const { limit = 20, offset = 0, orderBy = 'created_at', orderDirection = 'DESC' } = params;
    
    try {
      const client = getApiClient(); // Folosește clientul autentificat
      const data = await client.request<{ getFavoriteNews: FavoriteNewsResponse }>(
        GET_FAVORITE_NEWS,
        { limit, offset, orderBy, orderDirection }
      );
      
      return data.getFavoriteNews;
    } catch (error) {
      console.error('Error fetching favorite news:', error);
      throw new Error('Failed to fetch favorite news');
    }
  }

  /**
   * Verifică dacă o știre este în favoritele utilizatorului
   */
  static async isFavoriteNews(newsId: string): Promise<boolean> {
    try {
      const client = getApiClient(); // Folosește clientul autentificat
      const data = await client.request<{ isFavoriteNews: boolean }>(
        IS_FAVORITE_NEWS,
        { newsId }
      );
      
      return data.isFavoriteNews;
    } catch (error) {
      console.error('Error checking if news is favorite:', error);
      return false;
    }
  }

  /**
   * Obține statistici despre știrile favorite ale utilizatorului
   */
  static async getFavoriteNewsStats(): Promise<FavoriteNewsStats> {
    try {
      const client = getApiClient(); // Folosește clientul autentificat
      const data = await client.request<{ getFavoriteNewsStats: FavoriteNewsStats }>(
        GET_FAVORITE_NEWS_STATS
      );
      
      return data.getFavoriteNewsStats;
    } catch (error) {
      console.error('Error fetching favorite news stats:', error);
      throw new Error('Failed to fetch favorite news stats');
    }
  }

  /**
   * Adaugă o știre la favoritele utilizatorului
   */
  static async addFavoriteNews(newsId: string): Promise<void> {
    try {
      const client = getApiClient(); // Folosește clientul autentificat
      await client.request(ADD_FAVORITE_NEWS, { newsId });
    } catch (error) {
      console.error('Error adding favorite news:', error);
      throw new Error('Failed to add favorite news');
    }
  }

  /**
   * Șterge o știre din favoritele utilizatorului
   */
  static async removeFavoriteNews(newsId: string): Promise<void> {
    try {
      const client = getApiClient(); // Folosește clientul autentificat
      await client.request(REMOVE_FAVORITE_NEWS, { newsId });
    } catch (error) {
      console.error('Error removing favorite news:', error);
      throw new Error('Failed to remove favorite news');
    }
  }

  /**
   * Comută statusul unei știri în favorite (adaugă dacă nu este, șterge dacă este)
   */
  static async toggleFavoriteNews(newsId: string): Promise<ToggleFavoriteNewsResponse> {
    try {
      const client = getApiClient(); // Folosește clientul autentificat
      const data = await client.request<{ toggleFavoriteNews: ToggleFavoriteNewsResponse }>(
        TOGGLE_FAVORITE_NEWS,
        { newsId }
      );
      
      return data.toggleFavoriteNews;
    } catch (error) {
      console.error('Error toggling favorite news:', error);
      throw new Error('Failed to toggle favorite news');
    }
  }

  /**
   * Șterge toate știrile favorite ale utilizatorului
   */
  static async clearAllFavoriteNews(): Promise<void> {
    try {
      const client = getApiClient(); // Folosește clientul autentificat
      await client.request(CLEAR_ALL_FAVORITE_NEWS);
    } catch (error) {
      console.error('Error clearing all favorite news:', error);
      throw new Error('Failed to clear all favorite news');
    }
  }
}
