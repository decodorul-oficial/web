import { gql } from 'graphql-request';
import { getGraphQLClient } from '@/lib/graphql/client';
import { UserService } from '@/features/user/services/userService';

export interface StiriStatsData {
  today: Array<{ label: string; value: number }>;
  thisWeek: Array<{ label: string; value: number }>;
  thisMonth: Array<{ label: string; value: number }>;
  thisYear: Array<{ label: string; value: number }>;
  total: number;
  viewsToday: Array<{ label: string; value: number }>;
  viewsThisWeek: Array<{ label: string; value: number }>;
  viewsThisMonth: Array<{ label: string; value: number }>;
  viewsThisYear: Array<{ label: string; value: number }>;
  viewsTotal: number;
}

export interface StiriStatsDayInput {
  day: string; // Format: "YYYY-MM-DD"
}

export interface StiriStatsWeekInput {
  weekStart: string; // Format: "YYYY-MM-DD"
}

export interface StiriStatsYearInput {
  year: number;
}

export interface StiriStatsMonthInput {
  year: number;
  month: number; // 1-12
}

export interface StiriStatsVariables {
  day?: StiriStatsDayInput;
  week?: StiriStatsWeekInput;
  year?: StiriStatsYearInput;
  month?: StiriStatsMonthInput;
}

const GET_STIRI_STATS = gql`
  query GetStiriStats($day: StiriStatsDayInput, $week: StiriStatsWeekInput, $year: StiriStatsYearInput, $month: StiriStatsMonthInput) {
    getStiriStats(day: $day, week: $week, year: $year, month: $month) {
      today { 
        label 
        value 
      }
      thisWeek { 
        label 
        value 
      }
      thisMonth { 
        label 
        value 
      }
      thisYear { 
        label 
        value 
      }
      total
      viewsToday { 
        label 
        value 
      }
      viewsThisWeek { 
        label 
        value 
      }
      viewsThisMonth { 
        label 
        value 
      }
      viewsThisYear { 
        label 
        value 
      }
      viewsTotal
    }
  }
`;

export class AdminService {
  // Creează un client care știe să se autentifice
  private static getApiClient() {
    const token = UserService.getAuthToken(); // Obține token-ul de la gardian
    return getGraphQLClient({
      getAuthToken: () => token ?? undefined
    });
  }

  static async getStiriStats(variables?: StiriStatsVariables): Promise<StiriStatsData> {
    try {
      const client = this.getApiClient(); // Folosește clientul autentificat
      const data = await client.request<{ getStiriStats: StiriStatsData }>(GET_STIRI_STATS, variables || {});

      return data.getStiriStats;
    } catch (error) {
      console.error('Error fetching stiri stats:', error);
      throw error;
    }
  }

  static async getTodayStats(day: string): Promise<StiriStatsData> {
    return this.getStiriStats({
      day: { day: this.formatDayForApi(day) }
    });
  }

  static async getWeekStats(weekStart: string): Promise<StiriStatsData> {
    return this.getStiriStats({
      week: { weekStart: this.formatDayForApi(weekStart) }
    });
  }

  static async getMonthStats(year: number, month: number): Promise<StiriStatsData> {
    return this.getStiriStats({
      month: { year, month }
    });
  }

  static async getYearStats(year: number): Promise<StiriStatsData> {
    return this.getStiriStats({
      year: { year }
    });
  }

  // Metode pentru datele de benchmark
  static async getBenchmarkDayStats(day: string): Promise<StiriStatsData> {
    return this.getStiriStats({
      day: { day: this.formatDayForApi(day) }
    });
  }

  static async getBenchmarkWeekStats(weekStart: string): Promise<StiriStatsData> {
    return this.getStiriStats({
      week: { weekStart: this.formatDayForApi(weekStart) }
    });
  }

  static async getBenchmarkMonthStats(year: number, month: number): Promise<StiriStatsData> {
    return this.getStiriStats({
      month: { year, month }
    });
  }

  static async getBenchmarkYearStats(year: number): Promise<StiriStatsData> {
    return this.getStiriStats({
      year: { year }
    });
  }

  static async getAllStats(): Promise<StiriStatsData> {
    return this.getStiriStats();
  }

  // Helper function to get current date in YYYY-MM-DD format
  static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Metodă helper pentru a formata data pentru API
  static formatDayForApi(dayString: string): string {
    // Convertește 'YYYY-MM-DD' în 'YYYY-MM-DDTHH:mm:ss.sssZ'
    // Acest lucru asigură că este un format date-time ISO complet,
    // care este probabil așteptat de backend pentru scalarul DateTime.
    return new Date(`${dayString}T00:00:00.000Z`).toISOString();
  }

  // Helper function to get start of current week (Monday)
  static getCurrentWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  // Helper function to get current year
  static getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // Helper functions for period labels
  static getDayLabel(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Zi curentă';
    }
    
    return date.toLocaleDateString('ro-RO', { 
      day: 'numeric', 
      month: 'long' 
    });
  }

  static getWeekLabel(weekStart: string): string {
    const date = new Date(weekStart);
    const today = new Date();
    const currentWeekStart = this.getCurrentWeekStart();
    const isCurrentWeek = weekStart === currentWeekStart;
    
    if (isCurrentWeek) {
      return 'Săptămâna curentă';
    }
    
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return `${date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}`;
  }

  static getMonthLabel(year: number, month: number): string {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const isCurrentMonth = year === currentYear && month === currentMonth;
    
    if (isCurrentMonth) {
      return 'Luna curentă';
    }
    
    const monthNames = [
      'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
      'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    
    return `${monthNames[month - 1]} ${year}`;
  }

  static getYearLabel(year: number): string {
    const currentYear = new Date().getFullYear();
    const isCurrentYear = year === currentYear;
    
    if (isCurrentYear) {
      return 'Anul curent';
    }
    
    return `Anul ${year}`;
  }

  // Metode pentru benchmark (perioada anterioară)
  static getPreviousDay(currentDay: string): string {
    const date = new Date(currentDay);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  static getPreviousWeek(currentWeekStart: string): string {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7); // Scade 7 zile pentru a obține lunea săptămânii anterioare
    return date.toISOString().split('T')[0];
  }

  static getPreviousMonth(year: number, month: number): { year: number; month: number } {
    if (month === 1) {
      return { year: year - 1, month: 12 };
    } else {
      return { year, month: month - 1 };
    }
  }

  static getPreviousYear(currentYear: number): number {
    return currentYear - 1;
  }

  // Metode pentru generarea opțiunilor dropdown
  static getWeekOptions(): Array<{ value: string; label: string }> {
    const weeks = [];
    const today = new Date();
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    
    // Generează ultimele 104 săptămâni (2 ani) dar nu mai mult de 10 săptămâni înapoi
    const maxWeeks = Math.min(104, 10);
    for (let i = 0; i < maxWeeks; i++) {
      const currentIterationDate = new Date(today);
      currentIterationDate.setDate(today.getDate() - (i * 7)); // Mergi înapoi cu i săptămâni
      
      const dayOfWeek = currentIterationDate.getDay(); // 0 = Duminică, 1 = Luni, ..., 6 = Sâmbătă
      const diff = currentIterationDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustează la luni
      const monday = new Date(currentIterationDate.setDate(diff));
      monday.setHours(0, 0, 0, 0); // Normalizează la începutul zilei
      
      // Pentru săptămâna curentă (i=0), afișăm întregul interval luni-vineri
      // Pentru săptămânile anterioare, verificăm că nu mergem mai mult de 2 ani în trecut
      const isCurrentWeek = i === 0;
      const isWithinTwoYears = monday >= twoYearsAgo;
      
      if (isCurrentWeek || isWithinTwoYears) {
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4); // Luni + 4 zile = Vineri
        friday.setHours(23, 59, 59, 999); // Normalizează la sfârșitul zilei
        
        const startDay = monday.getDate();
        const endDay = friday.getDate();
        const startMonth = monday.toLocaleDateString('ro-RO', { month: 'short' });
        const endMonth = friday.toLocaleDateString('ro-RO', { month: 'short' });
        const startYear = monday.getFullYear();
        const endYear = friday.getFullYear();
        
        let label = `${startDay} ${startMonth}`;
        if (startYear !== endYear) {
          label += ` ${startYear}`;
        }
        label += ` - ${endDay} ${endMonth} ${endYear}`;
        
        weeks.push({
          value: monday.toISOString().split('T')[0], // Valoarea este lunea săptămânii
          label: label
        });
      }
    }
    
    return weeks;
  }

  static getMonthOptions(): Array<{ value: string; label: string }> {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const twoYearsAgo = currentYear - 2;
    
    // Generează ultimii 2 ani (anul curent și anul anterior)
    for (let year = currentYear; year >= twoYearsAgo; year--) {
      const yearMonths = [
        { value: `${year}-01`, label: `Ianuarie ${year}` },
        { value: `${year}-02`, label: `Februarie ${year}` },
        { value: `${year}-03`, label: `Martie ${year}` },
        { value: `${year}-04`, label: `Aprilie ${year}` },
        { value: `${year}-05`, label: `Mai ${year}` },
        { value: `${year}-06`, label: `Iunie ${year}` },
        { value: `${year}-07`, label: `Iulie ${year}` },
        { value: `${year}-08`, label: `August ${year}` },
        { value: `${year}-09`, label: `Septembrie ${year}` },
        { value: `${year}-10`, label: `Octombrie ${year}` },
        { value: `${year}-11`, label: `Noiembrie ${year}` },
        { value: `${year}-12`, label: `Decembrie ${year}` }
      ];
      
      if (year === currentYear) {
        // Pentru anul curent, afișăm doar lunile până la luna curentă în ordine descrescătoare
        const currentYearMonths = yearMonths.slice(0, currentMonth);
        months.push(...currentYearMonths.reverse());
      } else {
        // Pentru anii anteriori, afișăm toate lunile în ordine descrescătoare
        months.push(...yearMonths.reverse());
      }
    }
    
    return months;
  }

  static getYearOptions(): Array<{ value: string; label: string }> {
    const years = [];
    const currentYear = new Date().getFullYear();
    const twoYearsAgo = currentYear - 2;
    
    // Generează ultimii 2 ani (anul curent și anul anterior)
    for (let year = currentYear; year >= twoYearsAgo; year--) {
      years.push({
        value: year.toString(),
        label: year.toString()
      });
    }
    
    return years;
  }

  static getDayOptions(): Array<{ value: string; label: string }> {
    const days = [];
    const today = new Date();
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    
    // Generează ultimele 730 de zile (2 ani) dar nu mai mult de 30 de zile înapoi
    const maxDays = Math.min(730, 30);
    for (let i = 0; i < maxDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Nu includem zilele din viitor și nu mergem mai mult de 2 ani în trecut
      if (date <= today && date >= twoYearsAgo) {
        const dayName = date.toLocaleDateString('ro-RO', { weekday: 'long' });
        const dayNumber = date.getDate();
        const monthName = date.toLocaleDateString('ro-RO', { month: 'long' });
        
        days.push({
          value: date.toISOString().split('T')[0],
          label: `${dayName}, ${dayNumber} ${monthName}`
        });
      }
    }
    
    return days;
  }

  private static getWeekStartDate(year: number, week: number): Date {
    const jan4 = new Date(year, 0, 4);
    const jan4Day = jan4.getDay() || 7; // 0 = Sunday, convert to 7
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - jan4Day + 1);
    
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() + (week - 1) * 7);
    
    return weekStart;
  }
}
