// Status colors
export const STATUS_COLORS = {
  success: "text-green-600 bg-green-50 border-green-200",
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
  error: "text-red-600 bg-red-50 border-red-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",
  default: "text-gray-600 bg-gray-50 border-gray-200",
} as const;

// Payment status colors
export const PAYMENT_STATUS_COLORS = {
  paid: "text-green-600 bg-green-50",
  pending: "text-yellow-600 bg-yellow-50",
  overdue: "text-red-600 bg-red-50",
  cancelled: "text-gray-600 bg-gray-50",
} as const;

// Attendance status colors
export const ATTENDANCE_STATUS_COLORS = {
  present: "text-green-600 bg-green-50",
  absent: "text-red-600 bg-red-50",
  late: "text-yellow-600 bg-yellow-50",
  excused: "text-blue-600 bg-blue-50",
} as const;

// Group status colors
export const GROUP_STATUS_COLORS = {
  active: "text-green-600 bg-green-50",
  inactive: "text-gray-600 bg-gray-50",
  completed: "text-blue-600 bg-blue-50",
  cancelled: "text-red-600 bg-red-50",
} as const;
