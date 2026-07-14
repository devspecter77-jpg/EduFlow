import type { BaseEntity } from "./common";

export interface Teacher extends BaseEntity {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: Date | string;
  gender: "male" | "female";
  phone: string;
  email: string;
  address: string;
  passport?: string;
  pinfl?: string;
  photo?: string;
  
  // Professional info
  specialization: string[];
  experience: number; // in years
  education: string;
  hireDate: Date | string;
  salary: number;
  status: TeacherStatus;
  
  // Teaching info
  groupIds: string[];
  subjects: string[];
  
  // Additional info
  bio?: string;
  notes?: string;
}

export type TeacherStatus = "active" | "inactive" | "on_leave" | "terminated";

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  gender: "male" | "female";
  phone: string;
  email: string;
  address: string;
  passport?: string;
  pinfl?: string;
  specialization: string[];
  experience: number;
  education: string;
  hireDate: string;
  salary: number;
  subjects: string[];
  bio?: string;
  notes?: string;
}

export interface TeacherFilters {
  search?: string;
  status?: TeacherStatus;
  specialization?: string;
  subjectId?: string;
}
