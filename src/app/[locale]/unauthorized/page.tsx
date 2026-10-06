import type { Metadata } from 'next';
import Link from 'next/link';

import { pageTitleMetadata } from '@/lib/metadata';

const titleMetadata = pageTitleMetadata('unauthorized');

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return { ...(await titleMetadata(props)), robots: { index: false, follow: false } };
}

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-6">
      <section className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <p className="text-sm font-semibold text-[var(--color-error)]">403</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--color-text)]">Access denied</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Your account does not have permission to view this page.
        </p>
        <Link
          href={`/${locale}`}
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--color-primary)] px-4 py-2 font-semibold text-white"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
