// Mock GraphQL API pentru administrarea utilizatorilor și subscripțiilor

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
  statusLabel: string;
  subscription?: Subscription;
  favoriteNews: FavoriteNews[];
  savedSearches: SavedSearch[];
  preferences: UserPreferences;
  paymentHistory: Payment[];
}

export interface Subscription {
  id: string;
  type: 'FREE' | 'PREMIUM' | 'PRO';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
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
  totalCount: number;
  hasMore: boolean;
}

export interface UserAdminQuery {
  users: UsersResponse;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ion Popescu',
    email: 'ion.popescu@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-15T10:30:00Z',
    lastLoginAt: '2024-12-20T14:22:00Z',
    isActive: true,
    statusLabel: 'Activ',
    subscription: {
      id: 'sub_1',
      type: 'PREMIUM',
      status: 'ACTIVE',
      startDate: '2024-11-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      autoRenew: true,
      price: 29.99,
      currency: 'RON',
      typeLabel: 'Premium',
      statusLabel: 'Activă'
    },
    favoriteNews: [
      {
        id: 'fav_1',
        title: 'Nouă lege pentru protecția mediului',
        url: '/stiri/noua-lege-protecția-mediului',
        addedAt: '2024-12-18T09:15:00Z',
        category: 'Mediu'
      },
      {
        id: 'fav_2',
        title: 'Reformă în sistemul de sănătate',
        url: '/stiri/reforma-sistem-sanatate',
        addedAt: '2024-12-19T16:30:00Z',
        category: 'Sănătate'
      }
    ],
    savedSearches: [
      {
        id: 'search_1',
        query: 'lege protecție mediu',
        filters: {
          categories: ['Mediu', 'Legislație']
        },
        createdAt: '2024-12-10T11:20:00Z',
        lastUsed: '2024-12-20T08:45:00Z'
      }
    ],
    preferences: {
      categories: ['Mediu', 'Sănătate', 'Educație'],
      notifications: {
        email: true,
        push: false,
        newsletter: true
      },
      language: 'ro',
      theme: 'light'
    },
    paymentHistory: [
      {
        id: 'pay_1',
        amount: 29.99,
        currency: 'RON',
        status: 'SUCCESS',
        method: 'CARD',
        transactionId: 'txn_123456789',
        createdAt: '2024-11-01T10:30:00Z',
        description: 'Subscripție Premium - Luna Noiembrie 2024',
        statusLabel: 'Succes',
        methodLabel: 'Card'
      }
    ]
  },
  {
    id: '2',
    name: 'Maria Ionescu',
    email: 'maria.ionescu@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-02-20T14:15:00Z',
    lastLoginAt: '2024-12-19T09:30:00Z',
    isActive: true,
    statusLabel: 'Activ',
    subscription: {
      id: 'sub_2',
      type: 'PRO',
      status: 'ACTIVE',
      startDate: '2024-10-15T00:00:00Z',
      endDate: '2025-01-15T23:59:59Z',
      autoRenew: true,
      price: 49.99,
      currency: 'RON',
      typeLabel: 'Pro',
      statusLabel: 'Activă'
    },
    favoriteNews: [
      {
        id: 'fav_3',
        title: 'Digitalizarea serviciilor publice',
        url: '/stiri/digitalizare-servicii-publice',
        addedAt: '2024-12-17T13:20:00Z',
        category: 'Tehnologie'
      }
    ],
    savedSearches: [
      {
        id: 'search_2',
        query: 'digitalizare guvern',
        filters: {
          categories: ['Tehnologie', 'Administrație']
        },
        createdAt: '2024-12-05T15:10:00Z',
        lastUsed: '2024-12-19T10:15:00Z'
      }
    ],
    preferences: {
      categories: ['Tehnologie', 'Administrație', 'Economie'],
      notifications: {
        email: true,
        push: true,
        newsletter: true
      },
      language: 'ro',
      theme: 'dark'
    },
    paymentHistory: [
      {
        id: 'pay_2',
        amount: 49.99,
        currency: 'RON',
        status: 'SUCCESS',
        statusLabel: 'Succes',
        method: 'CARD',
        methodLabel: 'Card',
        transactionId: 'txn_987654321',
        createdAt: '2024-10-15T14:20:00Z',
        description: 'Subscripție Pro - Luna Octombrie 2024'
      },
      {
        id: 'pay_3',
        amount: 49.99,
        currency: 'RON',
        status: 'SUCCESS',
        statusLabel: 'Succes',
        method: 'CARD',
        methodLabel: 'Card',
        transactionId: 'txn_456789123',
        createdAt: '2024-11-15T14:20:00Z',
        description: 'Subscripție Pro - Luna Noiembrie 2024'
      }
    ]
  },
  {
    id: '3',
    name: 'Alexandru Dumitrescu',
    email: 'alex.dumitrescu@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-03-10T08:45:00Z',
    lastLoginAt: '2024-12-18T16:20:00Z',
    isActive: true,
    statusLabel: 'Activ',
    subscription: {
      id: 'sub_3',
      type: 'FREE',
      typeLabel: 'Gratuită',
      status: 'ACTIVE',
      statusLabel: 'Activă',
      startDate: '2024-03-10T08:45:00Z',
      endDate: '2025-03-10T08:45:00Z',
      autoRenew: false,
      price: 0,
      currency: 'RON'
    },
    favoriteNews: [],
    savedSearches: [
      {
        id: 'search_3',
        query: 'educație reformă',
        filters: {
          categories: ['Educație']
        },
        createdAt: '2024-12-12T12:30:00Z',
        lastUsed: '2024-12-18T14:10:00Z'
      }
    ],
    preferences: {
      categories: ['Educație', 'Cultură'],
      notifications: {
        email: false,
        push: false,
        newsletter: false
      },
      language: 'ro',
      theme: 'auto'
    },
    paymentHistory: []
  },
  {
    id: '4',
    name: 'Elena Popa',
    email: 'elena.popa@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-04-05T12:30:00Z',
    lastLoginAt: '2024-12-15T11:45:00Z',
    isActive: false,
    statusLabel: 'Inactiv',
    subscription: {
      id: 'sub_4',
      type: 'PREMIUM',
      typeLabel: 'Premium',
      status: 'EXPIRED',
      statusLabel: 'Expirată',
      startDate: '2024-09-01T00:00:00Z',
      endDate: '2024-12-01T23:59:59Z',
      autoRenew: false,
      price: 29.99,
      currency: 'RON'
    },
    favoriteNews: [
      {
        id: 'fav_4',
        title: 'Pensii și asigurări sociale',
        url: '/stiri/pensii-asigurari-sociale',
        addedAt: '2024-11-20T10:15:00Z',
        category: 'Social'
      }
    ],
    savedSearches: [],
    preferences: {
      categories: ['Social', 'Pensii'],
      notifications: {
        email: true,
        push: false,
        newsletter: false
      },
      language: 'ro',
      theme: 'light'
    },
    paymentHistory: [
      {
        id: 'pay_4',
        amount: 29.99,
        currency: 'RON',
        status: 'SUCCESS',
        statusLabel: 'Succes',
        method: 'CARD',
        methodLabel: 'Card',
        transactionId: 'txn_789123456',
        createdAt: '2024-09-01T09:15:00Z',
        description: 'Subscripție Premium - Luna Septembrie 2024'
      }
    ]
  },
  {
    id: '5',
    name: 'Mihai Constantinescu',
    email: 'mihai.constantinescu@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-05-12T16:20:00Z',
    lastLoginAt: '2024-12-20T13:10:00Z',
    isActive: true,
    statusLabel: 'Activ',
    subscription: {
      id: 'sub_5',
      type: 'PREMIUM',
      typeLabel: 'Premium',
      status: 'CANCELLED',
      statusLabel: 'Anulată',
      startDate: '2024-11-15T00:00:00Z',
      endDate: '2024-12-15T23:59:59Z',
      autoRenew: false,
      price: 29.99,
      currency: 'RON'
    },
    favoriteNews: [
      {
        id: 'fav_5',
        title: 'Infrastructură rutieră și transport',
        url: '/stiri/infrastructura-rutiera-transport',
        addedAt: '2024-12-10T14:30:00Z',
        category: 'Infrastructură'
      },
      {
        id: 'fav_6',
        title: 'Energie verde și sustenabilitate',
        url: '/stiri/energie-verde-sustenabilitate',
        addedAt: '2024-12-12T11:45:00Z',
        category: 'Energie'
      }
    ],
    savedSearches: [
      {
        id: 'search_4',
        query: 'infrastructură transport',
        filters: {
          categories: ['Infrastructură', 'Transport']
        },
        createdAt: '2024-12-08T10:20:00Z',
        lastUsed: '2024-12-20T09:30:00Z'
      }
    ],
    preferences: {
      categories: ['Infrastructură', 'Transport', 'Energie'],
      notifications: {
        email: true,
        push: true,
        newsletter: true
      },
      language: 'ro',
      theme: 'light'
    },
    paymentHistory: [
      {
        id: 'pay_5',
        amount: 29.99,
        currency: 'RON',
        status: 'SUCCESS',
        statusLabel: 'Succes',
        method: 'CARD',
        methodLabel: 'Card',
        transactionId: 'txn_321654987',
        createdAt: '2024-11-15T16:30:00Z',
        description: 'Subscripție Premium - Luna Noiembrie 2024'
      }
    ]
  }
];

export class UserAdminService {
  // Simulează un request GraphQL
  static async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<UsersResponse> {
    // Simulează delay-ul de rețea
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredUsers = mockUsers;

    // Filtrare după search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Paginare
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      totalCount: filteredUsers.length,
      hasMore: endIndex < filteredUsers.length
    };
  }

  // Simulează anularea unei subscripții
  static async cancelSubscription(userId: string, subscriptionId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = mockUsers.find(u => u.id === userId);
    if (!user || !user.subscription) {
      return { success: false, message: 'Utilizator sau subscripție negăsită' };
    }

    if (user.subscription.id !== subscriptionId) {
      return { success: false, message: 'ID subscripție invalid' };
    }

    // Simulează anularea
    user.subscription.status = 'CANCELLED';
    user.subscription.autoRenew = false;

    return { success: true, message: 'Subscripția a fost anulată cu succes' };
  }

  // Simulează reactivarea unei subscripții
  static async reactivateSubscription(userId: string, subscriptionId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = mockUsers.find(u => u.id === userId);
    if (!user || !user.subscription) {
      return { success: false, message: 'Utilizator sau subscripție negăsită' };
    }

    if (user.subscription.id !== subscriptionId) {
      return { success: false, message: 'ID subscripție invalid' };
    }

    // Simulează reactivarea
    user.subscription.status = 'ACTIVE';
    user.subscription.autoRenew = true;

    return { success: true, message: 'Subscripția a fost reactivată cu succes' };
  }

  // Simulează suspendarea unui utilizator
  static async suspendUser(userId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Utilizator negăsit' };
    }

    user.isActive = false;
    return { success: true, message: 'Utilizatorul a fost suspendat cu succes' };
  }

  // Simulează reactivarea unui utilizator
  static async activateUser(userId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Utilizator negăsit' };
    }

    user.isActive = true;
    return { success: true, message: 'Utilizatorul a fost reactivat cu succes' };
  }

  // Simulează ștergerea unui utilizator
  static async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'Utilizator negăsit' };
    }

    mockUsers.splice(userIndex, 1);
    return { success: true, message: 'Utilizatorul a fost șters cu succes' };
  }

  // Simulează obținerea statisticilor
  static async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    proUsers: number;
    freeUsers: number;
    totalRevenue: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.isActive).length;
    const premiumUsers = mockUsers.filter(u => u.subscription?.type === 'PREMIUM' && u.subscription?.status === 'ACTIVE').length;
    const proUsers = mockUsers.filter(u => u.subscription?.type === 'PRO' && u.subscription?.status === 'ACTIVE').length;
    const freeUsers = mockUsers.filter(u => u.subscription?.type === 'FREE' || !u.subscription).length;
    
    const totalRevenue = mockUsers.reduce((sum, user) => {
      return sum + user.paymentHistory.reduce((userSum, payment) => {
        return userSum + (payment.status === 'SUCCESS' ? payment.amount : 0);
      }, 0);
    }, 0);

    return {
      totalUsers,
      activeUsers,
      premiumUsers,
      proUsers,
      freeUsers,
      totalRevenue
    };
  }
}
