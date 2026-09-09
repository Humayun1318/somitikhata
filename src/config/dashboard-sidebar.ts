import { DashboardSidebarItem } from "@/types/dashboard-sidbar";


export class DashboardSidebarConfig {
    static readonly items: DashboardSidebarItem[] = [
        {
            id: 'dashboard',
            titleKey: 'DashboardSidebar.dashboard',
            href: '/dashboard',
            iconName: 'LayoutDashboard',
            roles: ['ADMIN', 'MEMBER'],
        },
        {
            id: 'members',
            titleKey: 'DashboardSidebar.members',
            href: '/admin/members',
            iconName: 'Users',
            roles: ['ADMIN'], // শুধুমাত্র অ্যাডমিন দেখতে পাবে
            permissions: ['MANAGE_MEMBERS'],
        },
        {
            id: 'savings',
            titleKey: 'DashboardSidebar.savings',
            href: '/savings',
            iconName: 'PiggyBank',
            roles: ['MEMBER'],
            children: [
                {
                    id: 'my-savings',
                    titleKey: 'DashboardSidebar.mySavings',
                    href: '/savings/my-deposits',
                    iconName: 'Wallet',
                    roles: ['MEMBER'],
                },
                {
                    id: 'all-savings',
                    titleKey: 'DashboardSidebar.allSavings',
                    href: '/admin/savings',
                    iconName: 'Receipt',
                    roles: ['ADMIN'],
                },
            ],
        },
    ];
}