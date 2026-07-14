import { apiClient } from './client';

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  total: number;
  errors: Array<{
    row: number;
    field: string;
    value: unknown;
    message: string;
  }>;
}

export const importExportApi = {
  // ─── IMPORT ─────────────────────────────────────────────────────────────────

  async importStudents(file: File): Promise<ImportResult> {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post<ImportResult>('/import/students', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async importTeachers(file: File): Promise<ImportResult> {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post<ImportResult>('/import/teachers', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async importGroups(file: File): Promise<ImportResult> {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post<ImportResult>('/import/groups', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // ─── TEMPLATES ──────────────────────────────────────────────────────────────

  getStudentTemplateUrl(): string {
    const base = (apiClient.defaults.baseURL ?? '').replace(/\/$/, '');
    return `${base}/import/students/template`;
  },
  getTeacherTemplateUrl(): string {
    const base = (apiClient.defaults.baseURL ?? '').replace(/\/$/, '');
    return `${base}/import/teachers/template`;
  },
  getGroupTemplateUrl(): string {
    const base = (apiClient.defaults.baseURL ?? '').replace(/\/$/, '');
    return `${base}/import/groups/template`;
  },

  // ─── EXPORT ─────────────────────────────────────────────────────────────────

  async exportStudents(ids?: string[]) {
    const params = ids?.length ? `?ids=${ids.join(',')}` : '';
    const res = await apiClient.get(`/export/students${params}`, { responseType: 'blob' });
    downloadBlob(res.data as Blob, `Oquvchilar_${today()}.xlsx`);
  },

  async exportTeachers(ids?: string[]) {
    const params = ids?.length ? `?ids=${ids.join(',')}` : '';
    const res = await apiClient.get(`/export/teachers${params}`, { responseType: 'blob' });
    downloadBlob(res.data as Blob, `Oqituvchilar_${today()}.xlsx`);
  },

  async exportGroups(ids?: string[]) {
    const params = ids?.length ? `?ids=${ids.join(',')}` : '';
    const res = await apiClient.get(`/export/groups${params}`, { responseType: 'blob' });
    downloadBlob(res.data as Blob, `Guruhlar_${today()}.xlsx`);
  },

  async exportPayments() {
    const res = await apiClient.get('/export/payments', { responseType: 'blob' });
    downloadBlob(res.data as Blob, `Tolovlar_${today()}.xlsx`);
  },

  async exportAttendances() {
    const res = await apiClient.get('/export/attendances', { responseType: 'blob' });
    downloadBlob(res.data as Blob, `Davomat_${today()}.xlsx`);
  },
};

// ─── helpers ────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
