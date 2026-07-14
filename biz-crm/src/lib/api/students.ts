import apiClient from './client';

export interface Student {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  parentFullName: string | null;
  parentPhone: string | null;
  telegramId: string | null;
  birthDate: string | null;
  gender: 'MALE' | 'FEMALE';
  address: string | null;
  groupId: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'EXPELLED';
  notes: string | null;
  isDeleted: boolean;
  startDate: string | null;
  paymentType: 'MONTHLY' | 'YEARLY';
  paymentAmount: number | null;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  nextPaymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  gender?: string;
}

export interface StudentListResponse {
  success: boolean;
  data: Student[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentResponse {
  success: boolean;
  data: Student;
  message: string;
}

export interface CreateStudentData {
  fullName: string;
  phone: string;
  parentFullName?: string;
  parentPhone?: string;
  birthDate?: string;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  groupId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'EXPELLED';
  notes?: string;
  startDate?: string;
  paymentType: 'MONTHLY' | 'YEARLY';
  paymentAmount?: number;
  nextPaymentDate?: string;
}

export const studentsApi = {
  getAll: async (filters: StudentFilters = {}): Promise<StudentListResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.gender) params.set('gender', filters.gender);
    const res = await apiClient.get<StudentListResponse>(`/students?${params.toString()}`);
    return res.data;
  },

  getById: async (id: string): Promise<StudentResponse> => {
    const res = await apiClient.get<StudentResponse>(`/students/${id}`);
    return res.data;
  },

  create: async (data: CreateStudentData): Promise<StudentResponse> => {
    const res = await apiClient.post<StudentResponse>('/students', data);
    return res.data;
  },

  update: async (id: string, data: Partial<CreateStudentData>): Promise<StudentResponse> => {
    const res = await apiClient.patch<StudentResponse>(`/students/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },
};
