// User roles
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role permissions
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ["*"], // All permissions
  [ROLES.ADMIN]: [
    "students.view",
    "students.create",
    "students.edit",
    "students.delete",
    "teachers.view",
    "teachers.create",
    "teachers.edit",
    "teachers.delete",
    "groups.view",
    "groups.create",
    "groups.edit",
    "groups.delete",
    "attendance.view",
    "attendance.mark",
    "payments.view",
    "payments.create",
    "settings.view",
    "settings.edit",
  ],
  [ROLES.TEACHER]: [
    "students.view",
    "groups.view",
    "attendance.view",
    "attendance.mark",
  ],
  [ROLES.STUDENT]: [
    "attendance.view",
    "payments.view",
  ],
  [ROLES.PARENT]: [
    "students.view",
    "attendance.view",
    "payments.view",
  ],
} as const;
