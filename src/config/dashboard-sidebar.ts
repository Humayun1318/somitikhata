import { DashboardSidebarItem } from "@/types/dashboard-sidbar";



export class DashboardSidebarConfig {
  static readonly items: DashboardSidebarItem[] = [
    // ==========================================
    // MEMBER ROUTES (সদস্যদের জন্য নির্ধারিত রাউট)
    // ==========================================
    {
      id: 'member-dashboard',
      titleKey: 'DashboardSidebar.dashboard',
      href: '/member/dashboard',
      iconName: 'LayoutDashboard',
      roles: ['MEMBER'],
    },
    {
      id: 'member-savings',
      titleKey: 'DashboardSidebar.savings',
      href: '/member/savings',
      iconName: 'PiggyBank',
      roles: ['MEMBER'],
      children: [
        {
          id: 'member-savings-overview',
          titleKey: 'DashboardSidebar.mySavings',
          href: '/member/savings',
          iconName: 'Wallet',
          roles: ['MEMBER'],
        },
        {
          id: 'member-deposit-request',
          titleKey: 'DashboardSidebar.depositRequest',
          href: '/member/savings/deposit-request',
          iconName: 'ArrowUpRight',
          roles: ['MEMBER'],
        },
      ],
    },
    {
      id: 'member-loans',
      titleKey: 'DashboardSidebar.loans',
      href: '/member/loans',
      iconName: 'HandCoins',
      roles: ['MEMBER'],
      children: [
        {
          id: 'member-loans-overview',
          titleKey: 'DashboardSidebar.myLoans',
          href: '/member/loans',
          iconName: 'Receipt',
          roles: ['MEMBER'],
        },
        {
          id: 'member-loan-apply',
          titleKey: 'DashboardSidebar.applyLoan',
          href: '/member/loans/apply',
          iconName: 'FilePlus',
          roles: ['MEMBER'],
        },
      ],
    },
    {
      id: 'member-profile',
      titleKey: 'DashboardSidebar.profile',
      href: '/member/profile',
      iconName: 'User',
      roles: ['MEMBER'],
    },

    // ==========================================
    // ADMIN ROUTES (অ্যাডমিনদের জন্য নির্ধারিত রাউট)
    // ==========================================
    {
      id: 'admin-dashboard',
      titleKey: 'DashboardSidebar.adminDashboard',
      href: '/admin/dashboard',
      iconName: 'LayoutDashboard',
      roles: ['ADMIN'],
    },
    {
      id: 'admin-members',
      titleKey: 'DashboardSidebar.members',
      href: '/admin/members',
      iconName: 'Users',
      roles: ['ADMIN'],
      permissions: ['MANAGE_MEMBERS'],
      children: [
        {
          id: 'admin-all-members',
          titleKey: 'DashboardSidebar.allMembers',
          href: '/admin/members',
          iconName: 'UserCheck',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-pending-members',
          titleKey: 'DashboardSidebar.pendingMembers',
          href: '/admin/members/pending',
          iconName: 'UserPlus',
          roles: ['ADMIN'],
        },
      ],
    },
    {
      id: 'admin-collections',
      titleKey: 'DashboardSidebar.collections',
      href: '/admin/collections',
      iconName: 'Receipt',
      roles: ['ADMIN'],
      permissions: ['MANAGE_COLLECTIONS'],
    },
    {
      id: 'admin-loans-management',
      titleKey: 'DashboardSidebar.loansManagement',
      href: '/admin/loans',
      iconName: 'FileSpreadsheet',
      roles: ['ADMIN'],
      permissions: ['MANAGE_LOANS'],
    },
    {
      id: 'admin-reports',
      titleKey: 'DashboardSidebar.reports',
      href: '/admin/reports',
      iconName: 'BarChart3',
      roles: ['ADMIN'],
      permissions: ['VIEW_REPORTS'],
    },
    {
      id: 'admin-settings',
      titleKey: 'DashboardSidebar.settings',
      href: '/admin/settings',
      iconName: 'Settings',
      roles: ['ADMIN'],
    },
    {
      id: 'admin-profile',
      titleKey: 'DashboardSidebar.profile',
      href: '/admin/profile',
      iconName: 'User',
      roles: ['ADMIN'],
    },
    
  ];
}