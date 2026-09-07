import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LoginForm } from './login-form';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-10">
      <div className="w-full max-w-md rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-lg font-bold text-white">SK</div>
          <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">{t('welcome')}</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t('description')}</p>
        </div>

        <LoginForm locale={locale} />

        <div className="mt-6 border-t border-[var(--color-border)] pt-5 text-center text-sm text-[var(--color-text-muted)]">
          {t('needAccess')}{' '}
          <Link href="/register" className="font-semibold text-[var(--color-primary)]">
            {t('registrationRequest')}
          </Link>
        </div>
      </div>
    </main>
  );
}
