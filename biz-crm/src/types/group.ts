import type { BaseEntity } from "./common";

export interface Group extends BaseEntity {
  name: string;
  subject: string;
  level: string;
  teacherId: string;
  studentIds: string[];
  
  // Schedule
  schedule: GroupSchedule[];
  startDate: Date | string;
  endDate: Date | string;
  
  // Financial
  courseFee: number;
  maxStudents: number;
  
  // Status
  status: GroupStatus;
  
  // Additional info
  description?: string;
  room?: string;
}

export interface GroupSchedule {
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export type GroupStatus = "active" | "inactive" | "completed" | "cancelled";

export interface GroupFormData {
  name: string;
  subject: string;
  level: string;
  teacherId: string;
  schedule: GroupSchedule[];
  startDate: string;
  endDate: string;
  courseFee: number;
  maxStudents: number;
  description?: string;
  room?: string;
}

export interface GroupFilters {
  search?: string;
  status?: GroupStatus;
  teacherId?: string;
  subject?: string;
  level?: string;
}
