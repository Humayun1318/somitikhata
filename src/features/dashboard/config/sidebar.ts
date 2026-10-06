import { DashboardSidebarItem } from "@/features/dashboard/types";



export class DashboardSidebarConfig {
  static readonly items: DashboardSidebarItem[] = [
    // Member area
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
      id: 'member-membership',
      titleKey: 'DashboardSidebar.membership',
      href: '/member/membership',
      iconName: 'IdCard',
      roles: ['MEMBER'],
    },
    {
      id: 'member-profile',
      titleKey: 'DashboardSidebar.profile',
      href: '/member/profile',
      iconName: 'User',
      roles: ['MEMBER'],
    },

    // Admin area (super admin included; super-admin-only actions are hidden inside the pages)
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
      children: [
        {
          id: 'admin-collections-overview',
          titleKey: 'DashboardSidebar.collectionsOverview',
          href: '/admin/collections',
          iconName: 'LayoutGrid',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-cash-book',
          titleKey: 'DashboardSidebar.cashBook',
          href: '/admin/collections/cash-book',
          iconName: 'BookOpenText',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-passbook',
          titleKey: 'DashboardSidebar.passbook',
          href: '/admin/collections/passbook',
          iconName: 'Wallet',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-society-entries',
          titleKey: 'DashboardSidebar.societyEntries',
          href: '/admin/collections/society',
          iconName: 'Landmark',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-ledger-heads',
          titleKey: 'DashboardSidebar.ledgerHeads',
          href: '/admin/collections/heads',
          iconName: 'FolderTree',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-opening-balances',
          titleKey: 'DashboardSidebar.openingBalances',
          href: '/admin/collections/opening',
          iconName: 'History',
          roles: ['ADMIN'],
        },
      ],
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
      children: [
        {
          id: 'admin-reports-list',
          titleKey: 'DashboardSidebar.reportsList',
          href: '/admin/reports',
          iconName: 'FileText',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-year-end',
          titleKey: 'DashboardSidebar.yearEnd',
          href: '/admin/year-end',
          iconName: 'CalendarCheck',
          roles: ['ADMIN'],
        },
      ],
    },
    {
      id: 'admin-admins',
      titleKey: 'DashboardSidebar.admins',
      href: '/admin/admins',
      iconName: 'ShieldCheck',
      roles: ['ADMIN'],
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