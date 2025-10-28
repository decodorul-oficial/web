import { useEffect, useState } from 'react'
import { UserService } from '../services/userService'
import { useCategories } from '@/contexts/CategoriesContext'
import { useAuth } from '@/components/auth/AuthProvider'

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<string[]>([])
  const { categories } = useCategories()
  const { loading: authLoading, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPreferences = async () => {
      // Dacă utilizatorul nu este autentificat, nu avem ce să preluăm.
      if (!isAuthenticated) {
        setPreferences([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Preluăm preferințele actualizate de la server
        const userPreferences = await UserService.getUserPreferences(); 
        setPreferences(userPreferences || []);
      } catch (error) {
        console.error("Failed to fetch user preferences:", error);
        setPreferences([]); // Resetăm în caz de eroare
      } finally {
        setLoading(false);
      }
    };

    // Așteptăm ca starea de autentificare să fie rezolvată înainte de a prelua datele.
    if (!authLoading) {
      fetchPreferences();
    }
  }, [authLoading, isAuthenticated]); // Re-apelăm efectul la schimbarea stării de autentificare

  const updatePreferences = async (newPreferences: string[]) => {
    try {
      const success = await UserService.updateUserPreferences(newPreferences)
      if (success) {
        setPreferences(newPreferences)
      }
      return success
    } catch (error) {
      console.error('Error updating preferences:', error)
      return false
    }
  }

  return {
    preferences,
    categories,
    loading,
    updatePreferences
  }
}

