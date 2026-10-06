import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  BookOpenText,
  CalendarCheck,
  Check,
  ChevronDown,
  FileBarChart,
  HandCoins,
  History,
  KeyRound,
  Landmark,
  Lock,
  PenLine,
  PiggyBank,
  Scale,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { PageContainer } from "@/components/shared/page-container";

import { HomeActions, HomeBandText } from "./home-actions";
import { LedgerPage } from "./ledger-page";

type Item = { title: string; body: string };

// Faint ruled lines, like a khata page: the page's one recurring texture.
const RULED = "bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(15,107,79,0.07)_31px,rgba(15,107,79,0.07)_32px)]";

function SectionHeading({ title, intro, id }: { title: string; intro?: string; id?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} className="text-2xl font-bold leading-snug text-app-text sm:text-3xl">
        {title}
      </h2>
      {intro && <p className="mt-3 text-base leading-relaxed text-app-text-muted">{intro}</p>}
    </div>
  );
}

export function HomeHero() {
  const t = useTranslations("HomePage.hero");
  const points = t.raw("points") as string[];

  return (
    <section className={`relative overflow-hidden border-b border-app-border pt-28 pb-16 sm:pt-32 lg:pb-24 ${RULED}`}>
      <PageContainer className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="motion-safe:animate-fade-in-up">
          <p className="flex items-center gap-2 text-sm font-medium text-brand-maroon">
            <BadgeCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
            {t("org")}
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.2] text-app-text sm:text-5xl">{t("title")}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-app-text-muted">{t("description")}</p>

          <div className="mt-8">
            <HomeActions tone="hero" />
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-app-text">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <Check aria-hidden="true" className="h-4 w-4 text-app-primary" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <LedgerPage />
      </PageContainer>
    </section>
  );
}

const MODULE_ICONS: LucideIcon[] = [Users, PiggyBank, HandCoins, Landmark, CalendarCheck, FileBarChart];

export function HomeModules() {
  const t = useTranslations("HomePage.modules");
  const items = t.raw("items") as Item[];

  return (
    <section id="modules" aria-labelledby="modules-title" className="scroll-mt-20 py-20 sm:py-24">
      <PageContainer className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="modules-title" title={t("title")} intro={t("intro")} />
        </div>
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {items.map((item, index) => {
            const Icon = MODULE_ICONS[index] ?? BookOpenText;
            return (
              <li key={item.title} className="flex gap-4 border-t border-app-border py-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-app-primary/10 text-app-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-app-text">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-app-text-muted">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </PageContainer>
    </section>
  );
}

function AudienceList({ items, tone }: { items: string[]; tone: "dark" | "light" }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
          <Check aria-hidden="true" className={tone === "dark" ? "mt-0.5 h-5 w-5 shrink-0 text-emerald-300" : "mt-0.5 h-5 w-5 shrink-0 text-app-primary"} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function HomeAudience() {
  const t = useTranslations("HomePage.audience");

  return (
    <section aria-labelledby="audience-title" className="pb-20 sm:pb-24">
      <PageContainer>
        <SectionHeading id="audience-title" title={t("title")} />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl bg-app-primary p-7 text-white sm:p-9">
            <h3 className="text-xl font-bold">{t("office.title")}</h3>
            <p className="mt-2 text-white/75">{t("office.body")}</p>
            <AudienceList items={t.raw("office.items") as string[]} tone="dark" />
          </div>
          <div className="rounded-3xl border border-app-border bg-app-surface p-7 text-app-text sm:p-9">
            <h3 className="text-xl font-bold">{t("member.title")}</h3>
            <p className="mt-2 text-app-text-muted">{t("member.body")}</p>
            <AudienceList items={t.raw("member.items") as string[]} tone="light" />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

type Step = { when: string; title: string; body: string };

// The fiscal year really is a sequence, so it is numbered: a line of stops on
// wide screens, a vertical track on phones.
export function HomeYear() {
  const t = useTranslations("HomePage.year");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="year" aria-labelledby="year-title" className="scroll-mt-20 border-y border-app-border bg-app-surface py-20 sm:py-24">
      <PageContainer>
        <SectionHeading id="year-title" title={t("title")} intro={t("intro")} />
        <ol className="relative mt-12 grid gap-8 lg:grid-cols-5 lg:gap-6">
          <span aria-hidden="true" className="absolute left-[1.15rem] top-2 bottom-2 w-px bg-app-border lg:left-0 lg:right-0 lg:top-[1.15rem] lg:bottom-auto lg:h-px lg:w-auto" />
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 lg:flex-col">
              <span
                className={`relative flex h-[2.3rem] w-[2.3rem] shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-app-surface ${index === steps.length - 1 ? "bg-brand-maroon text-white" : "bg-app-primary text-white"}`}
              >
                {index === steps.length - 1 ? <Lock aria-hidden="true" className="h-4 w-4" /> : index + 1}
              </span>
              <div>
                <p className="text-xs font-semibold text-app-primary">{step.when}</p>
                <h3 className="mt-1 text-base font-semibold text-app-text">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-app-text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}

const SAFEGUARD_ICONS: LucideIcon[] = [History, Lock, ShieldCheck, PenLine, Scale, KeyRound];

export function HomeSafeguards() {
  const t = useTranslations("HomePage.safeguards");
  const items = t.raw("items") as Item[];

  return (
    <section aria-labelledby="safeguards-title" className="py-20 sm:py-24">
      <PageContainer>
        <SectionHeading id="safeguards-title" title={t("title")} />
        <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = SAFEGUARD_ICONS[index] ?? ShieldCheck;
            return (
              <li key={item.title}>
                <Icon aria-hidden="true" className="h-6 w-6 text-brand-blue" />
                <h3 className="mt-3 text-base font-semibold text-app-text">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-app-text-muted">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </PageContainer>
    </section>
  );
}

type Faq = { question: string; answer: string };

// Native <details>: works without JavaScript, keyboard and screen readers included.
export function HomeFaq() {
  const t = useTranslations("HomePage.faq");
  const items = t.raw("items") as Faq[];

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-app-border bg-app-surface py-20 sm:py-24">
      <PageContainer size="content">
        <SectionHeading id="faq-title" title={t("title")} />
        <div className="mt-8 divide-y divide-app-border border-y border-app-border">
          {items.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex min-h-14 list-none items-center justify-between gap-4 py-4 text-base font-semibold text-app-text transition-colors hover:text-app-primary [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-app-text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="pb-5 pr-9 text-sm leading-relaxed text-app-text-muted sm:text-base">{item.answer}</p>
            </details>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export function HomeCallToAction() {
  return (
    <section className="bg-app-surface pb-20 sm:pb-24">
      <PageContainer>
        <Band>
          <HomeBandText />
          <div className="shrink-0">
            <HomeActions tone="band" />
          </div>
        </Band>
      </PageContainer>
    </section>
  );
}

function Band({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-app-primary px-7 py-10 text-white sm:px-12 sm:py-12">
      <div aria-hidden="true" className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(255,255,255,0.06)_31px,rgba(255,255,255,0.06)_32px)]" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">{children}</div>
    </div>
  );
}
