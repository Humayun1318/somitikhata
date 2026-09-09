export type UserRole = 'ADMIN' | 'MEMBER' | 'SUPER_ADMIN';

export type Permission = 'VIEW_LOANS' | 'MANAGE_MEMBERS' | 'VIEW_SAVINGS';

export type DashboardSidebarItem = {
  id: string;
  titleKey: string; // next-intl translation key (e.g., 'nav.dashboard')
  href: string;
  iconName: string; // Lucide icon identifier
  roles: UserRole[]; // Which roles can see this
  permissions?: Permission[]; // Optional fine-grained permission control
  badgeKey?: string; // Optional badge/count translation key
  children?: DashboardSidebarItem[]; // Nested sub-menus
};