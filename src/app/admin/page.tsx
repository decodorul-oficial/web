'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  BarChart3, 
  Instagram, 
  Settings, 
  TrendingUp, 
  Calendar, 
  Clock,
  FileText,
  Users,
  Activity,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { NewsStatsChart } from '@/components/admin/NewsStatsChart';
import { AdminService, StiriStatsData } from '@/services/adminService';

interface NewsStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

interface AdminStats {
  newsStats: NewsStats;
  userStats: {
    totalUsers: number;
    activeUsers: number;
    freeUsers: number;
    proUsers: number;
    enterpriseUsers: number;
  };
  systemStats: {
    uptime: string;
    lastBackup: string;
    errorCount: number;
  };
}

type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'total';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
  const [chartData, setChartData] = useState<Array<{ period: string; count: number; date?: string }>>([]);
  const [chartTitle, setChartTitle] = useState('Știri pe Ore - Astăzi');
  const [stiriStats, setStiriStats] = useState<StiriStatsData | null>(null);
  const [benchmarkStats, setBenchmarkStats] = useState<StiriStatsData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedSpecificPeriod, setSelectedSpecificPeriod] = useState<string>('');
  const [dropdownOptions, setDropdownOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [systemViews, setSystemViews] = useState<{ views: number; period: string }>({ views: 0, period: 'Astăzi' });
  const [periodLabels, setPeriodLabels] = useState<{
    today: string;
    week: string;
    month: string;
    year: string;
  }>({
    today: 'Zi curentă',
    week: 'Săptămâna curentă',
    month: 'Luna curentă',
    year: 'Anul curent'
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (!loading && user && !isAdmin) {
      router.push('/');
      return;
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
      fetchStiriStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Fetch stiri stats from API
  const fetchStiriStats = async () => {
    try {
      setChartLoading(true);
      const currentDate = AdminService.getCurrentDate();
      const data = await AdminService.getTodayStats(currentDate);
      const previousDay = AdminService.getPreviousDay(currentDate);
      const benchmarkData = await AdminService.getBenchmarkDayStats(previousDay);
      
      setStiriStats(data);
      setBenchmarkStats(benchmarkData);
      
      // Update system views for today
      updateSystemViews(data, 'today');
      
      // Update period labels for today
      updatePeriodLabels('today');
    } catch (error) {
      console.error('Error fetching stiri stats:', error);
    } finally {
      setChartLoading(false);
    }
  };

  // Fetch specific period data
  const fetchPeriodData = async (period: TimePeriod) => {
    try {
      setChartLoading(true);
      let data: StiriStatsData;
      let benchmarkData: StiriStatsData | undefined;

      switch (period) {
        case 'today':
          const currentDate = AdminService.getCurrentDate();
          data = await AdminService.getTodayStats(currentDate);
          const previousDay = AdminService.getPreviousDay(currentDate);
          benchmarkData = await AdminService.getBenchmarkDayStats(previousDay);
          break;
        case 'week':
          const currentWeekStart = AdminService.getCurrentWeekStart();
          data = await AdminService.getWeekStats(currentWeekStart);
          const previousWeek = AdminService.getPreviousWeek(currentWeekStart);
          benchmarkData = await AdminService.getBenchmarkWeekStats(previousWeek);
          break;
        case 'month':
          const currentYear = AdminService.getCurrentYear();
          const currentMonth = new Date().getMonth() + 1;
          data = await AdminService.getMonthStats(currentYear, currentMonth);
          const previousMonth = AdminService.getPreviousMonth(currentYear, currentMonth);
          benchmarkData = await AdminService.getBenchmarkMonthStats(previousMonth.year, previousMonth.month);
          break;
        case 'year':
          const year = AdminService.getCurrentYear();
          data = await AdminService.getYearStats(year);
          const prevYear = AdminService.getPreviousYear(year);
          benchmarkData = await AdminService.getBenchmarkYearStats(prevYear);
          break;
        case 'total':
        default:
          data = await AdminService.getAllStats();
          // Pentru total nu avem benchmark
          break;
      }

      setStiriStats(data);
      if (benchmarkData) {
        setBenchmarkStats(benchmarkData);
      } else {
        setBenchmarkStats(null);
      }
      
      // Update period labels based on selected period
      updatePeriodLabels(period);
      
      // Update system views based on selected period
      updateSystemViews(data, selectedPeriod);
    } catch (error) {
      console.error('Error fetching period data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  // Generate chart data from API response
  const generateChartData = (period: TimePeriod, data: StiriStatsData, benchmarkData?: StiriStatsData) => {
    switch (period) {
      case 'today':
        const todayData = data.today.map(item => ({
          period: item.label,
          count: item.value,
          date: item.label
        }));
        
        if (benchmarkData) {
          const benchmarkTodayData = benchmarkData.today.map(item => ({
            period: item.label,
            count: item.value,
            date: item.label,
            isBenchmark: true
          }));
          return [...todayData, ...benchmarkTodayData];
        }
        return todayData;
        
      case 'week':
        // Filtrează doar zilele lucrătoare (luni-vineri) din datele săptămânii
        const weekDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
        const weekData = data.thisWeek
          .filter(item => weekDays.includes(item.label))
          .map(item => ({
            period: item.label,
            count: item.value,
            date: item.label
          }));
        
        if (benchmarkData) {
          const benchmarkWeekData = benchmarkData.thisWeek
            .filter(item => weekDays.includes(item.label))
            .map(item => ({
              period: item.label,
              count: item.value,
              date: item.label,
              isBenchmark: true
            }));
          return [...weekData, ...benchmarkWeekData];
        }
        return weekData;
        
      case 'month':
        const monthData = data.thisMonth.map(item => ({
          period: item.label,
          count: item.value,
          date: item.label
        }));
        
        if (benchmarkData) {
          const benchmarkMonthData = benchmarkData.thisMonth.map(item => ({
            period: item.label,
            count: item.value,
            date: item.label,
            isBenchmark: true
          }));
          return [...monthData, ...benchmarkMonthData];
        }
        return monthData;
        
      case 'year':
        const yearData = data.thisYear.map(item => ({
          period: item.label,
          count: item.value,
          date: item.label
        }));
        
        if (benchmarkData) {
          const benchmarkYearData = benchmarkData.thisYear.map(item => ({
            period: item.label,
            count: item.value,
            date: item.label,
            isBenchmark: true
          }));
          return [...yearData, ...benchmarkYearData];
        }
        return yearData;
        
      case 'total':
      default:
        // Calculate summary from API data
        const todayTotal = data.today.reduce((sum, item) => sum + item.value, 0);
        const weekTotal = data.thisWeek.reduce((sum, item) => sum + item.value, 0);
        const yearTotal = data.thisYear.reduce((sum, item) => sum + item.value, 0);
        
        return [
          { period: 'Astăzi', count: todayTotal },
          { period: 'Săptămâna', count: weekTotal },
          { period: 'Anul', count: yearTotal },
          { period: 'Total', count: data.total }
        ];
    }
  };

  // Update chart when period changes
  useEffect(() => {
    if (stiriStats) {
      const newData = generateChartData(selectedPeriod, stiriStats, benchmarkStats || undefined);
      setChartData(newData);
      
      // Update chart title
      switch (selectedPeriod) {
        case 'today':
          setChartTitle('Știri pe Ore - Astăzi');
          break;
        case 'week':
          setChartTitle('Știri pe Zile - Săptămâna Aceasta');
          break;
        case 'month':
          setChartTitle('Știri pe Zile - Luna Curentă');
          break;
        case 'year':
          setChartTitle('Știri pe Luni - Anul Curent');
          break;
        case 'total':
        default:
          setChartTitle('Toate Știrile');
          break;
      }
    }
  }, [selectedPeriod, stiriStats, benchmarkStats]);

  // Update dropdown options when period changes
  useEffect(() => {
    switch (selectedPeriod) {
      case 'today':
        setDropdownOptions(AdminService.getDayOptions());
        setSelectedSpecificPeriod(AdminService.getCurrentDate());
        break;
      case 'week':
        setDropdownOptions(AdminService.getWeekOptions());
        setSelectedSpecificPeriod(AdminService.getCurrentWeekStart());
        break;
      case 'month':
        setDropdownOptions(AdminService.getMonthOptions());
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        setSelectedSpecificPeriod(`${currentYear}-${currentMonth}`);
        break;
      case 'year':
        setDropdownOptions(AdminService.getYearOptions());
        setSelectedSpecificPeriod(AdminService.getCurrentYear().toString());
        break;
      default:
        setDropdownOptions([]);
        setSelectedSpecificPeriod('');
    }
  }, [selectedPeriod]);

  // Handle period selection
  const handlePeriodChange = async (period: TimePeriod) => {
    setSelectedPeriod(period);
    await fetchPeriodData(period);
  };

  // Update period labels based on selected period
  const updatePeriodLabels = (period: TimePeriod) => {
    switch (period) {
      case 'today':
        const currentDate = AdminService.getCurrentDate();
        setPeriodLabels(prev => ({
          ...prev,
          today: AdminService.getDayLabel(currentDate)
        }));
        break;
      case 'week':
        const currentWeekStart = AdminService.getCurrentWeekStart();
        setPeriodLabels(prev => ({
          ...prev,
          week: AdminService.getWeekLabel(currentWeekStart)
        }));
        break;
      case 'month':
        const currentYear = AdminService.getCurrentYear();
        const currentMonth = new Date().getMonth() + 1;
        setPeriodLabels(prev => ({
          ...prev,
          month: AdminService.getMonthLabel(currentYear, currentMonth)
        }));
        break;
      case 'year':
        const year = AdminService.getCurrentYear();
        setPeriodLabels(prev => ({
          ...prev,
          year: AdminService.getYearLabel(year)
        }));
        break;
    }
  };

  // Update system views based on selected period
  const updateSystemViews = (data: StiriStatsData, period: TimePeriod) => {
    let views = 0;
    let periodLabel = '';
    
    switch (period) {
      case 'today':
        views = data.viewsToday.reduce((sum, item) => sum + item.value, 0);
        periodLabel = 'Astăzi';
        break;
      case 'week':
        views = data.viewsThisWeek.reduce((sum, item) => sum + item.value, 0);
        periodLabel = 'Săptămâna';
        break;
      case 'month':
        views = data.viewsThisMonth.reduce((sum, item) => sum + item.value, 0);
        periodLabel = 'Luna';
        break;
      case 'year':
        views = data.viewsThisYear.reduce((sum, item) => sum + item.value, 0);
        periodLabel = 'Anul';
        break;
      case 'total':
      default:
        views = data.viewsTotal;
        periodLabel = 'Total';
        break;
    }
    
    setSystemViews({ views, period: periodLabel });
  };

  // Update period labels based on specific period selection
  const updateSpecificPeriodLabels = (period: TimePeriod, value: string) => {
    switch (period) {
      case 'today':
        setPeriodLabels(prev => ({
          ...prev,
          today: AdminService.getDayLabel(value)
        }));
        break;
      case 'week':
        setPeriodLabels(prev => ({
          ...prev,
          week: AdminService.getWeekLabel(value)
        }));
        break;
      case 'month':
        const [year, month] = value.split('-');
        setPeriodLabels(prev => ({
          ...prev,
          month: AdminService.getMonthLabel(parseInt(year), parseInt(month))
        }));
        break;
      case 'year':
        const selectedYear = parseInt(value);
        setPeriodLabels(prev => ({
          ...prev,
          year: AdminService.getYearLabel(selectedYear)
        }));
        break;
    }
  };

  // Handle specific period selection from dropdown
  const handleSpecificPeriodChange = async (value: string) => {
    setSelectedSpecificPeriod(value);
    
    if (!value) return;
    
    try {
      setChartLoading(true);
      let data: StiriStatsData;
      let benchmarkData: StiriStatsData;

      switch (selectedPeriod) {
        case 'today':
          data = await AdminService.getTodayStats(value);
          const previousDay = AdminService.getPreviousDay(value);
          benchmarkData = await AdminService.getBenchmarkDayStats(previousDay);
          break;
        case 'week':
          data = await AdminService.getWeekStats(value);
          const previousWeek = AdminService.getPreviousWeek(value);
          benchmarkData = await AdminService.getBenchmarkWeekStats(previousWeek);
          break;
        case 'month':
          // value este în format "2025-01" (an-luna)
          const [year, month] = value.split('-');
          data = await AdminService.getMonthStats(parseInt(year), parseInt(month));
          const previousMonth = AdminService.getPreviousMonth(parseInt(year), parseInt(month));
          benchmarkData = await AdminService.getBenchmarkMonthStats(previousMonth.year, previousMonth.month);
          break;
        case 'year':
          const selectedYear = parseInt(value);
          data = await AdminService.getYearStats(selectedYear);
          const prevYear = AdminService.getPreviousYear(selectedYear);
          benchmarkData = await AdminService.getBenchmarkYearStats(prevYear);
          break;
        default:
          return;
      }

      setStiriStats(data);
      if (benchmarkData) {
        setBenchmarkStats(benchmarkData);
      } else {
        setBenchmarkStats(null);
      }
      
      // Update period labels based on selected specific period
      updateSpecificPeriodLabels(selectedPeriod, value);
      
      // Update system views based on selected period
      updateSystemViews(data, selectedPeriod);
    } catch (error) {
      console.error('Error fetching specific period data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      // Mock data for now - replace with actual API calls
      const mockStats: AdminStats = {
        newsStats: {
          today: 12,
          thisWeek: 89,
          thisMonth: 342,
          total: 1250
        },
        userStats: {
          totalUsers: 1250,
          activeUsers: 890,
          freeUsers: 800,
          proUsers: 350,
          enterpriseUsers: 100
        },
        systemStats: {
          uptime: '99.9%',
          lastBackup: '2 ore în urmă',
          errorCount: 3
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || statsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
          <p className="text-gray-600">Panoul de control pentru administrarea aplicației</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's News - Clickable */}
          <button
            onClick={() => handlePeriodChange('today')}
            disabled={chartLoading}
            className={`bg-white rounded-lg shadow-sm border p-6 text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedPeriod === 'today' 
                ? 'border-brand-info ring-2 ring-brand-info/20' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{periodLabels.today}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stiriStats ? stiriStats.today.reduce((sum, item) => sum + item.value, 0) : 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </button>

          {/* This Week's News - Clickable */}
          <button
            onClick={() => handlePeriodChange('week')}
            disabled={chartLoading}
            className={`bg-white rounded-lg shadow-sm border p-6 text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedPeriod === 'week' 
                ? 'border-brand-info ring-2 ring-brand-info/20' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{periodLabels.week}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stiriStats ? stiriStats.thisWeek.reduce((sum, item) => sum + item.value, 0) : 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </button>

          {/* This Year's News - Clickable */}
          <button
            onClick={() => handlePeriodChange('month')}
            disabled={chartLoading}
            className={`bg-white rounded-lg shadow-sm border p-6 text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedPeriod === 'month' 
                ? 'border-brand-info ring-2 ring-brand-info/20' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{periodLabels.month}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stiriStats ? stiriStats.thisMonth.reduce((sum, item) => sum + item.value, 0) : 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </button>

          {/* Total News - Clickable */}
          <button
            onClick={() => handlePeriodChange('year')}
            disabled={chartLoading}
            className={`bg-white rounded-lg shadow-sm border p-6 text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedPeriod === 'year' 
                ? 'border-brand-info ring-2 ring-brand-info/20' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{periodLabels.year}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stiriStats ? stiriStats.thisYear.reduce((sum, item) => sum + item.value, 0) : 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* News Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Statistici Știri</h3>
              {selectedPeriod !== 'total' && dropdownOptions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    {selectedPeriod === 'today' && 'Ziua:'}
                    {selectedPeriod === 'week' && 'Săptămâna:'}
                    {selectedPeriod === 'month' && 'Luna:'}
                  </label>
                  <select
                    value={selectedSpecificPeriod}
                    onChange={(e) => handleSpecificPeriodChange(e.target.value)}
                    disabled={chartLoading}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-info focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dropdownOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-info mx-auto mb-2"></div>
                  <p className="text-gray-500">Se încarcă datele...</p>
                </div>
              </div>
            ) : stiriStats && chartData.length > 0 ? (
              <NewsStatsChart 
                data={chartData}
                chartType={selectedPeriod === 'total' ? 'bar' : 'line'}
                title={chartTitle}
              />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nu sunt date disponibile</p>
                </div>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Sistem</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium text-green-600">{stats?.systemStats.uptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ultima Backup</span>
                <span className="text-sm font-medium text-gray-900">{stats?.systemStats.lastBackup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Erori</span>
                <span className="text-sm font-medium text-red-600">{stats?.systemStats.errorCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vizualizări ({systemViews.period})</span>
                <span className="text-sm font-medium text-blue-600">{systemViews.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Manage Instagram */}
          <Link
            href="/admin/instagram"
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-colors">
                <Instagram className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-info transition-colors">
                  Manage Instagram
                </h3>
                <p className="text-sm text-gray-600">Gestionează postările pe Instagram</p>
              </div>
            </div>
          </Link>

          {/* Diagnostic */}
          <Link
            href="/admin/diagnostic"
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-info transition-colors">
                  Diagnostic
                </h3>
                <p className="text-sm text-gray-600">Verifică statusul sistemului</p>
              </div>
            </div>
          </Link>

          {/* Useri și Subscripții */}
          <Link
            href="/admin/users"
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-info transition-colors">
                  Useri și Subscripții
                </h3>
                <p className="text-sm text-gray-600">Administrează utilizatorii și subscripțiile</p>
              </div>
            </div>
          </Link>

          {/* System Settings */}
          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-not-allowed opacity-50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Settings className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Setări Sistem
                </h3>
                <p className="text-sm text-gray-600">În dezvoltare</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activitate Recentă</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Ultima actualizare: acum 5 minute</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">12 știri noi adăugate astăzi</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">5 utilizatori noi înregistrați</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">3 erori minore detectate</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
