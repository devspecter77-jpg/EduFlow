import {
  LayoutDashboard, Users, GraduationCap, UsersRound,
  ClipboardCheck, Wallet, BarChart3, FileText, Settings, Bell,
} from "lucide-react";
import type { NavItem } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard",         href: "/dashboard",               icon: LayoutDashboard, roles: ['ADMIN','MANAGER','TEACHER'] },
  { title: "O'quvchilar",       href: "/dashboard/students",      icon: Users,           roles: ['ADMIN','MANAGER','TEACHER'] },
  { title: "O'qituvchilar",     href: "/dashboard/teachers",      icon: GraduationCap,   roles: ['ADMIN','MANAGER'] },
  { title: "Guruhlar",          href: "/dashboard/groups",        icon: UsersRound,      roles: ['ADMIN','MANAGER','TEACHER'] },
  { title: "Davomat",           href: "/dashboard/attendance",    icon: ClipboardCheck,  roles: ['ADMIN','MANAGER','TEACHER'] },
  { title: "To'lovlar",         href: "/dashboard/payments",      icon: Wallet,          roles: ['ADMIN','MANAGER'] },
  { title: "Bildirishnomalar",  href: "/dashboard/notifications", icon: Bell,            roles: ['ADMIN','MANAGER'] },
  { title: "Tahlillar",         href: "/dashboard/analytics",     icon: BarChart3,       roles: ['ADMIN','MANAGER'] },
  { title: "Hisobotlar",        href: "/dashboard/reports",       icon: FileText,        roles: ['ADMIN','MANAGER'] },
  { title: "Sozlamalar",        href: "/dashboard/settings",      icon: Settings,        roles: ['ADMIN','MANAGER','TEACHER'] },
];
