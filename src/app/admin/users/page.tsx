'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Trash2, 
  Eye, 
  EyeOff,
  CreditCard,
  Calendar,
  Star,
  Bookmark,
  Settings,
  Users,
  TrendingUp,
  DollarSign,
  Crown,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { OverlayBackdrop } from '@/components/ui/OverlayBackdrop';
import { AdminUsersGraphQLService, User, UsersResponse, SortField, SortDirection, UserFilters } from '@/services/adminUsersGraphQL';

export default function UsersAdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    status: 'all',
    subscriptionType: 'all',
    subscriptionStatus: 'all',
    isAdmin: 'all'
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<{
    type: 'cancel_subscription' | 'reactivate_subscription' | 'suspend_user' | 'activate_user' | 'delete_user' | 'promote_admin' | 'demote_admin';
    user: User;
    title: string;
    description: string;
    confirmText: string;
    confirmButtonClass: string;
  } | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    freeUsers: 0,        // Utilizatori cu subscription_tier = null
    proUsers: 0,         // Utilizatori cu subscription_tier = 'pro' (PRO_MONTHLY + PRO_YEARLY)
    enterpriseUsers: 0   // Utilizatori cu subscription_tier = 'enterprise*' (ENTERPRISE_MONTHLY + ENTERPRISE_YEARLY)
  });

  // Handle escape key and click outside
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showUserDetails) {
        setShowUserDetails(false);
        setSelectedUser(null);
      }
    };

    if (showUserDetails) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showUserDetails]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (!authLoading && user && !isAdmin) {
      router.push('/');
      return;
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin, currentPage, searchTerm, itemsPerPage, sortField, sortDirection, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminUsersGraphQLService.getUsers(currentPage, itemsPerPage, searchTerm, sortField, sortDirection, filters);
      setUsers(response.users);
      setTotalCount(response.pagination.totalCount);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await AdminUsersGraphQLService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleCancelSubscription = async (userId: string, subscriptionId: string) => {
    try {
      const result = await AdminUsersGraphQLService.adminUsersCancelSubscription(userId, subscriptionId);
      if (result.success) {
        await fetchUsers();
        await fetchStats();
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Eroare la anularea subscripției');
    }
  };

  const handleReactivateSubscription = async (userId: string, subscriptionId: string) => {
    try {
      const result = await AdminUsersGraphQLService.adminUsersReactivateSubscription(userId, subscriptionId);
      if (result.success) {
        await fetchUsers();
        await fetchStats();
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Eroare la reactivarea subscripției');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const result = await AdminUsersGraphQLService.adminUsersSuspendUser(userId);
      if (result.success) {
        await fetchUsers();
        await fetchStats();
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Eroare la suspendarea utilizatorului');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const result = await AdminUsersGraphQLService.adminUsersActivateUser(userId);
      if (result.success) {
        await fetchUsers();
        await fetchStats();
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Eroare la reactivarea utilizatorului');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest utilizator? Această acțiune nu poate fi anulată.')) {
      try {
        const result = await AdminUsersGraphQLService.adminUsersDeleteUser(userId);
        if (result.success) {
          await fetchUsers();
          await fetchStats();
          alert(result.message);
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Eroare la ștergerea utilizatorului');
      }
    }
  };

  const closeModal = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const showConfirmation = (
    type: 'cancel_subscription' | 'reactivate_subscription' | 'suspend_user' | 'activate_user' | 'delete_user' | 'promote_admin' | 'demote_admin',
    user: User
  ) => {
    const actions = {
      cancel_subscription: {
        title: 'Anulează Subscripția',
        description: `Ești sigur că vrei să anulezi subscripția pentru utilizatorul cu email: ${user.email}?`,
        confirmText: 'Anulează Subscripția',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
      },
      reactivate_subscription: {
        title: 'Reactivează Subscripția',
        description: `Ești sigur că vrei să reactivezi subscripția pentru utilizatorul cu email: ${user.email}?`,
        confirmText: 'Reactivează Subscripția',
        confirmButtonClass: 'bg-green-600 hover:bg-green-700'
      },
      suspend_user: {
        title: 'Suspendă Utilizatorul',
        description: `Ești sigur că vrei să suspendezi utilizatorul cu email: ${user.email}?`,
        confirmText: 'Suspendă Utilizatorul',
        confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700'
      },
      activate_user: {
        title: 'Reactivează Utilizatorul',
        description: `Ești sigur că vrei să reactivezi utilizatorul cu email: ${user.email}?`,
        confirmText: 'Reactivează Utilizatorul',
        confirmButtonClass: 'bg-green-600 hover:bg-green-700'
      },
      delete_user: {
        title: 'Șterge Utilizatorul',
        description: `Ești sigur că vrei să ștergi utilizatorul cu email: ${user.email}? Această acțiune nu poate fi anulată.`,
        confirmText: 'Șterge Utilizatorul',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
      },
      promote_admin: {
        title: 'Promovează la Administrator',
        description: `Ești sigur că vrei să promovezi utilizatorul cu email: ${user.email} la administrator?`,
        confirmText: 'Promovează la Administrator',
        confirmButtonClass: 'bg-blue-600 hover:bg-blue-700'
      },
      demote_admin: {
        title: 'Demotează de la Administrator',
        description: `Ești sigur că vrei să demotezi utilizatorul cu email: ${user.email} de la administrator?`,
        confirmText: 'Demotează de la Administrator',
        confirmButtonClass: 'bg-orange-600 hover:bg-orange-700'
      }
    };

    setConfirmationAction({
      type,
      user,
      ...actions[type]
    });
    setConfirmationEmail('');
    setShowConfirmationModal(true);
  };

  const handleConfirmation = async () => {
    if (!confirmationAction || confirmationEmail !== confirmationAction.user.email) {
      alert('Email-ul introdus nu se potrivește cu cel al utilizatorului!');
      return;
    }

    try {
      let result: { success: boolean; message: string };

      switch (confirmationAction.type) {
        case 'cancel_subscription':
          result = await AdminUsersGraphQLService.adminUsersCancelSubscription(confirmationAction.user.id, confirmationAction.user.subscription!.id);
          break;
        case 'reactivate_subscription':
          result = await AdminUsersGraphQLService.adminUsersReactivateSubscription(confirmationAction.user.id, confirmationAction.user.subscription!.id);
          break;
        case 'suspend_user':
          result = await AdminUsersGraphQLService.adminUsersSuspendUser(confirmationAction.user.id);
          break;
        case 'activate_user':
          result = await AdminUsersGraphQLService.adminUsersActivateUser(confirmationAction.user.id);
          break;
        case 'delete_user':
          result = await AdminUsersGraphQLService.adminUsersDeleteUser(confirmationAction.user.id);
          break;
        case 'promote_admin':
          result = await AdminUsersGraphQLService.adminUsersPromoteToAdmin(confirmationAction.user.id);
          break;
        case 'demote_admin':
          result = await AdminUsersGraphQLService.adminUsersDemoteFromAdmin(confirmationAction.user.id);
          break;
        default:
          return;
      }

      if (result.success) {
        await fetchUsers();
        await fetchStats();
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Eroare la executarea acțiunii');
    } finally {
      setShowConfirmationModal(false);
      setConfirmationAction(null);
      setConfirmationEmail('');
    }
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setConfirmationAction(null);
    setConfirmationEmail('');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Dacă câmpul este deja sortat, schimbă direcția
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Dacă este un câmp nou, setează-l cu direcția ascendentă
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Resetează la prima pagină când se schimbă sortarea
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-brand-info" />
      : <ChevronDown className="h-4 w-4 text-brand-info" />;
  };

  const handleFilterChange = (filterType: keyof UserFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Resetează la prima pagină când se schimbă filtrele
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      subscriptionType: 'all',
      subscriptionStatus: 'all',
      isAdmin: 'all'
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return filters.status !== 'all' || 
           filters.subscriptionType !== 'all' || 
           filters.subscriptionStatus !== 'all' || 
           filters.isAdmin !== 'all';
  };

  const formatLastLogin = (lastLoginAt: string | null) => {
    if (!lastLoginAt) {
      return 'Niciodată';
    }
    return new Date(lastLoginAt).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubscriptionBadgeColor = (type: string, status: string) => {
    if (status === 'CANCELED' || status === 'PAST_DUE' || status === 'UNPAID' || status === 'INCOMPLETE_EXPIRED') return 'bg-red-100 text-red-800';
    if (type === 'ENTERPRISE_MONTHLY' || type === 'ENTERPRISE_YEARLY') return 'bg-purple-100 text-purple-800';
    if (type === 'PRO_MONTHLY' || type === 'PRO_YEARLY') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSubscriptionIcon = (type: string) => {
    if (type === 'ENTERPRISE_MONTHLY' || type === 'ENTERPRISE_YEARLY') return <Crown className="h-4 w-4" />;
    if (type === 'PRO_MONTHLY' || type === 'PRO_YEARLY') return <Shield className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container-responsive flex-1 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-info"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container-responsive flex-1 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/admin"
              className="flex items-center space-x-2 text-gray-600 hover:text-brand-info transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Înapoi la Dashboard</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administrare Utilizatori</h1>
              <p className="text-gray-600">Gestionează utilizatorii și subscripțiile platformei</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Utilizatori</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activi</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enterprise</p>
                <p className="text-2xl font-bold text-blue-600">{stats.enterpriseUsers}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pro</p>
                <p className="text-2xl font-bold text-purple-600">{stats.proUsers}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gratuit</p>
                <p className="text-2xl font-bold text-gray-600">{stats.freeUsers}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-full">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>

        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Caută după nume sau email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info focus:border-transparent"
                />
                {searchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Șterge căutarea"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-brand-info text-white rounded-md hover:bg-brand-info-dark transition-colors text-sm"
                >
                  Caută
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                hasActiveFilters() 
                  ? 'border-brand-info bg-brand-info text-white hover:bg-brand-info-dark' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtre</span>
              {hasActiveFilters() && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white text-brand-info rounded-full">
                  {Object.values(filters).filter(f => f !== 'all').length}
                </span>
              )}
            </button>
          </div>
          {searchTerm && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>Rezultate pentru:</span>
              <span className="font-medium text-brand-info">"{searchTerm}"</span>
              <button
                onClick={handleClearSearch}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Șterge căutarea"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filtre</h3>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-brand-info hover:text-brand-info-dark transition-colors"
                >
                  Șterge toate filtrele
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status utilizator
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info focus:border-transparent"
                >
                  <option value="all">Toți</option>
                  <option value="active">Activi</option>
                  <option value="inactive">Inactivi</option>
                </select>
              </div>

              {/* Subscription Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip subscripție
                </label>
                <select
                  value={filters.subscriptionType}
                  onChange={(e) => handleFilterChange('subscriptionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info focus:border-transparent"
                >
                  <option value="all">Toate</option>
                  <option value="FREE">Gratuit</option>
                  <option value="PRO_MONTHLY">Pro Lunar</option>
                  <option value="PRO_YEARLY">Pro Anual</option>
                  <option value="ENTERPRISE_MONTHLY">Enterprise Lunar</option>
                  <option value="ENTERPRISE_YEARLY">Enterprise Anual</option>
                </select>
              </div>

              {/* Subscription Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status subscripție
                </label>
                <select
                  value={filters.subscriptionStatus}
                  onChange={(e) => handleFilterChange('subscriptionStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info focus:border-transparent"
                >
                  <option value="all">Toate</option>
                  <option value="ACTIVE">Activă</option>
                  <option value="CANCELED">Anulată</option>
                  <option value="PAST_DUE">Restantă</option>
                  <option value="UNPAID">Neplătită</option>
                  <option value="TRIALING">Trial</option>
                  <option value="PENDING">În așteptare</option>
                  <option value="INCOMPLETE">Incompletă</option>
                  <option value="INCOMPLETE_EXPIRED">Trial expirat</option>
                </select>
              </div>

              {/* Admin Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol utilizator
                </label>
                <select
                  value={filters.isAdmin}
                  onChange={(e) => handleFilterChange('isAdmin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info focus:border-transparent"
                >
                  <option value="all">Toți</option>
                  <option value="admin">Administratori</option>
                  <option value="user">Utilizatori</option>
                </select>
              </div>
            </div>

            {hasActiveFilters() && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Filtre active:</span>
                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {filters.status === 'active' ? 'Activi' : 'Inactivi'}
                    </span>
                  )}
                  {filters.subscriptionType !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Tip: {filters.subscriptionType === 'FREE' ? 'Gratuit' : 
                            filters.subscriptionType === 'PRO_MONTHLY' ? 'Pro Lunar' :
                            filters.subscriptionType === 'PRO_YEARLY' ? 'Pro Anual' :
                            filters.subscriptionType === 'ENTERPRISE_MONTHLY' ? 'Enterprise Lunar' :
                            filters.subscriptionType === 'ENTERPRISE_YEARLY' ? 'Enterprise Anual' : filters.subscriptionType}
                    </span>
                  )}
                  {filters.subscriptionStatus !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Status: {filters.subscriptionStatus === 'ACTIVE' ? 'Activă' :
                               filters.subscriptionStatus === 'CANCELED' ? 'Anulată' :
                               filters.subscriptionStatus === 'PAST_DUE' ? 'Restantă' :
                               filters.subscriptionStatus === 'UNPAID' ? 'Neplătită' :
                               filters.subscriptionStatus === 'TRIALING' ? 'Trial' :
                               filters.subscriptionStatus === 'PENDING' ? 'În așteptare' :
                               filters.subscriptionStatus === 'INCOMPLETE' ? 'Incompletă' :
                               filters.subscriptionStatus === 'INCOMPLETE_EXPIRED' ? 'Trial expirat' : filters.subscriptionStatus}
                    </span>
                  )}
                  {filters.isAdmin !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Rol: {filters.isAdmin === 'admin' ? 'Administratori' : 'Utilizatori'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Utilizator
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('subscriptionType')}
                  >
                    <div className="flex items-center gap-1">
                      Subscripție
                      {getSortIcon('subscriptionType')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('isActive')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon('isActive')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('lastLoginAt')}
                  >
                    <div className="flex items-center gap-1">
                      Ultima activitate
                      {getSortIcon('lastLoginAt')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt={user.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            {user.isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.subscription ? (
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionBadgeColor(user.subscription.type, user.subscription.status)}`}>
                            {getSubscriptionIcon(user.subscription.type)}
                            <span className="ml-1">{user.subscription.typeLabel}</span>
                          </span>
                          <div className="text-xs text-gray-500">
                            {user.subscription.status === 'ACTIVE' && (
                              <span>Expiră: {formatDate(user.subscription.endDate)}</span>
                            )}
                        {(user.subscription.status === 'CANCELED' || user.subscription.status === 'PAST_DUE' || user.subscription.status === 'UNPAID' || user.subscription.status === 'INCOMPLETE_EXPIRED') && (
                          <span className="text-red-600">{user.subscription.statusLabel}</span>
                        )}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Users className="h-3 w-3 mr-1" />
                          Gratuit
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            {user.statusLabel}
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            {user.statusLabel}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLastLogin(user.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className="text-brand-info hover:text-brand-info-dark transition-colors"
                          title="Vezi detalii"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {user.subscription && user.subscription.status === 'ACTIVE' && (
                          <button
                            onClick={() => showConfirmation('cancel_subscription', user)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Anulează subscripția"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}
                        
                        {user.subscription && (user.subscription.status === 'CANCELED' || user.subscription.status === 'PAST_DUE' || user.subscription.status === 'UNPAID' || user.subscription.status === 'INCOMPLETE_EXPIRED') && (
                          <button
                            onClick={() => showConfirmation('reactivate_subscription', user)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Reactivează subscripția"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}
                        
                        {user.isActive ? (
                          <button
                            onClick={() => showConfirmation('suspend_user', user)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="Suspendă utilizatorul"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => showConfirmation('activate_user', user)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Reactivează utilizatorul"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        
                        {!user.isAdmin ? (
                          <button
                            onClick={() => showConfirmation('promote_admin', user)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Promovează la administrator"
                          >
                            <Crown className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => showConfirmation('demote_admin', user)}
                            className="text-orange-600 hover:text-orange-800 transition-colors"
                            title="Demotează de la administrator"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => showConfirmation('delete_user', user)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Șterge utilizatorul"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Afișând {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} din {totalCount} utilizatori
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                title="Pagina anterioară"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      >
                        1
                      </button>
                    );
                    
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          i === currentPage
                            ? 'bg-brand-info text-white font-medium'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                title="Pagina următoare"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <>
            <OverlayBackdrop 
              onClick={closeModal}
              zIndexClass="z-[90]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
              <div 
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Detalii Utilizator</h2>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      title="Închide"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Info */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informații Personale</h3>
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          className="h-16 w-16 rounded-full object-cover"
                          src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`}
                          alt={selectedUser.name}
                        />
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h4>
                          <p className="text-gray-600">{selectedUser.email}</p>
                          <p className="text-sm text-gray-500">
                            Membru din: {formatDate(selectedUser.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Details */}
                    {selectedUser.subscription && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscripție</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tip:</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionBadgeColor(selectedUser.subscription.type, selectedUser.subscription.status)}`}>
                              {getSubscriptionIcon(selectedUser.subscription.type)}
                              <span className="ml-1">{selectedUser.subscription.typeLabel}</span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="text-sm font-medium">{selectedUser.subscription.statusLabel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Preț:</span>
                            <span className="text-sm font-medium">{selectedUser.subscription.price} {selectedUser.subscription.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Început:</span>
                            <span className="text-sm">{formatDate(selectedUser.subscription.startDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expiră:</span>
                            <span className="text-sm">{formatDate(selectedUser.subscription.endDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Auto-reînnoire:</span>
                            <span className="text-sm">{selectedUser.subscription.autoRenew ? 'Da' : 'Nu'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment History */}
                    {selectedUser.paymentHistory.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Istoric Plăți</h3>
                        <div className="space-y-3">
                          {selectedUser.paymentHistory.map((payment) => (
                            <div key={payment.id} className="flex justify-between items-center p-3 bg-white rounded border">
                              <div>
                                <p className="text-sm font-medium">{payment.description}</p>
                                <p className="text-xs text-gray-500">{formatDateTime(payment.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{payment.amount} {payment.currency}</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                  payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {payment.statusLabel}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Activity */}
                  <div className="space-y-6">
                    {/* Favorite News */}
                    {selectedUser.favoriteNews.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Știri Favorite</h3>
                        <div className="space-y-3">
                          {selectedUser.favoriteNews.map((news) => (
                            <div key={news.id} className="p-3 bg-white rounded border">
                              <div className="flex items-start space-x-2">
                                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{news.title}</p>
                                  <p className="text-xs text-gray-500">{news.category}</p>
                                  <p className="text-xs text-gray-400">Adăugată: {formatDate(news.addedAt)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Saved Searches */}
                    {selectedUser.savedSearches.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Căutări Salvate</h3>
                        <div className="space-y-3">
                          {selectedUser.savedSearches.map((search) => (
                            <div key={search.id} className="p-3 bg-white rounded border">
                              <div className="flex items-start space-x-2">
                                <Bookmark className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{search.query}</p>
                                  {search.filters.categories && (
                                    <p className="text-xs text-gray-500">
                                      Categorii: {search.filters.categories.join(', ')}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400">
                                    Ultima folosită: {formatDateTime(search.lastUsed)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preferences */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferințe</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Categorii preferate:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedUser.preferences.categories.map((category) => (
                              <span key={category} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Notificări:</p>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">Email:</span>
                              <span className={`text-xs ${selectedUser.preferences.notifications.email ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedUser.preferences.notifications.email ? 'Activat' : 'Dezactivat'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">Push:</span>
                              <span className={`text-xs ${selectedUser.preferences.notifications.push ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedUser.preferences.notifications.push ? 'Activat' : 'Dezactivat'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">Newsletter:</span>
                              <span className={`text-xs ${selectedUser.preferences.notifications.newsletter ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedUser.preferences.notifications.newsletter ? 'Activat' : 'Dezactivat'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Limbă:</span>
                            <span className="ml-2 text-sm text-gray-600">{selectedUser.preferences.language.toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Temă:</span>
                            <span className="ml-2 text-sm text-gray-600 capitalize">{selectedUser.preferences.theme}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && confirmationAction && (
          <>
            <OverlayBackdrop 
              onClick={closeConfirmationModal}
              zIndexClass="z-[90]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
              <div 
                className="bg-white rounded-lg max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{confirmationAction.title}</h2>
                    <button
                      onClick={closeConfirmationModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      title="Închide"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">{confirmationAction.description}</p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Confirmare necesară
                          </h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            Pentru a confirma această acțiune, te rugăm să introduci email-ul utilizatorului:
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmation-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email utilizator:
                      </label>
                      <input
                        id="confirmation-email"
                        type="email"
                        value={confirmationEmail}
                        onChange={(e) => setConfirmationEmail(e.target.value)}
                        placeholder={confirmationAction.user.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={closeConfirmationModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={handleConfirmation}
                      disabled={confirmationEmail !== confirmationAction.user.email}
                      className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmationAction.confirmButtonClass}`}
                    >
                      {confirmationAction.confirmText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
