import {
  Activity,
  HistoricalResult,
  Product,
  StudentProfile,
  User,
  AuthSession,
  Role,
} from '../types';
import { loginWithEmailAndPassword, logoutFirebase, getFreshIdToken } from './firebase';

export function formatCents(cents: number): string {
  const dollars = (cents / 100).toFixed(2).replace('.', ',');
  return `$${dollars}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Obtain fresh Firebase ID Token dynamically for every protected API request
  const token = await getFreshIdToken();
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
    await loginWithEmailAndPassword(identifier, password);
    // Retrieve trusted application role and metadata from backend
    const me = await api.getMe();
    return {
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
    }
  },

  async getMe(): Promise<{ user: User; profile?: StudentProfile }> {
    return request<{ user: User; profile?: StudentProfile }>('/api/auth/me');
  },

  // Products & Catalog (Student sales view & Teacher stock management)
  async getProducts(): Promise<Product[]> {
    return request<Product[]>('/api/products');
  },

  async createProduct(
    product: Partial<Product> & { name: string; priceCents: number }
  ): Promise<Product> {
    return request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async toggleProductActive(id: string): Promise<Product> {
    const products = await api.getProducts();
    const target = products.find((p) => p.id === id);
    const newActive = target ? !target.active : true;
    return api.updateProduct(id, { active: newActive });
  },

  // Activities (Sales training scenarios)
  async getActivities(): Promise<Activity[]> {
    return request<Activity[]>('/api/activities');
  },

  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    return request<Activity>(`/api/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Student Profiles & Pedagogical Scaffolding
  async getStudentProfile(userId: string): Promise<StudentProfile> {
    return request<StudentProfile>(`/api/profiles/${userId}`);
  },

  async getProfile(userId: string): Promise<StudentProfile> {
    return api.getStudentProfile(userId);
  },

  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    return request<StudentProfile>(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async updateProfile(userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    return api.updateStudentProfile(userId, updates);
  },

  // Historical Results & Performance
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
    role: Role;
    permissions?: string[];
    active?: boolean;
    temporaryPassword?: string;
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
