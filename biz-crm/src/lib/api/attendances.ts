import apiClient from './client';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface Attendance {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    fullName: string;
    phone: string;
    status?: string;
  };
  group: {
    id: string;
    name: string;
    subject: string;
    level?: string;
  };
}

export interface AttendanceFilters {
  page?: number;
  limit?: number;
  groupId?: string;
  studentId?: string;
  status?: AttendanceStatus;
  startDate?: string;
  endDate?: string;
}

export interface BulkAttendanceItem {
  studentId: string;
  status: AttendanceStatus;
  notes?: string | null;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface GroupStudentForAttendance {
  id: string;
  studentId: string;
  groupId: string;
  isActive: boolean;
  student: {
    id: string;
    fullName: string;
    phone: string;
    status: string;
  };
}

export const attendancesApi = {
  async getAll(filters?: AttendanceFilters) {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`/attendances?${params.toString()}`);
    return response.data as { success: boolean; data: Attendance[]; pagination?: { total: number; page: number; limit: number; totalPages: number } };
  },

  async getById(id: string) {
    const response = await apiClient.get(`/attendances/${id}`);
    return response.data as { success: boolean; data: Attendance };
  },

  async create(data: { studentId: string; groupId: string; date: string; status: AttendanceStatus; notes?: string | null }) {
    const response = await apiClient.post('/attendances', data);
    return response.data as { success: boolean; data: Attendance };
  },

  async bulkCreate(data: { groupId: string; date: string; attendances: BulkAttendanceItem[] }) {
    const response = await apiClient.post('/attendances/bulk', data);
    return response.data as { success: boolean; data: { success: boolean; count: number } };
  },

  async update(id: string, data: { status?: AttendanceStatus; notes?: string | null }) {
    const response = await apiClient.patch(`/attendances/${id}`, data);
    return response.data as { success: boolean; data: Attendance };
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/attendances/${id}`);
    return response.data as { success: boolean; message?: string };
  },

  async getGroupByDate(groupId: string, date: string) {
    const response = await apiClient.get(`/attendances/group/${groupId}/date?date=${encodeURIComponent(date)}`);
    return response.data as { success: boolean; data: Attendance[] };
  },

  async getGroupStats(groupId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`/attendances/stats/group/${groupId}?${params.toString()}`);
    return response.data as { success: boolean; data: AttendanceStats };
  },

  async getStudentStats(studentId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`/attendances/stats/student/${studentId}?${params.toString()}`);
    return response.data as { success: boolean; data: AttendanceStats };
  },
};
