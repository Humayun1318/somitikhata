import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageContainer } from '@/components/shared/page-container';
import { PublicNavbar } from './_components/public-navbar';



export default async function PublicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  const features = t.raw('sections.features') as Array<{ title: string; description: string; icon: string }>;
  const faqs = t.raw('sections.faq') as Array<{ question: string; answer: string }>;
  const steps = t.raw('sections.steps') as string[];
  const trustPoints = t.raw('sections.trustPoints') as string[];

  return (
    <div className="min-h-screen bg-[#F7F8F7] text-[#111827]">

      <PublicNavbar
        locale={locale}
        howItWorksLabel={t('nav.howItWorks')}
        featuresLabel={t('nav.features')}
        faqLabel={t('nav.faq')}
        languageLabel={t('nav.language')}
        loginLabel={t('nav.login')}
        navigationLabel={t('nav.navigationLabel')}
        mobileNavigationLabel={t('nav.mobileNavigationLabel')}
        openMenuLabel={t('nav.openMenuLabel')}
        closeMenuLabel={t('nav.closeMenuLabel')}
        shortName={t('nav.shortName')}
        registration={t('nav.registration')}
        legalName={t('nav.legalName')}
        location={t('nav.location')}
      />
      <main className="pt-16">
        <section className="pb-12 pt-12 md:pt-20">
          <PageContainer>
            <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex rounded-full border border-[#E3E6E4] bg-[rgba(15,107,79,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0F6B4F]">
                {t('hero.eyebrow')}
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#111827] md:text-6xl">
                {t('hero.title')}
              </h1>
              <p className="mt-6 max-w-xl text-lg text-[#5B6660]">
                {t('hero.description')}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="rounded-xl bg-[#0F6B4F] px-5 py-3 text-center font-semibold text-white hover:bg-[#0C5A42]">
                  {t('hero.primaryCta')}
                </Link>
                <Link href="/login" className="rounded-xl border border-[#E3E6E4] bg-white px-5 py-3 text-center font-semibold text-[#111827] hover:border-[#0F6B4F] hover:text-[#0F6B4F]">
                  {t('hero.secondaryCta')}
                </Link>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E3E6E4] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <div className="rounded-2xl bg-[#F7F8F7] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#5B6660]">{t('hero.statLabel')}</p>
                    <p className="mt-1 text-3xl font-bold text-[#111827]">{t('hero.statValue')}</p>
                  </div>
                  <div className="rounded-xl bg-[rgba(15,107,79,0.12)] p-3 text-2xl">💸</div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    [t('hero.savings'), '৳৯৫,০০০'],
                    [t('hero.loans'), '৳৪২,০০০'],
                    [t('hero.assetShare'), '৳১৮,৫০০'],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-xl border border-[#E3E6E4] bg-white p-3">
                      <div className="flex items-center justify-between text-sm text-[#5B6660]">
                        <span>{label}</span>
                        <span className="font-semibold text-[#111827]">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </PageContainer>
        </section>

        <section id="how-it-works" className="border-t border-[#E3E6E4] bg-white py-16">
          <PageContainer>
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0F6B4F]">{t('sections.howItWorksLabel')}</p>
              <h2 className="mt-3 text-3xl font-bold text-[#111827]">{t('sections.howItWorksTitle')}</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-[#E3E6E4] bg-[#F7F8F7] p-6">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#0F6B4F] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-base font-medium text-[#111827]">{step}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        <section id="features" className="py-16">
          <PageContainer>
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0F6B4F]">{t('sections.featuresLabel')}</p>
            <h2 className="mt-3 text-3xl font-bold text-[#111827]">{t('sections.featuresTitle')}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-[#E3E6E4] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="mb-4 text-2xl">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-[#111827]">{feature.title}</h3>
                <p className="text-sm leading-6 text-[#5B6660]">{feature.description}</p>
              </div>
            ))}
          </div>
          </PageContainer>
        </section>

        <section className="border-y border-[#E3E6E4] bg-[#F7F8F7] py-16">
          <PageContainer>
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0F6B4F]">{t('sections.trustLabel')}</p>
              <h2 className="mt-3 text-3xl font-bold text-[#111827]">{t('sections.trustTitle')}</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {trustPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-[#E3E6E4] bg-white p-6 text-base font-medium text-[#111827]">
                  {point}
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        <section id="faq" className="py-16">
          <PageContainer>
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0F6B4F]">{t('sections.faqLabel')}</p>
            <h2 className="mt-3 text-3xl font-bold text-[#111827]">{t('sections.faqTitle')}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-2xl border border-[#E3E6E4] bg-white p-6">
                <h3 className="mb-2 text-lg font-semibold text-[#111827]">{item.question}</h3>
                <p className="text-sm leading-6 text-[#5B6660]">{item.answer}</p>
              </div>
            ))}
          </div>
          </PageContainer>
        </section>

        <section className="bg-[#1E3A5F] py-16 text-white">
          <PageContainer className="text-center">
            <h2 className="text-3xl font-bold">{t('sections.ctaTitle')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-200">
              {t('sections.ctaDescription')}
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/register" className="rounded-xl bg-white px-6 py-3 font-semibold text-[#1E3A5F] hover:bg-slate-100">
                {t('sections.ctaButton')}
              </Link>
            </div>
          </PageContainer>
        </section>

        <footer className="border-t border-[#E3E6E4] bg-white">
          <PageContainer className="flex flex-col gap-4 py-8 text-sm text-[#5B6660] md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-[#111827]">{t('footer.brand')}</div>
              <div>{t('footer.tagline')}</div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-[#0F6B4F]">{t('footer.login')}</Link>
              <Link href="/register" className="hover:text-[#0F6B4F]">{t('footer.register')}</Link>
              <Link locale={locale === 'en' ? 'bn' : 'en'} href="/" className="hover:text-[#0F6B4F]">{t('footer.language')}</Link>
            </div>
          </PageContainer>
        </footer>
      </main>
    </div>
  );
}
