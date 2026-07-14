import apiClient from './client';

// ============ ANALYTICS TYPES ============

export interface OverviewStats {
  students: { total: number; active: number; graduated: number };
  teachers: { total: number; active: number };
  groups: { total: number; active: number };
  revenue: { total: number; monthly: number; yearly: number };
  payments: { overdueStudents: number };
  attendance: { total: number; presentRate: number };
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  year: number;
  monthNum: number;
}

export interface StudentGrowth {
  month: string;
  total: number;
  new: number;
  year: number;
  monthNum: number;
}

export interface AttendanceStats {
  PRESENT: number;
  ABSENT: number;
  LATE: number;
  EXCUSED: number;
  total: number;
  presentRate: number;
  absentRate: number;
}

export interface PaymentStats {
  byStatus: {
    PENDING: number;
    PARTIAL: number;
    PAID: number;
    OVERDUE: number;
    CANCELLED: number;
  };
  totalRevenue: number;
  totalDebt: number;
}

export interface TopGroup {
  id: string;
  name: string;
  subject: string;
  status: string;
  courseFee: number;
  _count: { students: number; attendances: number; payments: number };
}

// ============ REPORT TYPES ============

export interface ReportFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  gender?: string;
  groupId?: string;
  teacherId?: string;
  dateFrom?: string;
  dateTo?: string;
  method?: string;
  paymentStatus?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentReport {
  id: string;
  fullName: string;
  phone: string;
  gender: string;
  status: string;
  groupId: string | null;
  paymentStatus: string;
  paymentAmount: number | null;
  paidAmount: number;
  remainingAmount: number;
  nextPaymentDate: string | null;
  startDate: string | null;
  createdAt: string;
  groups: Array<{ group: { id: string; name: string; subject: string } }>;
}

export interface AttendanceReport {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  createdAt: string;
  student: { id: string; fullName: string; phone: string };
  group: { id: string; name: string; subject: string };
}

export interface PaymentReport {
  id: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
  method: string;
  notes: string | null;
  createdAt: string;
  student: { id: string; fullName: string; phone: string };
  group: { id: string; name: string; subject: string } | null;
}

export interface GroupReport {
  id: string;
  name: string;
  subject: string;
  level: string;
  status: string;
  courseFee: number;
  maxStudents: number;
  startDate: string;
  createdAt: string;
  teacher: { id: string; fullName: string } | null;
  _count: { students: number; attendances: number; payments: number };
}

export interface TeacherReport {
  id: string;
  fullName: string;
  phone: string;
  gender: string;
  experience: number;
  education: string | null;
  salary: number | null;
  status: string;
  hireDate: string | null;
  createdAt: string;
  groups: Array<{
    id: string;
    name: string;
    subject: string;
    status: string;
    _count: { students: number };
  }>;
}

// ============ API CALLS ============

function buildParams(filters: ReportFilters): string {
  const p = new URLSearchParams();
  if (filters.page) p.append('page', String(filters.page));
  if (filters.limit) p.append('limit', String(filters.limit));
  if (filters.search) p.append('search', filters.search);
  if (filters.status) p.append('status', filters.status);
  if (filters.gender) p.append('gender', filters.gender);
  if (filters.groupId) p.append('groupId', filters.groupId);
  if (filters.teacherId) p.append('teacherId', filters.teacherId);
  if (filters.dateFrom) p.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) p.append('dateTo', filters.dateTo);
  if (filters.method) p.append('method', filters.method);
  if (filters.paymentStatus) p.append('paymentStatus', filters.paymentStatus);
  return p.toString();
}

export const reportsApi = {
  // Analytics
  async getOverview(): Promise<OverviewStats> {
    const r = await apiClient.get<{ success: boolean; data: OverviewStats }>('/reports/overview');
    return r.data.data;
  },

  async getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
    const r = await apiClient.get<{ success: boolean; data: MonthlyRevenue[] }>('/reports/monthly-revenue');
    return r.data.data;
  },

  async getStudentGrowth(): Promise<StudentGrowth[]> {
    const r = await apiClient.get<{ success: boolean; data: StudentGrowth[] }>('/reports/student-growth');
    return r.data.data;
  },

  async getAttendanceStats(days?: number): Promise<AttendanceStats> {
    const p = days ? `?days=${days}` : '';
    const r = await apiClient.get<{ success: boolean; data: AttendanceStats }>(`/reports/attendance-stats${p}`);
    return r.data.data;
  },

  async getPaymentStats(): Promise<PaymentStats> {
    const r = await apiClient.get<{ success: boolean; data: PaymentStats }>('/reports/payment-stats');
    return r.data.data;
  },

  async getTopGroups(limit?: number): Promise<TopGroup[]> {
    const p = limit ? `?limit=${limit}` : '';
    const r = await apiClient.get<{ success: boolean; data: TopGroup[] }>(`/reports/top-groups${p}`);
    return r.data.data;
  },

  // Reports
  async getStudentsReport(filters: ReportFilters): Promise<{ data: StudentReport[]; pagination: Pagination }> {
    const r = await apiClient.get<{ success: boolean; data: StudentReport[]; pagination: Pagination }>(
      `/reports/students?${buildParams(filters)}`
    );
    return { data: r.data.data, pagination: r.data.pagination };
  },

  async getAttendanceReport(filters: ReportFilters): Promise<{ data: AttendanceReport[]; pagination: Pagination }> {
    const r = await apiClient.get<{ success: boolean; data: AttendanceReport[]; pagination: Pagination }>(
      `/reports/attendances?${buildParams(filters)}`
    );
    return { data: r.data.data, pagination: r.data.pagination };
  },

  async getPaymentsReport(filters: ReportFilters): Promise<{
    data: PaymentReport[];
    pagination: Pagination;
    summary: { totalAmount: number; totalPaid: number };
  }> {
    const r = await apiClient.get<{
      success: boolean;
      data: PaymentReport[];
      pagination: Pagination;
      summary: { totalAmount: number; totalPaid: number };
    }>(`/reports/payments?${buildParams(filters)}`);
    return { data: r.data.data, pagination: r.data.pagination, summary: r.data.summary };
  },

  async getGroupsReport(filters: ReportFilters): Promise<{ data: GroupReport[]; pagination: Pagination }> {
    const r = await apiClient.get<{ success: boolean; data: GroupReport[]; pagination: Pagination }>(
      `/reports/groups?${buildParams(filters)}`
    );
    return { data: r.data.data, pagination: r.data.pagination };
  },

  async getTeachersReport(filters: ReportFilters): Promise<{ data: TeacherReport[]; pagination: Pagination }> {
    const r = await apiClient.get<{ success: boolean; data: TeacherReport[]; pagination: Pagination }>(
      `/reports/teachers?${buildParams(filters)}`
    );
    return { data: r.data.data, pagination: r.data.pagination };
  },
};
