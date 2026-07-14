import apiClient from './client';

export interface Group {
  id: string;
  userId: string;
  name: string;
  subject: string;
  level: string;
  teacherId: string;
  startDate: string;
  endDate?: string | null;
  schedule: string;
  courseFee: number;
  maxStudents: number;
  room?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';
  description?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: string;
    fullName: string;
    phone: string;
    experience?: number;
  };
  students?: Array<{
    id: string;
    studentId: string;
    groupId: string;
    joinedAt: string;
    leftAt?: string | null;
    isActive: boolean;
    student: {
      id: string;
      fullName: string;
      phone: string;
      status: string;
    };
  }>;
  _count: {
    students: number;
    attendances?: number;
    payments?: number;
  };
}

export interface CreateGroupInput {
  name: string;
  subject: string;
  level: string;
  teacherId?: string | null;
  startDate: string;
  endDate?: string | null;
  schedule: string;
  courseFee: number;
  maxStudents?: number;
  room?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';
  description?: string | null;
}

export interface UpdateGroupInput {
  name?: string;
  subject?: string;
  level?: string;
  teacherId?: string | null;
  startDate?: string;
  endDate?: string | null;
  schedule?: string;
  courseFee?: number;
  maxStudents?: number;
  room?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';
  description?: string | null;
}

export interface GroupFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';
  teacherId?: string;
}

export interface GroupsResponse {
  success: boolean;
  data: Group[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GroupResponse {
  success: boolean;
  data: Group;
  message?: string;
}

export const groupsApi = {
  async getAll(filters?: GroupFilters): Promise<GroupsResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);

    const response = await apiClient.get(`/groups?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<GroupResponse> {
    const response = await apiClient.get(`/groups/${id}`);
    return response.data;
  },

  async create(data: CreateGroupInput): Promise<GroupResponse> {
    const response = await apiClient.post('/groups', data);
    return response.data;
  },

  async update(id: string, data: UpdateGroupInput): Promise<GroupResponse> {
    const response = await apiClient.patch(`/groups/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete(`/groups/${id}`);
    return response.data;
  },

  async addStudent(groupId: string, studentId: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post(`/groups/${groupId}/students`, { studentId });
    return response.data;
  },

  async removeStudent(groupId: string, studentId: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete(`/groups/${groupId}/students/${studentId}`);
    return response.data;
  },

  async getStudents(groupId: string): Promise<GroupResponse> {
    const response = await apiClient.get(`/groups/${groupId}/students`);
    return response.data;
  },
};
