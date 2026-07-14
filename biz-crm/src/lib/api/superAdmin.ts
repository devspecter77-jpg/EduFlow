import { apiClient as api } from './client';

// ============================================================
// TYPES
// ============================================================

export interface Center {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  description?: string;
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptions?: Subscription[];
  _count?: {
    users: number;
  };
}

export interface Plan {
  id: string;
  type: 'FREE' | 'STANDARD' | 'PREMIUM';
  name: string;
  price: number;
  maxStudents: number;
  maxTeachers: number;
  maxGroups: number;
  trialDays: number;
  features: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  centerId: string;
  planId: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  startDate: string;
  endDate: string;
  price: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
  center?: Center;
}

export interface SuperAdminStats {
  totalCenters: number;
  activeCenters: number;
  blockedCenters: number;
  subscriptions: {
    trial: number;
    active: number;
    expired: number;
  };
  monthlyRevenue: number;
  recentCenters: Center[];
}

export interface CenterStats {
  students: number;
  teachers: number;
  groups: number;
  totalRevenue: number;
}

export interface CreateCenterData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  adminFullName: string;
  adminPhone: string;
  adminPassword: string;
  planType?: 'FREE' | 'STANDARD' | 'PREMIUM';
}

export interface UpdateCenterData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  logo?: string;
  description?: string;
}

export interface UpdatePlanData {
  name?: string;
  price?: number;
  maxStudents?: number;
  maxTeachers?: number;
  maxGroups?: number;
  features?: string[];
}

export interface ExtendSubscriptionData {
  centerId: string;
  planId: string;
  months: number;
  price: number;
}

// ============================================================
// API FUNCTIONS
// ============================================================

export const superAdminApi = {
  // Dashboard
  async getStats() {
    const res = await api.get<{ data: SuperAdminStats }>('/super-admin/stats');
    return res.data.data;
  },

  // Users
  async listUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const res = await api.get<{
      data: Record<string, unknown>[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/super-admin/users', { params });
    return res.data;
  },

  async blockUser(id: string) {
    await api.patch(`/super-admin/users/${id}/block`);
  },

  async unblockUser(id: string) {
    await api.patch(`/super-admin/users/${id}/unblock`);
  },

  async impersonateUser(userId: string) {
    const res = await api.post<{ data: { token: string; user: Record<string, unknown> } }>(
      `/super-admin/users/${userId}/impersonate`
    );
    return res.data.data;
  },

  // Centers
  async listCenters(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const res = await api.get<{
      data: Center[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/super-admin/centers', { params });
    return res.data;
  },

  async getCenter(id: string) {
    const res = await api.get<{ data: Center }>(`/super-admin/centers/${id}`);
    return res.data.data;
  },

  async getCenterStats(id: string) {
    const res = await api.get<{ data: CenterStats }>(`/super-admin/centers/${id}/stats`);
    return res.data.data;
  },

  async createCenter(data: CreateCenterData) {
    const res = await api.post<{ data: { center: Center; admin: Record<string, unknown>; subscription: Subscription } }>(
      '/super-admin/centers',
      data
    );
    return res.data.data;
  },

  async updateCenter(id: string, data: UpdateCenterData) {
    const res = await api.patch<{ data: Center }>(`/super-admin/centers/${id}`, data);
    return res.data.data;
  },

  async deleteCenter(id: string) {
    await api.delete(`/super-admin/centers/${id}`);
  },

  async blockCenter(id: string) {
    await api.patch(`/super-admin/centers/${id}/block`);
  },

  async unblockCenter(id: string) {
    await api.patch(`/super-admin/centers/${id}/unblock`);
  },

  // Plans
  async listPlans() {
    const res = await api.get<{ data: Plan[] }>('/super-admin/plans');
    return res.data.data;
  },

  async updatePlan(id: string, data: UpdatePlanData) {
    const res = await api.patch<{ data: Plan }>(`/super-admin/plans/${id}`, data);
    return res.data.data;
  },

  // Subscriptions
  async extendSubscription(data: ExtendSubscriptionData) {
    const res = await api.post<{ data: Subscription }>('/super-admin/subscriptions/extend', data);
    return res.data.data;
  },

  async updateSubscription(id: string, data: Partial<Subscription>) {
    const res = await api.patch<{ data: Subscription }>(`/super-admin/subscriptions/${id}`, data);
    return res.data.data;
  },

  // Impersonate
  async impersonate(centerId: string) {
    const res = await api.post<{ data: { token: string; user: Record<string, unknown> } }>(
      `/super-admin/impersonate/${centerId}`
    );
    return res.data.data;
  },
};
