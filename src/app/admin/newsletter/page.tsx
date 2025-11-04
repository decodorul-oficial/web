'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Trash2, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Edit
} from 'lucide-react';
import { AdminNewsletterSubscribersGraphQLService, NewsletterSubscriber, AdminNewsletterSubscriberFilters, NewsletterSubscriberStatus } from '@/services/adminNewsletterSubscribersGraphQL';
import toast from 'react-hot-toast';

export default function NewsletterSubscribersAdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableStatuses, setAvailableStatuses] = useState<NewsletterSubscriberStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    locale?: string;
    source?: string;
  }>({
    status: 'all',
    locale: 'all',
    source: 'all'
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>('');
  const [confirmationAction, setConfirmationAction] = useState<{
    type: 'delete' | 'update_status';
    subscriber: NewsletterSubscriber;
    newStatus?: string;
    title: string;
    description: string;
    confirmText: string;
    confirmButtonClass: string;
  } | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState('');

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
      fetchSubscribers();
      fetchAvailableStatuses();
    }
  }, [isAdmin, currentPage, searchTerm, itemsPerPage, filters]);

  const fetchAvailableStatuses = async () => {
    try {
      const statuses = await AdminNewsletterSubscribersGraphQLService.getAvailableStatuses();
      setAvailableStatuses(statuses);
    } catch (error) {
      console.error('Error fetching available statuses:', error);
      toast.error('Eroare la încărcarea statusurilor disponibile');
    }
  };

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const apiFilters: AdminNewsletterSubscriberFilters = {};
      
      if (filters.status && filters.status !== 'all') {
        apiFilters.status = { eq: filters.status };
      }
      
      if (filters.locale && filters.locale !== 'all') {
        apiFilters.locale = { eq: filters.locale };
      }
      
      if (filters.source && filters.source !== 'all') {
        apiFilters.source = { eq: filters.source };
      }
      
      if (searchTerm) {
        apiFilters.email = { contains: searchTerm };
      }

      const response = await AdminNewsletterSubscribersGraphQLService.getSubscribers(
        currentPage,
        itemsPerPage,
        Object.keys(apiFilters).length > 0 ? apiFilters : undefined
      );
      
      setSubscribers(response.subscribers);
      setTotalCount(response.pagination.totalCount);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Eroare la încărcarea abonaților');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const showDeleteConfirmation = (subscriber: NewsletterSubscriber) => {
    setConfirmationAction({
      type: 'delete',
      subscriber,
      title: 'Șterge Abonat',
      description: `Ești sigur că vrei să ștergi abonatul cu email: ${subscriber.email}? Această acțiune nu poate fi anulată.`,
      confirmText: 'Șterge Abonat',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700'
    });
    setConfirmationEmail('');
    setShowConfirmationModal(true);
  };

  const showUpdateStatusModal = (subscriber: NewsletterSubscriber) => {
    setSelectedSubscriber(subscriber);
    setSelectedNewStatus(subscriber.status);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubscriber || !selectedNewStatus) {
      toast.error('Te rugăm să selectezi un status');
      return;
    }

    if (selectedNewStatus === selectedSubscriber.status) {
      toast.error('Statusul selectat este deja activ');
      return;
    }

    const statusLabel = availableStatuses.find(s => s.value === selectedNewStatus)?.label || selectedNewStatus;

    setConfirmationAction({
      type: 'update_status',
      subscriber: selectedSubscriber,
      newStatus: selectedNewStatus,
      title: 'Actualizează Status',
      description: `Ești sigur că vrei să schimbi statusul abonatului ${selectedSubscriber.email} la "${statusLabel}"?`,
      confirmText: 'Actualizează',
      confirmButtonClass: 'bg-blue-600 hover:bg-blue-700'
    });
    setConfirmationEmail('');
    setShowStatusModal(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmation = async () => {
    if (!confirmationAction || confirmationEmail !== confirmationAction.subscriber.email) {
      toast.error('Email-ul introdus nu se potrivește cu cel al abonatului!');
      return;
    }

    const isDelete = confirmationAction.type === 'delete';
    const subscriberEmail = confirmationAction.subscriber.email;

    try {
      if (isDelete) {
        const result = await AdminNewsletterSubscribersGraphQLService.deleteSubscriber(
          confirmationAction.subscriber.id
        );
        
        if (result.success) {
          await fetchSubscribers();
          setShowConfirmationModal(false);
          setConfirmationAction(null);
          setConfirmationEmail('');
          toast.success(`Abonatul cu email: ${subscriberEmail} a fost șters cu succes`, {
            duration: 5000,
          });
        } else {
          toast.error(result.message);
        }
      } else {
        // Update status
        if (!confirmationAction.newStatus) {
          toast.error('Status invalid');
          return;
        }
        
        await AdminNewsletterSubscribersGraphQLService.updateSubscriberStatus(
          confirmationAction.subscriber.id,
          confirmationAction.newStatus
        );
        
        await fetchSubscribers();
        setShowConfirmationModal(false);
        setConfirmationAction(null);
        setConfirmationEmail('');
        toast.success('Statusul abonatului a fost actualizat cu succes');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Eroare la executarea acțiunii');
    }
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setConfirmationAction(null);
    setConfirmationEmail('');
  };

  const handleFilterChange = (filterType: 'status' | 'locale' | 'source', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      locale: 'all',
      source: 'all'
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return filters.status !== 'all' || 
           filters.locale !== 'all' || 
           filters.source !== 'all';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'subscribed':
      case 'SUBSCRIBED':
        return 'bg-green-100 text-green-800';
      case 'unsubscribed':
      case 'UNSUBSCRIBED':
        return 'bg-gray-100 text-gray-800';
      case 'bounced':
      case 'BOUNCED':
        return 'bg-red-100 text-red-800';
      case 'complained':
      case 'COMPLAINED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'subscribed':
      case 'SUBSCRIBED':
        return <CheckCircle className="h-4 w-4" />;
      case 'unsubscribed':
      case 'UNSUBSCRIBED':
        return <XCircle className="h-4 w-4" />;
      case 'bounced':
      case 'BOUNCED':
      case 'complained':
      case 'COMPLAINED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
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
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-brand-info mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Abonați Newsletter</h1>
              <p className="text-gray-600 mt-1">
                Total: {totalCount} abonați
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Caută după email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info"
                />
                {searchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-brand-info text-white rounded-lg hover:bg-brand-info/90 transition-colors"
            >
              Caută
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                hasActiveFilters()
                  ? 'bg-brand-info text-white border-brand-info'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtre
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info"
                  >
                    <option value="all">Toate</option>
                    {availableStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Locale Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limbă
                  </label>
                  <select
                    value={filters.locale || 'all'}
                    onChange={(e) => handleFilterChange('locale', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info"
                  >
                    <option value="all">Toate</option>
                    <option value="ro">Română</option>
                    <option value="en">Engleză</option>
                  </select>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sursă
                  </label>
                  <select
                    value={filters.source || 'all'}
                    onChange={(e) => handleFilterChange('source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info"
                  >
                    <option value="all">Toate</option>
                    <option value="website">Website</option>
                    <option value="api">API</option>
                    <option value="import">Import</option>
                  </select>
                </div>
              </div>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-brand-info hover:text-brand-info/80"
                >
                  Șterge filtrele
                </button>
              )}
            </div>
          )}
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Limbă
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sursă
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonat la
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {loading ? 'Se încarcă...' : 'Nu s-au găsit abonați'}
                    </td>
                  </tr>
                ) : (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {subscriber.email}
                          </span>
                        </div>
                        {subscriber.tags && subscriber.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {subscriber.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {subscriber.tags.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{subscriber.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(subscriber.status)}`}
                        >
                          {getStatusIcon(subscriber.status)}
                          <span className="ml-1">{subscriber.statusLabel}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.locale || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.source || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(subscriber.subscribedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => showUpdateStatusModal(subscriber)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Schimbă status"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => showDeleteConfirmation(subscriber)}
                            className="text-red-600 hover:text-red-900"
                            title="Șterge"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Pagina {currentPage} din {totalPages}
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-info"
                  >
                    <option value={10}>10 pe pagină</option>
                    <option value={25}>25 pe pagină</option>
                    <option value={50}>50 pe pagină</option>
                    <option value={100}>100 pe pagină</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    {totalCount} total
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Status Selection Modal */}
      {showStatusModal && selectedSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Schimbă Status
                </h3>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedSubscriber(null);
                    setSelectedNewStatus('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Selectează noul status pentru abonatul: <span className="font-medium">{selectedSubscriber.email}</span>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status curent
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedSubscriber.status)}`}>
                    {getStatusIcon(selectedSubscriber.status)}
                    <span className="ml-1">{selectedSubscriber.statusLabel}</span>
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nou status
                </label>
                <select
                  value={selectedNewStatus}
                  onChange={(e) => setSelectedNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info"
                >
                  {availableStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedSubscriber(null);
                    setSelectedNewStatus('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={selectedNewStatus === selectedSubscriber.status}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuă
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && confirmationAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {confirmationAction.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {confirmationAction.description}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Introdu email-ul pentru confirmare: <span className="font-mono text-xs">{confirmationAction.subscriber.email}</span>
                </label>
                <input
                  type="text"
                  value={confirmationEmail}
                  onChange={(e) => setConfirmationEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-info"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeConfirmationModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleConfirmation}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${confirmationAction.confirmButtonClass}`}
                >
                  {confirmationAction.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
