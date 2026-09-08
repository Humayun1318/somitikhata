import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-background px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-6 text-center shadow-sm sm:p-8">
        <div
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-app-surface-muted text-sm font-bold text-app-text"
        >
          404
        </div>

        <h1 className="mt-5 text-2xl font-bold text-app-text">
          {t('title')}
        </h1>

        <p className="mt-3 text-sm leading-6 text-app-text-muted">
          {t('description')}
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-app-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
        >
          {t('home')}
        </Link>
      </section>
    </main>
  );
}