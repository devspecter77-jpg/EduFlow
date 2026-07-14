import apiClient from './client';

export interface StudentWithPaymentInfo {
  id: string;
  fullName: string;
  phone: string;
  parentFullName?: string | null;
  parentPhone?: string | null;
  groupId?: string | null;
  status: string;
  paymentAmount?: number | null;
  paidAmount: number;
  remainingAmount: number;
  nextPaymentDate?: string | null;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  groups: Array<{
    id: string;
    studentId: string;
    groupId: string;
    group: {
      id: string;
      name: string;
      subject: string;
    };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paidAmount: number;
    paidDate?: string | null;
    method: 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
    notes?: string | null;
    createdAt: string;
  }>;
}

export interface PaymentStats {
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
  overdueCount: number;
  paidCount: number;
  pendingCount: number;
  partialCount: number;
  todayPayments: number;
}

export interface ProcessPaymentInput {
  studentId: string;
  groupId: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate: string;
  status: 'PAID' | 'PARTIAL';
  method: 'CASH' | 'CARD' | 'TRANSFER';
  notes?: string;
}

export interface PaymentFilters {
  search?: string;
  status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  groupId?: string;
  page?: number;
  limit?: number;
}

export const paymentsNewApi = {
  async getStudentsWithPaymentInfo(filters?: PaymentFilters) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<{
      success: boolean;
      data: StudentWithPaymentInfo[];
      message: string;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/payments/students-with-payment-info?${params.toString()}`);
    
    return response.data;
  },

  async getPaymentStats() {
    const response = await apiClient.get<{
      success: boolean;
      data: PaymentStats;
      message: string;
    }>('/payments/stats');
    
    return response.data.data;
  },

  async processPayment(data: ProcessPaymentInput) {
    const response = await apiClient.post<{
      success: boolean;
      data: unknown;
      message: string;
    }>('/payments/process', data);
    
    return response.data;
  },
};
