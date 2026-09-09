import type { ReactNode } from 'react';
import { DashboardSidebarConfig } from '@/config/dashboard-sidebar';
import { requireUser } from '@/lib/auth/session';
import { filterSidebarItemsByRole } from '@/utils/dashboard-sidebar-filter';
import { DashboardClientWrapper } from '../_components/dashboard-client-wrapper';

export default async function MemberLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
//   const user = await requireUser(locale, 'member');

  const filteredItems = filterSidebarItemsByRole({
    items: DashboardSidebarConfig.items,
    userRole: 'MEMBER',
  });

  return (
    <DashboardClientWrapper
      userRole="MEMBER"
      filteredItems={filteredItems}
    //   userName={user.name}
    userName="Member User" // Placeholder name for member user
    memberNumber="654321" // Placeholder member number for member user
    >
      {children}
    </DashboardClientWrapper>
  );
}