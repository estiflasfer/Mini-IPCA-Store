import {
  Activity,
  HistoricalResult,
  Product,
  StudentProfile,
  User,
  AuthSession,
} from '../types';
import { loginWithEmailAndPassword, logoutFirebase } from './firebase';

const TOKEN_KEY = 'mini_ipca_token';
const USER_KEY = 'mini_ipca_user';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: User) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

export function formatCents(cents: number): string {
  const dollars = (cents / 100).toFixed(2).replace('.', ',');
  return `$${dollars}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMessage = errorJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Real Firebase Authentication
  async login(identifier: string, password: string): Promise<AuthSession> {
    const { idToken } = await loginWithEmailAndPassword(identifier, password);
    // Store token so subsequent requests carry Authorization: Bearer <idToken>
    localStorage.setItem(TOKEN_KEY, idToken);

    // Retrieve trusted application role and metadata from backend
    const me = await api.getMe();
    setStoredSession(idToken, me.user);

    return {
      token: idToken,
      user: me.user,
      profile: me.profile,
    };
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      await logoutFirebase();
      clearStoredSession();
    }
  },

  async getMe(): Promise<{ user: User; profile?: StudentProfile }> {
    return request<{ user: User; profile?: StudentProfile }>('/api/auth/me');
  },

  // Products
  async getProducts(): Promise<Product[]> {
    return request<Product[]>('/api/products');
  },

  async createProduct(data: {
    name: string;
    priceCents: number;
    visualKey?: string;
    imageUrl?: string;
    active?: boolean;
  }): Promise<Product> {
    return request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(
    id: string,
    updates: {
      name?: string;
      priceCents?: number;
      visualKey?: string;
      imageUrl?: string;
      active?: boolean;
    }
  ): Promise<Product> {
    return request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async toggleProductActive(id: string): Promise<Product> {
    return request<Product>(`/api/products/${id}/toggle-active`, {
      method: 'PATCH',
    });
  },

  // Activities
  async getActivities(): Promise<(Activity & { expectedTotalCents: number; expectedChangeCents: number; hasInactiveProduct: boolean })[]> {
    return request<(Activity & { expectedTotalCents: number; expectedChangeCents: number; hasInactiveProduct: boolean })[]>('/api/activities');
  },

  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    return request<Activity>(`/api/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Profiles
  async getProfile(userId: string): Promise<StudentProfile> {
    return request<StudentProfile>(`/api/profiles/${userId}`);
  },

  async updateProfile(userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    return request<StudentProfile>(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Results
  async getResults(): Promise<HistoricalResult[]> {
    return request<HistoricalResult[]>('/api/results');
  },

  async saveResult(data: Omit<HistoricalResult, 'id' | 'completedAt' | 'studentName'>): Promise<HistoricalResult> {
    return request<HistoricalResult>('/api/results', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Users (Technical Admin)
  async getUsers(): Promise<User[]> {
    return request<User[]>('/api/users');
  },

  async createUser(data: {
    username: string;
    email: string;
    displayName: string;
    role: string;
    permissions?: string[];
    active?: boolean;
  }): Promise<User> {
    return request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return request<User>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // System
  async getSystemStatus(): Promise<any> {
    return request<any>('/api/system/status');
  },

  async resetDemoData(): Promise<any> {
    return request<any>('/api/system/reset-demo', { method: 'POST' });
  },
};
