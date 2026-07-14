import { apiClient } from './client';
import type { Student } from './students';
import type { Teacher } from './teachers';
import type { Group } from './groups';
import type { Payment } from './payments';

export interface SearchResult {
  students: Student[];
  teachers: Teacher[];
  groups: Group[];
  payments: Payment[];
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult;
}

export const searchApi = {
  /**
   * Global search across all entities
   */
  async search(query: string): Promise<SearchResult> {
    if (!query.trim()) {
      return {
        students: [],
        teachers: [],
        groups: [],
        payments: [],
      };
    }

    // Parallel search across all entities
    const [students, teachers, groups, payments] = await Promise.all([
      apiClient
        .get<{ success: boolean; data: Student[] }>(`/students?search=${query}&limit=5`)
        .then((r) => r.data.data)
        .catch(() => []),
      apiClient
        .get<{ success: boolean; data: Teacher[] }>(`/teachers?search=${query}&limit=5`)
        .then((r) => r.data.data)
        .catch(() => []),
      apiClient
        .get<{ success: boolean; data: Group[] }>(`/groups?search=${query}&limit=5`)
        .then((r) => r.data.data)
        .catch(() => []),
      apiClient
        .get<{ success: boolean; data: Payment[] }>(`/payments?search=${query}&limit=5`)
        .then((r) => r.data.data)
        .catch(() => []),
    ]);

    return {
      students,
      teachers,
      groups,
      payments,
    };
  },
};
