import type { BaseEntity } from "./common";

export interface Attendance extends BaseEntity {
  studentId: string;
  groupId: string;
  date: Date | string;
  status: AttendanceStatus;
  
  // Time tracking
  checkInTime?: string;
  checkOutTime?: string;
  
  // Additional info
  notes?: string;
  markedBy?: string; // Teacher ID
}

export type AttendanceStatus = 
  | "present" 
  | "absent" 
  | "late" 
  | "excused";

export interface AttendanceFormData {
  studentId: string;
  groupId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface AttendanceFilters {
  groupId?: string;
  studentId?: string;
  status?: AttendanceStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface AttendanceStats {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
}
