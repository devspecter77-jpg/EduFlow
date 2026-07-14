import { prisma } from '@/config/database';

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
  description: string | null;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  color: string | null;
  location: string | null;
  groupId: string | null;
  studentId: string | null;
  isRecurring: boolean;
  recurringRule: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  userId: string;
  type: EventType;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
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
  startDate?: Date;
  endDate?: Date;
  allDay?: boolean;
  color?: string;
  location?: string;
  groupId?: string;
  studentId?: string;
  isRecurring?: boolean;
  recurringRule?: string;
}

export interface EventFilters {
  userId: string;
  type?: EventType;
  startDate?: Date;
  endDate?: Date;
  groupId?: string;
  studentId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export class CalendarRepository {
  async create(data: CreateEventInput): Promise<CalendarEvent> {
    return db.calendarEvent.create({ data });
  }

  async getAll(filters: EventFilters): Promise<CalendarEvent[]> {
    const { userId, type, startDate, endDate, groupId, studentId } = filters;

    const where: Record<string, unknown> = {
      userId,
      isDeleted: false,
      ...(type && { type }),
      ...(groupId && { groupId }),
      ...(studentId && { studentId }),
      ...(startDate && endDate && {
        OR: [
          { startDate: { gte: startDate, lte: endDate } },
          { endDate: { gte: startDate, lte: endDate } },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      }),
    };

    return db.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
  }

  async getById(id: string, userId: string): Promise<CalendarEvent | null> {
    return db.calendarEvent.findFirst({
      where: { id, userId, isDeleted: false },
    });
  }

  async update(id: string, userId: string, data: UpdateEventInput): Promise<CalendarEvent> {
    const event = await this.getById(id, userId);
    if (!event) throw new Error('Event not found');
    return db.calendarEvent.update({ where: { id }, data });
  }

  async delete(id: string, userId: string): Promise<CalendarEvent> {
    const event = await this.getById(id, userId);
    if (!event) throw new Error('Event not found');
    return db.calendarEvent.update({ where: { id }, data: { isDeleted: true } });
  }

  async getToday(userId: string): Promise<CalendarEvent[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return this.getAll({ userId, startDate: startOfDay, endDate: endOfDay });
  }

  async getUpcoming(userId: string, days = 7): Promise<CalendarEvent[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    return this.getAll({ userId, startDate, endDate });
  }
}

export const calendarRepository = new CalendarRepository();
