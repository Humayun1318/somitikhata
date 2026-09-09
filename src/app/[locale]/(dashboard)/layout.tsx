import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Permission, UserRole } from '@/types/dashboard-sidbar';
import { Sidebar } from './_components/sidebar';



// Mock/Real Session fetcher function
async function getAuthUser() {
  // TODO: আপনার প্রজেক্টের NextAuth / JWT কুকি / সেশন চেক লজিক এখানে বসবে
  // উদাহরণস্বরূপ:
  // const session = await getServerSession();
  // if (!session) return null;

  return {
    isAuthenticated: true,
    user: {
      name: 'Rahim Uddin',
      role: 'MEMBER' as UserRole, // বা 'ADMIN'
      permissions: ['VIEW_SAVINGS'] as Permission[],
    },
  };
}

type DashboardLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;
  const auth = await getAuthUser();

  // ১. Security Guard: ইউজার লগইন না থাকলে সরাসরি লগইন পেজে রিডাইরেক্ট
  if (!auth || !auth.isAuthenticated) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="flex min-h-screen bg-app-background">
      {/* ২. সাইডবারে ইউজারের রোল এবং পারমিশন পাস করা */}
      <Sidebar
        userRole="ADMIN"
        // userPermissions={auth.user.permissions}
      />

      {/* ৩. মূল ড্যাশবোর্ড কনটেন্ট এরিয়া */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-app-border bg-app-surface px-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-app-text">
            {/* {auth.user.name} */}
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}