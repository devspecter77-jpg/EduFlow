import { apiClient } from './client';

export interface NotificationLog {
  id: string;
  userId: string;
  channel: 'TELEGRAM' | 'SYSTEM' | 'SMS';
  status: 'PENDING' | 'SENT' | 'FAILED';
  recipientName: string;
  recipientId?: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  token: string | null;
  adminChatId: string | null;
  paymentReminderEnabled: boolean;
  attendanceAlertEnabled: boolean;
  reminderDaysBefore: number;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  studentsWithTelegram: number;
}

export interface SendResult {
  success: boolean;
  sent?: number;
  failed?: number;
  total?: number;
  message?: string;
  botName?: string;
  error?: string;
}

export const smartNotificationsApi = {
  // History
  async getHistory(params?: { page?: number; limit?: number; status?: string; channel?: string }) {
    const q = new URLSearchParams();
    if (params?.page)    q.append('page',    String(params.page));
    if (params?.limit)   q.append('limit',   String(params.limit));
    if (params?.status)  q.append('status',  params.status);
    if (params?.channel) q.append('channel', params.channel);
    const res = await apiClient.get<{ success: boolean; data: NotificationLog[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/smart-notifications/history?${q}`);
    return res.data;
  },

  // Stats
  async getStats() {
    const res = await apiClient.get<{ success: boolean; data: NotificationStats }>('/smart-notifications/stats');
    return res.data.data;
  },

  // Settings
  async getSettings() {
    const res = await apiClient.get<{ success: boolean; data: NotificationSettings }>('/smart-notifications/settings');
    return res.data.data;
  },
  async updateSettings(data: Partial<NotificationSettings & { telegramBotToken: string; telegramAdminChatId: string }>) {
    const res = await apiClient.patch<{ success: boolean; message: string }>('/smart-notifications/settings', data);
    return res.data;
  },

  // Validate bot
  async validateBot(token: string): Promise<SendResult> {
    const res = await apiClient.post<SendResult>('/smart-notifications/validate-bot', { token });
    return res.data;
  },

  // Send
  async sendTest(chatId: string, message: string): Promise<SendResult> {
    const res = await apiClient.post<SendResult>('/smart-notifications/send-test', { chatId, message });
    return res.data;
  },
  async sendToGroup(groupId: string, message: string, title?: string): Promise<SendResult> {
    const res = await apiClient.post<SendResult>('/smart-notifications/send-group', { groupId, message, title });
    return res.data;
  },
  async sendToAll(message: string, title?: string): Promise<SendResult> {
    const res = await apiClient.post<SendResult>('/smart-notifications/send-all', { message, title });
    return res.data;
  },
};
