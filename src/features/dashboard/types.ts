export type UserRole = 'ADMIN' | 'MEMBER' | 'SUPER_ADMIN';

export type Permission =
    | 'MANAGE_MEMBERS'
    | 'MANAGE_COLLECTIONS'
    | 'MANAGE_LOANS'
    | 'VIEW_REPORTS';

export type DashboardSidebarItem = {
    id: string;
    titleKey: string;
    href: string;
    iconName: string;
    roles: UserRole[];
    permissions?: Permission[];
    children?: DashboardSidebarItem[];
};