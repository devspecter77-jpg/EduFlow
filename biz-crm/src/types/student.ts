import type { BaseEntity } from "./common";

export interface Student extends BaseEntity {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: Date | string;
  gender: "male" | "female";
  phone: string;
  email?: string;
  address: string;
  passport?: string;
  pinfl?: string;
  photo?: string;
  
  // Parent/Guardian info
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  
  // Academic info
  groupIds: string[];
  enrollmentDate: Date | string;
  status: StudentStatus;
  
  // Additional info
  notes?: string;
}

export type StudentStatus = "active" | "inactive" | "graduated" | "suspended";

export interface StudentFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  gender: "male" | "female";
  phone: string;
  email?: string;
  address: string;
  passport?: string;
  pinfl?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  groupIds?: string[];
  notes?: string;
}

export interface StudentFilters {
  search?: string;
  status?: StudentStatus;
  groupId?: string;
  gender?: "male" | "female";
}
