import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/components/auth/register-form';



export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return {
    title: `${t('registerTitle')} — ${t('metaTitleSuffix')}`,
    description: t('registerSubtitle'),
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return (
    <>
      {/* <AuthHeader title={t('registerTitle')} subtitle={t('registerSubtitle')} /> */}
      <div className="mb-6 text-center">
      <h1 className="text-2xl font-bold text-app-text">{t('registerTitle')}</h1>
      <p className="mt-1.5 text-sm text-app-text-muted">{t('registerSubtitle')}</p>
    </div>
      <RegisterForm />
    </>
  );
}