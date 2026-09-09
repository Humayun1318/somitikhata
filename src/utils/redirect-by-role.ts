import { UserRole } from "@/types/dashboard-sidbar";


export function getDefaultDashboardRoute(role: UserRole, locale: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return `/${locale}/dashboard`; // অথবা আলাদা প্রশাসনিক ওভারভিউ থাকলে: `/${locale}/admin/dashboard`
    case 'MEMBER':
      return `/${locale}/dashboard`;
    default:
      return `/${locale}/login`;
  }
}