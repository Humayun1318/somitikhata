'use client';

import { useState } from 'react';
import { Header } from './header';
import { DesktopSidebar } from './desktop-sidebar';
import { MobileBottomNav } from './mobile-bottom-nav';
import { MobileDrawer } from './mobile-drawer';
import { DashboardSidebarItem, UserRole } from '@/features/dashboard/types';


type ClientWrapperProps = {
  children: React.ReactNode;
  userRole: UserRole;
  filteredItems: DashboardSidebarItem[];
};

export function DashboardShell({
  children,
  userRole,
  filteredItems,
}: ClientWrapperProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-app-background">
      <DesktopSidebar items={filteredItems} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6">
          {children}
        </main>
      </div>

      <MobileBottomNav
        userRole={userRole}
        onOpenMore={() => setIsDrawerOpen(true)}
      />

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        items={filteredItems}
      />
    </div>
  );
}