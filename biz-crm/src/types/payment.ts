import type { BaseEntity } from "./common";

export interface Payment extends BaseEntity {
  studentId: string;
  groupId: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  
  // Payment details
  paymentDate: Date | string;
  dueDate: Date | string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  
  // Reference
  transactionId?: string;
  receiptNumber?: string;
  
  // Additional info
  description?: string;
  notes?: string;
}

export type PaymentMethod = 
  | "cash" 
  | "card" 
  | "bank_transfer" 
  | "online";

export type PaymentStatus = 
  | "paid" 
  | "partial" 
  | "pending" 
  | "overdue" 
  | "cancelled";

export interface PaymentFormData {
  studentId: string;
  groupId: string;
  amount: number;
  paidAmount: number;
  paymentDate: string;
  dueDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  description?: string;
  notes?: string;
}

export interface PaymentFilters {
  search?: string;
  status?: PaymentStatus;
  studentId?: string;
  groupId?: string;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalAmount: number;
}
