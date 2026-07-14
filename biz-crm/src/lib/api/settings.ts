import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppSettings {
  id: string;
  userId: string;
  // Markaz
  centerName: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  telegram: string | null;
  instagram: string | null;
  website: string | null;
  description: string | null;
  // CRM
  currency: 'UZS' | 'USD';
  timezone: string;
  dateFormat: 'DD_MM_YYYY' | 'MM_DD_YYYY' | 'YYYY_MM_DD';
  language: 'UZ' | 'RU' | 'EN';
  theme: string;
  defaultPagination: number;
  // To'lov
  defaultCourseFee: number;
  lateDays: number;
  defaultPaymentType: 'MONTHLY' | 'YEARLY';
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSettingsInput = Partial<Omit<AppSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  centerName: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  centerName?: string;
  avatar?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  description: string;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: { id: string; fullName: string; role: string };
}

// ─── Settings API ─────────────────────────────────────────────────────────────

export const settingsApi = {
  async get(): Promise<AppSettings> {
    const r = await apiClient.get<{ success: boolean; data: AppSettings }>('/settings');
    return r.data.data;
  },

  async update(data: UpdateSettingsInput): Promise<AppSettings> {
    const r = await apiClient.put<{ success: boolean; data: AppSettings }>('/settings', data);
    return r.data.data;
  },

  async reset(): Promise<AppSettings> {
    const r = await apiClient.post<{ success: boolean; data: AppSettings }>('/settings/reset');
    return r.data.data;
  },
};

// ─── Profile API ──────────────────────────────────────────────────────────────

export const profileApi = {
  async get(): Promise<UserProfile> {
    const r = await apiClient.get<{ success: boolean; data: UserProfile }>('/profile');
    return r.data.data;
  },

  async update(data: UpdateProfileInput): Promise<UserProfile> {
    const r = await apiClient.put<{ success: boolean; data: UserProfile }>('/profile', data);
    return r.data.data;
  },

  async changePassword(data: ChangePasswordInput): Promise<void> {
    await apiClient.put('/profile/password', data);
  },
};

// ─── Audit Log API ────────────────────────────────────────────────────────────

export const auditLogApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: AuditLogItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const p = new URLSearchParams();
    if (params?.page) p.append('page', String(params.page));
    if (params?.limit) p.append('limit', String(params.limit));
    if (params?.action) p.append('action', params.action);
    if (params?.entity) p.append('entity', params.entity);
    if (params?.dateFrom) p.append('dateFrom', params.dateFrom);
    if (params?.dateTo) p.append('dateTo', params.dateTo);

    const r = await apiClient.get<{
      success: boolean;
      data: AuditLogItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/audit-logs?${p.toString()}`);
    return { data: r.data.data, pagination: r.data.pagination };
  },

  async getRecent(limit = 10): Promise<AuditLogItem[]> {
    const r = await apiClient.get<{ success: boolean; data: AuditLogItem[] }>(
      `/audit-logs/recent?limit=${limit}`
    );
    return r.data.data;
  },
};
