import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
// import { getAuthUser } from '@/lib/auth'; // আপনার সেশন হেল্পার

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
//   const auth = await getAuthUser();

  // যদি লগইন না থাকে অথবা ইউজার অ্যাডমিন না হয়
//   if (!auth || auth.user.role !== 'ADMIN') {
//     redirect(`/${locale}/dashboard`); // মেম্বারকে সাধারণ ড্যাশবোর্ডে ফেরত পাঠানো হবে
//   }

  return <>{children}</>;
}