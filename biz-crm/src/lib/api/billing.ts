import { apiClient as api } from './client';

// ─── Types ────────────────────────────────────────────────────────────────

export interface BillingSubscription {
  id: string;
  centerId: string;
  planId: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  startDate: string;
  endDate: string;
  price: number;
  notes?: string;
  plan?: {
    id: string;
    type: string;
    name: string;
    price: number;
    maxStudents: number;
    maxTeachers: number;
    maxGroups: number;
    features: string;
  };
}

export interface MySubscriptionResponse {
  center: { id: string; name: string; status: string };
  subscription: BillingSubscription | null;
  daysLeft: number;
  isExpired: boolean;
  isTrial: boolean;
  isActive: boolean;
}

export interface PaymentRequest {
  id: string;
  centerId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  method: string;
  receiptImage?: string;
  notes?: string;
  rejectionNote?: string;
  approvedAt?: string;
  createdAt: string;
  center?: {
    id: string;
    name: string;
    users?: Array<{ id: string; fullName: string; phone: string }>;
  };
}

export interface SubscriptionItem {
  id: string;
  centerId: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  startDate: string;
  endDate: string;
  price: number;
  plan?: { name: string; type: string };
  center?: {
    id: string;
    name: string;
    users?: Array<{ id: string; fullName: string; phone: string }>;
  };
}

// ─── Admin API ────────────────────────────────────────────────────────────

export const billingApi = {
  // Get my subscription info
  async getMySubscription(): Promise<MySubscriptionResponse> {
    const res = await api.get<{ data: MySubscriptionResponse }>('/billing/my-subscription');
    return res.data.data;
  },

  // Submit payment request
  async createPaymentRequest(data: {
    amount: number;
    receiptImage?: string;
    notes?: string;
  }): Promise<PaymentRequest> {
    const res = await api.post<{ data: PaymentRequest }>('/billing/payment-requests', data);
    return res.data.data;
  },

  // My payment history
  async getMyPaymentRequests(): Promise<PaymentRequest[]> {
    const res = await api.get<{ data: PaymentRequest[] }>('/billing/payment-requests/my');
    return res.data.data;
  },
};

// ─── Super Admin API ──────────────────────────────────────────────────────

export const adminBillingApi = {
  // All payment requests
  async listPaymentRequests(params?: { status?: string; page?: number; limit?: number }) {
    const res = await api.get<{
      data: PaymentRequest[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/billing/admin/payment-requests', { params });
    return res.data;
  },

  // Approve
  async approvePaymentRequest(id: string) {
    await api.post(`/billing/admin/payment-requests/${id}/approve`);
  },

  // Reject
  async rejectPaymentRequest(id: string, rejectionNote: string) {
    await api.post(`/billing/admin/payment-requests/${id}/reject`, { rejectionNote });
  },

  // All subscriptions
  async listSubscriptions(params?: { status?: string; page?: number; limit?: number }) {
    const res = await api.get<{
      data: SubscriptionItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/billing/admin/subscriptions', { params });
    return res.data;
  },
};
