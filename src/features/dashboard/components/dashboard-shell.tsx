'use client';

import { useState, type ReactNode } from 'react';
import { Header } from './header';
import { DesktopSidebar } from './desktop-sidebar';
import { MobileBottomNav } from './mobile-bottom-nav';
import { MobileDrawer } from './mobile-drawer';
import { DashboardSidebarItem, UserRole } from '@/features/dashboard/types';

type ClientWrapperProps = {
  children: ReactNode;
  userRole: UserRole;
  filteredItems: DashboardSidebarItem[];
};

/**
 * Desktop (md+): an app shell locked to the screen height. Sidebar and header
 * never move; <main> is the only scroll container.
 *
 * Mobile: the normal page scrolls (header is sticky, bottom nav is fixed).
 * Letting the document scroll keeps the phone browser's address bar behavior
 * and pull-to-refresh working.
 */
export function DashboardShell({
  children,
  userRole,
  filteredItems,
}: ClientWrapperProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="flex min-h-dvh bg-app-background md:h-dvh md:overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white">
      {/* Navigation is left out of printouts (reports are printed from the page). */}
      <div className="contents print:hidden">
        <DesktopSidebar items={filteredItems} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="contents print:hidden">
          <Header />
        </div>

        <main className="flex-1 pb-20 md:overflow-y-auto md:overscroll-y-contain md:pb-0 md:[scrollbar-gutter:stable] print:overflow-visible print:pb-0">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <div className="contents print:hidden">
        <MobileBottomNav userRole={userRole} onOpenMore={openDrawer} />
      </div>

      <MobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer} items={filteredItems} />
    </div>
  );
}
