// Global type definitions
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // RBAC: allowed roles (undefined = all roles)
}

// Re-export all types
export * from "./common";
export * from "./student";
export * from "./teacher";
export * from "./group";
export * from "./payment";
export * from "./attendance";
