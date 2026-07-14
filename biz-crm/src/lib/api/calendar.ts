import { apiClient } from './client';

export type EventType =
  | 'CLASS'
  | 'PAYMENT_DUE'
  | 'REMINDER'
  | 'MEETING'
  | 'EXAM'
  | 'HOLIDAY'
  | 'OTHER';

export interface CalendarEvent {
  id: string;
  userId: string;
  type: EventType;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color?: string;
  location?: string;
  groupId?: string;
  studentId?: string;
  isRecurring: boolean;
  recurringRule?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  type: EventType;
  title: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  allDay?: boolean;
  color?: string;
  location?: string;
  groupId?: string;
  studentId?: string;
  isRecurring?: boolean;
  recurringRule?: string;
}

export interface UpdateEventInput {
  type?: EventType;
  title?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  allDay?: boolean;
  color?: string;
  location?: string;
  groupId?: string;
  studentId?: string;
  isRecurring?: boolean;
  recurringRule?: string;
}

export interface EventFilters {
  type?: EventType;
  startDate?: string | Date;
  endDate?: string | Date;
  groupId?: string;
  studentId?: string;
}

export interface EventResponse {
  success: boolean;
  data: CalendarEvent[];
}

export interface SingleEventResponse {
  success: boolean;
  data: CalendarEvent;
}

export const calendarApi = {
  /**
   * Get all events
   */
  async getAll(filters?: EventFilters): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate)
      params.append('startDate', new Date(filters.startDate).toISOString());
    if (filters?.endDate)
      params.append('endDate', new Date(filters.endDate).toISOString());
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.studentId) params.append('studentId', filters.studentId);

    const response = await apiClient.get<EventResponse>(
      `/calendar/events?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get today's events
   */
  async getToday(): Promise<CalendarEvent[]> {
    const response = await apiClient.get<EventResponse>('/calendar/events/today');
    return response.data.data;
  },

  /**
   * Get upcoming events
   */
  async getUpcoming(days = 7): Promise<CalendarEvent[]> {
    const response = await apiClient.get<EventResponse>(
      `/calendar/events/upcoming?days=${days}`
    );
    return response.data.data;
  },

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<CalendarEvent> {
    const response = await apiClient.get<SingleEventResponse>(
      `/calendar/events/${id}`
    );
    return response.data.data;
  },

  /**
   * Create event
   */
  async create(data: CreateEventInput): Promise<CalendarEvent> {
    const response = await apiClient.post<SingleEventResponse>(
      '/calendar/events',
      data
    );
    return response.data.data;
  },

  /**
   * Update event
   */
  async update(id: string, data: UpdateEventInput): Promise<CalendarEvent> {
    const response = await apiClient.patch<SingleEventResponse>(
      `/calendar/events/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete event
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/calendar/events/${id}`);
  },
};
