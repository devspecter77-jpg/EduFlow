import apiClient from './client';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeGroups: number;
  attendanceToday: number;
  monthlyRevenue: number;
  todayPayments: number;
  overdueCount: number;
}

export interface RecentStudent {
  id: string;
  fullName: string;
  phone: string;
  status: string;
  createdAt: string;
}

export interface RecentTeacher {
  id: string;
  fullName: string;
  phone: string;
  status: string;
  createdAt: string;
}

export interface RecentGroup {
  id: string;
  name: string;
  subject: string;
  level: string;
  status: string;
  teacherName: string | null;
  studentCount: number;
  createdAt: string;
}

export interface RecentPayment {
  id: string;
  amount: number;
  paidAmount: number;
  status: string;
  method: string;
  paymentDate: string;
  studentName: string;
  groupName: string | null;
  createdAt: string;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    return res.data.data;
  },
  
  getRecentStudents: async (): Promise<RecentStudent[]> => {
    const res = await apiClient.get<{ success: boolean; data: RecentStudent[] }>('/dashboard/recent-students');
    return res.data.data;
  },
  
  getRecentTeachers: async (): Promise<RecentTeacher[]> => {
    const res = await apiClient.get<{ success: boolean; data: RecentTeacher[] }>('/dashboard/recent-teachers');
    return res.data.data;
  },

  getRecentGroups: async (): Promise<RecentGroup[]> => {
    const res = await apiClient.get<{ success: boolean; data: RecentGroup[] }>('/dashboard/recent-groups');
    return res.data.data;
  },

  getRecentPayments: async (): Promise<RecentPayment[]> => {
    const res = await apiClient.get<{ success: boolean; data: RecentPayment[] }>('/dashboard/recent-payments');
    return res.data.data;
  },
};

