'use client';

import { useState } from 'react';
import { Header } from './header';
import { DesktopSidebar } from './desktop-sidebar';
import { MobileBottomNav } from './mobile-bottom-nav';
import { MobileDrawer } from './mobile-drawer';
import { DashboardSidebarItem, UserRole } from '@/types/dashboard-sidbar';


type ClientWrapperProps = {
  children: React.ReactNode;
  userRole: UserRole;
  filteredItems: DashboardSidebarItem[];
  userName?: string;
  memberNumber?: string;
};

export function DashboardClientWrapper({
  children,
  userRole,
  filteredItems,
  userName,
  memberNumber,
}: ClientWrapperProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-app-background">
      {/* Desktop Sidebar with Children Support */}
      <DesktopSidebar items={filteredItems} />

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header userName={userName} memberNumber={memberNumber} />

        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        userRole={userRole}
        onOpenMore={() => setIsDrawerOpen(true)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        items={filteredItems}
      />
    </div>
  );
}