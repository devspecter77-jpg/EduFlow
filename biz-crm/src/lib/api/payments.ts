import apiClient from './client';

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

export interface Payment {
  id: string;
  studentId: string;
  groupId: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate?: string | null;
  status: PaymentStatus;
  method: PaymentMethod;
  notes?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  student: { id: string; fullName: string; phone: string };
  group: { id: string; name: string; subject: string };
}

export interface CreatePaymentInput {
  studentId: string;
  groupId: string;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  paidDate?: string | null;
  status?: PaymentStatus;
  method?: PaymentMethod;
  notes?: string | null;
}

export interface UpdatePaymentInput {
  amount?: number;
  paidAmount?: number;
  dueDate?: string;
  paidDate?: string | null;
  status?: PaymentStatus;
  method?: PaymentMethod;
  notes?: string | null;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  groupId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export const paymentsApi = {
  async getAll(filters?: PaymentFilters) {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.method) params.append('method', filters.method);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const response = await apiClient.get(`/payments?${params.toString()}`);
    return response.data as { success: boolean; data: Payment[]; pagination?: { total: number; page: number; limit: number; totalPages: number } };
  },

  async getById(id: string) {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data as { success: boolean; data: Payment };
  },

  async create(data: CreatePaymentInput) {
    const response = await apiClient.post('/payments', data);
    return response.data as { success: boolean; data: Payment };
  },

  async update(id: string, data: UpdatePaymentInput) {
    const response = await apiClient.patch(`/payments/${id}`, data);
    return response.data as { success: boolean; data: Payment };
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/payments/${id}`);
    return response.data as { success: boolean };
  },

  async getOverdue() {
    const response = await apiClient.get('/payments/overdue');
    return response.data as { success: boolean; data: Payment[] };
  },
};
