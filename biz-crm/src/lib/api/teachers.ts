import apiClient from './client';

export interface Teacher {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  birthDate: string | null;
  gender: 'MALE' | 'FEMALE';
  address: string | null;
  groupIds: string[];
  experience: number;
  education: string | null;
  salary: number | null;
  hireDate: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  notes: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  groupId?: string;
}

export interface TeacherListResponse {
  success: boolean;
  data: Teacher[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TeacherResponse {
  success: boolean;
  data: Teacher;
  message: string;
}

export interface CreateTeacherData {
  fullName: string;
  phone: string;
  birthDate?: string;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  groupIds?: string[];
  experience: number;
  education?: string;
  salary?: number;
  hireDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  notes?: string;
}

export const teachersApi = {
  getAll: async (filters: TeacherFilters = {}): Promise<TeacherListResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.groupId) params.set('groupId', filters.groupId);
    const res = await apiClient.get<TeacherListResponse>(`/teachers?${params.toString()}`);
    return res.data;
  },

  getById: async (id: string): Promise<TeacherResponse> => {
    const res = await apiClient.get<TeacherResponse>(`/teachers/${id}`);
    return res.data;
  },

  create: async (data: CreateTeacherData): Promise<TeacherResponse> => {
    const res = await apiClient.post<TeacherResponse>('/teachers', data);
    return res.data;
  },

  update: async (id: string, data: Partial<CreateTeacherData>): Promise<TeacherResponse> => {
    const res = await apiClient.patch<TeacherResponse>(`/teachers/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/teachers/${id}`);
  },
};
