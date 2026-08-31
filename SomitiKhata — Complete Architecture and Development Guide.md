# SomitiKhata — Complete Architecture and Development Guide

**Document status:** Reviewed baseline for manual addition to the project  
**Repository reviewed:** `Humayun1318/somitikhata`  
**Review mode:** Read-only; no source file, dependency, commit, branch, or remote repository was changed.  
**Purpose:** Give a future AI agent, developer, or maintainer enough context to work inside the existing project without guessing, breaking the route tree, or introducing a second architecture.

> This document describes two things separately: **the verified repository as it exists today** and the **rules that future page/feature work must follow**. A planned file is never treated as an existing file. If a section says “planned,” that file or capability must not be imported until it has actually been created and verified.

---

## 1. Non-negotiable working rules

SomitiKhata is a bilingual, mobile-first financial record application for Bangladeshi cooperative societies. It will eventually manage savings, loans, shared assets, and member records. Because the project handles financial information, correctness and traceability are more important than adding clever abstractions quickly.

The repository is currently a **Next.js-only frontend/demo scaffold**. It is not yet a production financial system, and it does not yet contain the real Express backend, MongoDB models, authentication implementation, feature service layer, or production PWA caching strategy described in the planning documents.

The following rules apply to every future task:

1. **Do not change the root route or layout architecture while building normal pages.** Do not delete or move `src/app/layout.tsx`, do not move the document shell into `[locale]/layout.tsx`, and do not introduce `next/root-params` unless the user explicitly approves a separate architecture migration.
2. **Do not change `proxy.ts`, i18n routing, the root layout, `package.json`, global CSS, or the folder hierarchy for a page-only task.** If a task genuinely needs one of those files, explain the reason, affected files, risk, and rollback plan before changing it.
3. **Do not add a new library because it appears convenient.** Check `package.json` first. If a missing package is necessary, ask for explicit approval before installing or editing dependency files.
4. **Do not push to GitHub, create a commit, reset a branch, or modify the remote unless the user explicitly asks for that action.** A normal review or implementation request is not permission to push.
5. **Do not invent business rules.** Savings, loan, asset-share, correction, and eligibility rules must follow `docs/business-rules.md` and the unresolved decisions in `docs/client-questions.md`.
6. **Do not treat mock values as real financial data.** The current values are demonstration fixtures only.
7. **Do not hardcode user-facing UI text in JSX.** New user-facing copy belongs in both `messages/en.json` and `messages/bn.json` with identical key structure.
8. **Do not expose private member/admin data through public pages, metadata, mock public content, service-worker caches, or search indexing.**
9. **Do not silently “fix” an architecture warning by changing route structure.** A deprecation warning and a build-breaking error are different things. Stable behavior must be preserved unless migration is deliberately approved.
10. **At the beginning of every task, state the scope:** files that will be changed, files that will not be changed, and whether the task is page-level or structure-level.

The intended post-baseline workflow is therefore: **resolve only explicitly approved known issues first; then freeze structure and build individual pages, components, translations, and content inside the existing architecture.**

---

## 2. Product and design intent

The product name is **SomitiKhata (সমিতি খাতা)**. The name refers to the traditional ledger used by Bangladeshi cooperative societies and communicates that the application is a digital ledger for savings, loans, and shared assets.

The product should feel **trustworthy, calm, clean, professional, and record-oriented**. It should resemble a clear bank statement or committee ledger more than a colorful consumer-finance or gamification app. Avoid decorative effects on data screens, unnecessary gradients, competing accent colors, visual noise, and charts that do not add decision-making value.

The primary audience uses mobile devices and may access the application on slow 3G or 4G connections. Mobile layouts are therefore the default design target. Desktop layouts may add density, sidebars, tables, and administrative convenience, but no important workflow may be desktop-only.

The application supports two locales:

| Locale | Language | URL prefix | Translation file |
|---|---|---|---|
| `bn` | Bangla/Bengali | `/bn` | `messages/bn.json` |
| `en` | English | `/en` | `messages/en.json` |

The default locale is `bn`, and `localePrefix: 'always'` is part of the current routing configuration. Locale switching must preserve the current route whenever possible, for example `/en/member/dashboard` to `/bn/member/dashboard`, rather than sending the user to an unrelated homepage.

---

## 3. Verified repository state

The reviewed repository contains the following tracked root-level files and directories:

```text
.env.example
.gitignore
README.md
next-env.d.ts
next.config.mjs
package.json
package-lock.json
postcss.config.mjs
tsconfig.json

messages/
├── bn.json
└── en.json

public/
└── icon.svg

src/
├── app/
│   ├── [locale]/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/register/page.tsx
│   │   ├── (public)/page.tsx
│   │   ├── admin/assets/page.tsx
│   │   ├── admin/dashboard/page.tsx
│   │   ├── admin/deposits/page.tsx
│   │   ├── admin/loans/page.tsx
│   │   ├── admin/members/page.tsx
│   │   ├── admin/reports/page.tsx
│   │   ├── admin/settings/page.tsx
│   │   ├── member/assets/page.tsx
│   │   ├── member/dashboard/page.tsx
│   │   ├── member/deposits/page.tsx
│   │   ├── member/loans/page.tsx
│   │   ├── member/profile/page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── icon.svg
│   ├── layout.tsx
│   ├── manifest.ts
│   └── sw.ts
├── components/shared/
│   ├── app-shell.tsx
│   ├── stat-card.tsx
│   └── status-badge.tsx
├── i18n/
│   ├── navigation.ts
│   ├── request.ts
│   └── routing.ts
├── images/logo.jpeg
├── lib/mock-data/index.ts
├── lib/utils/cn.ts
├── lib/utils/currency.ts
├── proxy.ts
└── services/api-client.ts

docs/
├── api-design.md
├── architecture.md
├── authentication.md
├── business-rules.md
├── client-questions.md
├── database-design.md
├── design.md
├── i18n.md
├── information-architecture.md
├── project-roadmap.md
├── pwa.md
└── seo.md
```

### Important distinction: documented plan versus actual code

The existing `docs/architecture.md` describes a future feature-based structure containing `features/`, `services/*-service.ts`, `lib/auth/`, and route groups such as `(member)` and `(admin)`. Those folders and files are **not present in the reviewed repository**. The actual pages currently live directly under `src/app/[locale]/admin/` and `src/app/[locale]/member/`, and they mostly import one shared mock-data file.

Future work must not pretend that planned files already exist. The actual repository is the source of truth for imports and current file paths; the docs are the source of truth for intended business and architectural direction.

---

## 4. Current technology and exact dependency baseline

The reviewed `package.json` declares the following stack. The caret (`^`) means the exact resolved version is controlled by `package-lock.json`; the table records the declared baseline, not a promise that every future installation will resolve to the same patch version.

| Area | Package/version in `package.json` | Current role |
|---|---|---|
| Framework | `next ^16.3.3` | Next.js App Router and server rendering |
| UI runtime | `react ^19.2.8`, `react-dom ^19.2.8` | React rendering |
| Language | `typescript ^6.0.3` | Strict TypeScript checking |
| Styling | `tailwindcss ^4.3.3` | Utility-first CSS through the Tailwind PostCSS plugin |
| Tailwind integration | `@tailwindcss/postcss ^4.3.3` | PostCSS integration |
| Class merging | `clsx ^2.1.1`, `tailwind-merge ^3.6.0` | Conditional and conflict-free class composition |
| Icons | `lucide-react ^1.37.0` | Intended icon library; current pages still use text/emoji in places |
| i18n | `next-intl ^4.14.1` | Locale routing and translations |
| Forms | `react-hook-form ^7.87.0` | Intended form state management |
| Schema validation | `zod ^4.5.4` | Intended shared validation |
| Form adapter | `@hookform/resolvers ^5.9.1` | Intended RHF/Zod integration |
| Server state | `@tanstack/react-query ^5.102.8` | Declared but not yet used in the reviewed pages |
| Tables | `@tanstack/react-table ^9.2.4` | Declared for future headless tables; not yet used in reviewed pages |
| Charts | `recharts ^3.10.1` | Declared for future charts; current member dashboard uses a simple CSS bar visualization |
| Date utilities | `date-fns ^4.4.0` | Declared for future date formatting |
| PWA | `@serwist/next ^9.5.12` | Build integration exists, but service worker is disabled |
| Authentication | `next-auth ^4.24.15` | Declared; current reviewed pages do not implement real authentication |
| ESLint | `eslint ^9.39.5`, `eslint-config-next ^16.3.3` | Lint tooling declaration |
| Node types | `@types/node ^26.4.0` | TypeScript Node declarations |
| React types | `@types/react ^19.2.18`, `@types/react-dom ^19.2.5` | React declarations |

Current scripts:

```text
npm run dev       → next dev
npm run build     → next build
npm run start     → next start
npm run lint      → next lint
npm run typecheck → tsc --noEmit
```

The declared `lint` script may need review against the installed Next.js version because newer Next.js versions may no longer provide the same `next lint` command. Do not change it as part of a page task; treat it as a separate tooling issue.

---

## 5. Root files and configuration responsibilities

### `.env.example`

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK_API=true
AUTH_SECRET=replace-with-a-secure-secret
NEXTAUTH_URL=http://localhost:3000
```

This documents intended environment variables. `.env`, `.env.local`, and other local environment files are ignored by Git. Never commit real secrets. `NEXT_PUBLIC_*` values are browser-visible; never put private API keys in them.

`NEXT_PUBLIC_USE_MOCK_API` is intended to choose mock versus HTTP service implementations later. The current repository does not yet contain the documented service implementations that use this switch.

### `.gitignore`

Ignores dependencies, Next build output, coverage, logs, local environment files, macOS metadata, and `*.tsbuildinfo`. Generated files must not be manually edited or committed.

### `README.md`

This is the documentation index and docs-first policy. It identifies `docs/` as the intended planning source of truth and explains that architectural contradictions should be resolved in documentation before coding. It also records why `deployment.md` is intentionally deferred until the backend/deployment phase.

### `next-env.d.ts`

Generated Next.js TypeScript references. It includes Next route and root-parameter development type files. Do not edit this file manually.

### `next.config.mjs`

Current content combines Serwist and next-intl:

```js
import withSerwistInit from '@serwist/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: true,
});

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(
  withSerwist({
    reactStrictMode: true,
    turbopack: {},
  })
);
```

Responsibilities:

| Setting | Meaning |
|---|---|
| `withNextIntl` | Loads the `src/i18n/request.ts` request configuration through the next-intl plugin |
| `withSerwist` | Connects `src/app/sw.ts` to the build and would generate `public/sw.js` |
| `disable: true` | PWA service-worker build is intentionally disabled currently |
| `reactStrictMode: true` | Enables React strict development checks |
| `turbopack: {}` | Empty configuration; do not treat it as a custom optimization |

Do not add direct redirects or locale logic here. Locale behavior belongs to `src/i18n/routing.ts` and `src/proxy.ts`.

### `postcss.config.mjs`

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

This is the Tailwind CSS v4 PostCSS bridge. It is not a place for page-specific styles or component behavior.

### `tsconfig.json`

Important settings:

| Setting | Current behavior |
|---|---|
| `strict: true` | TypeScript strict checking is enabled |
| `moduleResolution: 'bundler'` | Modern bundler resolution |
| `resolveJsonModule: true` | JSON translation imports are supported |
| `isolatedModules: true` | Safer per-file transpilation constraints |
| `jsx: 'react-jsx'` | Modern JSX transform |
| `incremental: true` | Generates a TypeScript build-info cache, ignored by Git |
| `@/* → ./src/*` | Absolute imports resolve from `src` |
| `next` TypeScript plugin | Enables Next-specific type support |
| `webworker` lib | Supports service-worker typings in principle |

Do not weaken `strict` or add `@ts-nocheck` to normal application files. `src/app/sw.ts` currently has `@ts-nocheck`; that is a separate cleanup item, not a pattern for new code.

---

## 6. Routing architecture

The actual route tree is:

```text
src/app/
├── layout.tsx
└── [locale]/
    ├── layout.tsx
    ├── (public)/page.tsx
    ├── (auth)/login/page.tsx
    ├── (auth)/register/page.tsx
    ├── admin/*/page.tsx
    └── member/*/page.tsx
```

The `(public)` and `(auth)` directories are route groups and do not appear in the URL. The current `admin` and `member` directories are **not** parenthesized route groups, so their names appear in the URL.

Examples:

```text
/bn                 → localized public page
/en                 → localized public page
/bn/login           → login page
/en/register        → register page
/bn/admin/dashboard → admin dashboard
/en/member/loans    → member loans page
```

### Root `/` behavior

`src/app/page.tsx` is not present in the reviewed repository. The intended behavior is that `src/proxy.ts` and next-intl handle the unprefixed `/` request and redirect it to the configured default locale, `/bn`. Do not add a second hardcoded redirect page unless the route architecture is deliberately reviewed.

### `src/proxy.ts`

```ts
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export function proxy(request: NextRequest) {
  return createMiddleware(routing)(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

This is the locale middleware entry point. It currently creates the next-intl middleware per request. Do not add authentication route protection here until authentication is actually implemented and the behavior is specified.

The matcher excludes API paths, Next internal assets, and paths containing a file extension. If this file is renamed or moved, the framework version and Next.js proxy/middleware convention must be checked first.

### `src/i18n/routing.ts`

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'bn',
  localePrefix: 'always',
});
```

This is the single locale policy source. Add or remove a locale here only when translation files, route behavior, language switching, metadata, and QA are prepared.

### `src/i18n/navigation.ts`

```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

Use these locale-aware helpers for internal navigation whenever the component can import them. Do not use raw `next/link` for localized application navigation unless there is a specific reason and the locale prefix is intentionally constructed.

Correct:

```tsx
import { Link } from '@/i18n/navigation';

<Link href="/member/dashboard">Dashboard</Link>
```

The helper should produce the active locale route. A language switch should use the helper’s `locale` option or a dedicated locale-switching utility while preserving the current pathname.

---

## 7. Current i18n implementation and rules

### `src/i18n/request.ts`

The reviewed repository currently uses the explicit-locale pattern:

```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`../../messages/${activeLocale}.json`)).default,
  };
});
```

The current intended contract is:

```text
[locale]/layout.tsx receives params.locale
        ↓
getMessages({ locale }) receives explicit locale
        ↓
getRequestConfig({ locale }) resolves activeLocale
        ↓
messages/en.json or messages/bn.json loads
```

Do not add `next/root-params` to this file under the current layout hierarchy. The current root layout remains above `[locale]`, and a previous attempt to import `next/root-params` produced an “Export locale doesn't exist in target module” build error. A root-parameter migration is a separate structure-level project, not normal page work.

### `src/app/[locale]/layout.tsx`

The current file validates the route segment, explicitly passes it to `getMessages`, and provides messages to client components:

```tsx
import type { ReactNode } from 'react';
import { hasLocale } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

This explicit call is important:

```tsx
const messages = await getMessages({ locale });
```

It ensures that `/en` explicitly requests English messages and `/bn` explicitly requests Bangla messages without requiring `setRequestLocale`.

### Translation usage in Server Components

Every new localized server page should receive the locale route parameter and pass it explicitly:

```tsx
import { getTranslations } from 'next-intl/server';

export default async function MemberLoansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: 'MemberLoansPage',
  });

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  );
}
```

Do not assume that a bare `getTranslations('Namespace')` call will always infer the correct route locale in this explicit-locale architecture. The safest project convention is:

```tsx
getTranslations({ locale, namespace: 'Namespace' })
```

### Translation usage in Client Components

A Client Component under `[locale]` receives translations through `NextIntlClientProvider`:

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function DepositActions() {
  const t = useTranslations('Deposits');

  return <button type="button">{t('save')}</button>;
}
```

Use a Client Component only when the component needs browser interaction, local state, event handlers, browser APIs, a controlled form, a chart library, a table interaction, or a client-side query hook. The provider supplies the locale and message context; do not import server-only translation functions into a Client Component.

### Translation files

`messages/en.json` and `messages/bn.json` currently contain the `HomePage` namespace. They must maintain the same key shape. New namespaces should be feature/page based rather than one file per component.

Recommended pattern:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "MemberDashboard": {
    "title": "Member dashboard",
    "currentSavings": "Current total savings"
  }
}
```

The Bangla file must mirror the same keys:

```json
{
  "common": {
    "save": "সংরক্ষণ করুন",
    "cancel": "বাতিল",
    "loading": "লোড হচ্ছে..."
  },
  "MemberDashboard": {
    "title": "সদস্য ড্যাশবোর্ড",
    "currentSavings": "বর্তমান মোট সঞ্চয়"
  }
}
```

Do not translate user-entered names, member IDs, phone numbers, or arbitrary notes. Translate labels, buttons, statuses, validation messages, empty states, error explanations, navigation labels, and explanatory copy.

### i18n data rules

API or mock data must use stable codes and canonical values. The UI translates or formats them:

```json
{
  "status": "pending",
  "amount": 5000,
  "currency": "BDT",
  "date": "2026-09-01T10:30:00.000Z"
}
```

Do not make the API return `"৳৫,০০০ টাকা"` or `"অপেক্ষমাণ"` as the only value. Use `formatCurrency`, date formatting, and translation keys at the presentation boundary.

---

## 8. Root layout and document language boundary

### `src/app/layout.tsx`

The reviewed file currently imports `getLocale` and renders:

```tsx
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const local = await getLocale();

  return (
    <html lang={local}>
      <body>{children}</body>
    </html>
  );
}
```

This file owns the document shell. It must not be moved or deleted as part of page development. It is also the area that previously caused a Turbopack panic in the local development environment when changed. Any future `html lang` or root-layout change requires a separate approved migration with a backup and build verification.

The project’s current architecture is intentionally conservative: keep the root layout in place, keep `[locale]/layout.tsx` as its child, and pass locale explicitly to `getMessages` and `getTranslations` where needed.

### Font rule

`globals.css` currently defaults the body to `var(--font-en)`. The intended design system has separate English and Bangla font stacks. A future font-switching change must be handled deliberately without destabilizing the root layout. Do not add nested `<html>` or `<body>` elements inside `[locale]/layout.tsx`.

---

## 9. CSS and design system

### `src/app/globals.css`

This is the global design-token source. It imports Tailwind CSS v4, defines light and dark semantic tokens, sets the document baseline, fixes box sizing, inherits form fonts, and preserves visible keyboard focus.

The current tokens are:

| Token group | Light mode | Dark mode |
|---|---|---|
| Primary | `#0f6b4f` | `#43c99b` |
| Primary hover | `#0c5a42` | `#68d8b0` |
| Secondary | `#1e3a5f` | `#8bb8e8` |
| Background | `#f7f8f7` | `#0b1411` |
| Surface | `#ffffff` | `#12201b` |
| Muted surface | `#eef2ef` | `#1a2b24` |
| Border | `#e3e6e4` | `#2b4037` |
| Text | `#111827` | `#edf7f2` |
| Muted text | `#5b6660` | `#a7bbb1` |
| Success | `#1a8a5f` | `#5ed69f` |
| Warning | `#b8860b` | `#e6bd55` |
| Error | `#b3261e` | `#ff8d83` |
| Info | `#2563eb` | `#8bb8ff` |
| Focus ring | teal with transparency | bright teal with transparency |
| Disabled | `#9ca3af` | `#718078` |

Dark mode is selected by:

```css
[data-theme='dark'] {
  /* dark semantic token overrides */
}
```

A theme switcher should change the `data-theme` attribute on the document element. Components must use semantic variables such as `var(--color-surface)` and `var(--color-text)`, not hardcoded light-only colors.

### CSS rules for every future page

1. Use semantic color variables for backgrounds, text, borders, focus, and status. Do not write a new page with repeated hex colors such as `#FFFFFF`, `#111827`, or `#0F6B4F` in every class.
2. Use Tailwind utilities for layout and spacing, but use the project variables for theme-sensitive colors.
3. Keep spacing on the 4px-based scale: 4, 8, 12, 16, 24, 32, 48, 64px.
4. Use the existing radius language: 6px for small badges, 8px for default controls, and 12px or 16–24px for larger cards according to the screen hierarchy.
5. Preserve visible `:focus-visible` outlines. Never remove keyboard focus indicators.
6. Use at least a 44×44px practical touch target on mobile, even if the visual button height is 40px.
7. Avoid relying on color alone for status. Pair a color with a text label or icon.
8. Make tables horizontally scrollable on small screens; do not silently truncate financial values.
9. Use a drawer or stacked cards on mobile when a desktop side-by-side panel would become cramped.
10. Use skeletons for loading states longer than a short instant; match the final layout shape rather than showing a generic spinner everywhere.
11. Keep empty states explanatory and actionable. Never show only “No data.”
12. Keep destructive actions explicit: correction, deactivation, loan rejection, and similar actions need confirmation.

### Current CSS and design gaps to remember

The current pages still contain many hardcoded light-mode classes such as `bg-white`, `text-[#111827]`, `border-[#E3E6E4]`, and literal rgba backgrounds. These are existing implementation details, not the standard for new work. When an existing page is actively revised, migrate only the relevant area to semantic variables rather than rewriting the whole application CSS without approval.

The current `body` uses the English font stack by default:

```css
font-family: var(--font-en);
```

The intended Bangla font stack is:

```css
--font-bn: 'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif;
```

A future font-locale implementation must be tested with real Bangla labels, tables, forms, and long text. Do not shrink Bangla font sizes to compensate for script shape; preserve the shared size tokens and give Bangla text sufficient line height.

### Tailwind v4 rule

The project uses Tailwind CSS v4 through `@import 'tailwindcss';` and `@tailwindcss/postcss`. Do not add a legacy `tailwind.config.js` or v3 directives unless a deliberate migration is approved. If reusable Tailwind utility names are needed for the CSS variables, define them using the project’s Tailwind v4-compatible approach; otherwise use arbitrary values referencing variables, for example:

```tsx
<div className="bg-[var(--color-surface)] text-[var(--color-text)]">
  {children}
</div>
```

---

## 10. Server Component and Client Component rules

### Server Components are the default

Every new page should begin as a Server Component. Do not add `'use client'` unless there is a specific browser-side requirement.

Use Server Components for:

- Reading route params;
- Loading translations with `getTranslations`;
- Loading messages in a layout;
- Reading server data through a service function;
- Rendering static or read-heavy dashboard content;
- Building metadata;
- Formatting data before rendering when no browser interaction is needed.

Example:

```tsx
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/shared/app-shell';

export default async function DepositsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'DepositsPage',
  });

  return (
    <AppShell variant="member" title={t('title')}>
      <section>{t('description')}</section>
    </AppShell>
  );
}
```

### Client Components are islands of interaction

Use a Client Component for:

- Form state and submit handlers;
- `useState`, `useEffect`, event handlers, or browser APIs;
- Theme switching;
- Interactive charts;
- Interactive tables, filters, sorting, and pagination;
- Deposit-entry grids;
- Modal/drawer open state;
- TanStack Query hooks;
- Components that must use `useTranslations` or other client hooks.

Example:

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function DepositForm() {
  const t = useTranslations('DepositsPage');

  return (
    <form>
      <label htmlFor="amount">{t('amountLabel')}</label>
      <input id="amount" name="amount" inputMode="decimal" />
      <button type="submit">{t('save')}</button>
    </form>
  );
}
```

Keep the page and data-loading shell on the server, then import the smallest interactive client island into it. Do not mark a whole dashboard page as client-side just because one button or chart is interactive.

### Data boundaries

A Server Component may pass serializable data to a Client Component. Do not pass database connections, functions, class instances, or secrets. The client must never receive private API keys, password hashes, server session secrets, or raw backend credentials.

---

## 11. Shared components and actual implementation files

### `src/components/shared/app-shell.tsx`

This is currently the main client-side visual shell for public, member, and admin views. It accepts:

```ts
{
  locale?: Locale;
  variant: 'public' | 'member' | 'admin';
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}
```

It derives the locale from the optional prop or pathname, builds a navigation list, toggles locale, and renders either a public header or authenticated-style sidebar/header shell.

**Important current issue:** it imports:

```ts
import {
  getLocaleFromPathname,
  switchLocalePath,
  type Locale,
} from '@/lib/i18n/locales';
```

No `src/lib/i18n/locales` file exists in the reviewed repository. This is a known unresolved import mismatch and may prevent typecheck/build. Do not invent a replacement inside a page. Resolve it as a separate approved issue by either creating the intended helper with documented behavior or changing the shell to use the already-existing `@/i18n/navigation` utilities after reviewing all call sites.

The current shell also has hardcoded English navigation labels and direct `next/link` usage. Future localized shell work must move labels to translations and use locale-aware navigation, but that should be handled as a focused shared-shell task rather than duplicated in every page.

### `src/components/shared/stat-card.tsx`

Presentational metric card. Props:

```ts
{
  title: string;
  value: string;
  meta?: string;
  icon?: ReactNode;
}
```

It uses semantic CSS variables for surface, border, text, and primary styling. It contains no data-fetching or translation logic. The parent page should provide already formatted values and translated labels.

### `src/components/shared/status-badge.tsx`

Maps a lowercased incoming label to Tailwind status classes. It currently expects English-like display/status values such as `active`, `pending`, `overdue`, `approved`, `rejected`, `sent`, `recorded`, and `missing`.

This is not yet a proper i18n-safe status component because it both receives display text and uses it as a status key. The future professional pattern is:

```tsx
<StatusBadge status="pending" label={t('statuses.pending')} />
```

The stable code drives styling; the translated label drives display. Do not pass translated Bangla labels into a function that expects English status keys.

### `src/lib/utils/cn.ts`

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use this helper when conditional Tailwind classes need conflict resolution. Do not add a second class-merging helper.

### `src/lib/utils/currency.ts`

Current functions:

```ts
export type Locale = 'en' | 'bn';

export function formatCurrency(value: number, locale: Locale = 'en') {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
```

The intended design document says money should use the `৳` symbol and Latin numerals for financial readability, but the current `bn-BD` formatter may produce Bangla numerals depending on the runtime. This is a known presentation decision that should be tested and finalized before replacing the helper globally. API/database values must remain numeric; formatting belongs at the UI boundary.

### `src/images/logo.jpeg`

Current local logo asset. Use Next.js image handling for future image display where appropriate. Do not duplicate the logo as arbitrary text/emoji if the real logo is intended for that location.

---

## 12. Current mock-data layer

### `src/lib/mock-data/index.ts`

This is the only current data source used by the reviewed pages. It exports:

| Export | Current content |
|---|---|
| `Locale` | `'en' | 'bn'` type |
| `memberMetrics` | Numeric savings, deposit, balance, asset share, loan values |
| `publicFeatureCards` | English/Bangla public feature arrays |
| `publicFaq` | English/Bangla FAQ arrays |
| `adminStats` | English/Bangla preformatted dashboard stats |
| `adminMembers` | Demo member rows |
| `adminDeposits` | Demo deposit rows |
| `adminLoans` | Demo loan rows |
| `assetRows` | Demo asset rows |
| `memberDepositHistory` | Demo monthly history |
| `memberLoanSummary` | Demo loan summary |
| `memberAssetShare` | Demo asset share |
| `reportsSummary` | Preformatted report values |
| `notifications` | Demo notification rows |
| `mockMembers` | Lower-level demo members |
| `mockDeposits` | Lower-level demo deposits |

The file currently mixes canonical numeric values with preformatted display strings and contains both locale-specific content data and page fixture data. This is acceptable for the current visual demo but does not match the planned production API contract.

For future page work, do not create a second random mock-data file. Add a clearly named fixture only if the page needs it, and keep canonical values separate from localized labels. When the service layer is introduced, pages must stop importing this file directly.

---

## 13. Actual page-by-page responsibilities

All current pages are thin presentational wrappers. They import `AppShell`, read values from `src/lib/mock-data/index.ts`, and render static JSX. They do not call the API client, use TanStack Query, use React Hook Form, validate with Zod, or implement authentication.

### Public page: `src/app/[locale]/(public)/page.tsx`

This is the only current page that uses `getTranslations` and the locale-aware `Link` helper. It reads `params.locale`, loads the `HomePage` namespace explicitly, extracts structured arrays with `t.raw`, and renders:

```text
public header
hero
how-it-works steps
feature cards
trust section
FAQ
CTA
footer
```

It currently contains hardcoded colors, hardcoded sample currency strings, an emoji icon, and a manual type assertion around `t.raw`. Treat these as current demo implementation details. Future revisions should preserve the content hierarchy while moving new user-facing strings and formatting rules into the translation/data layers.

### Auth pages

`src/app/[locale]/(auth)/login/page.tsx` renders a static Bangla login form. It currently uses raw `next/link`, hardcoded Bangla copy, direct colors, and no form state or submit behavior.

`src/app/[locale]/(auth)/register/page.tsx` renders a static Bangla registration-request form with name, phone, email, and password fields. It communicates the admin pre-approval requirement but does not submit or validate data yet.

When these pages become functional:

```text
Client form island
  → React Hook Form
  → Zod schema
  → auth service interface
  → mock implementation first
  → real backend implementation later
```

Never treat frontend validation as the security boundary. Registration pre-approval must be enforced server-side when the real backend exists.

### Admin pages

| File | Current responsibility |
|---|---|
| `admin/dashboard/page.tsx` | Admin metrics, recent deposits, pending loans, member overview; uses `adminStats.en` only |
| `admin/members/page.tsx` | Static member table and pre-registration action button |
| `admin/deposits/page.tsx` | Static August deposit rows; inputs are read-only; save button has no behavior |
| `admin/loans/page.tsx` | Static loan queue; approve button has no behavior |
| `admin/assets/page.tsx` | Static asset cards with values/shares |
| `admin/reports/page.tsx` | Static summary cards and export button with no export behavior |
| `admin/settings/page.tsx` | Static organization/staff settings cards; inputs and actions are non-functional |

All admin pages currently pass `variant="admin"` to `AppShell`. Their route protection is not implemented in the reviewed code. Do not claim these pages are secure until authentication and server-side authorization exist.

### Member pages

| File | Current responsibility |
|---|---|
| `member/dashboard/page.tsx` | Savings stat cards, CSS bar visualization, loan status, deposit history |
| `member/deposits/page.tsx` | Static deposit history table and add button with no behavior |
| `member/loans/page.tsx` | Static active-loan and eligibility cards |
| `member/assets/page.tsx` | Static shared asset value card |
| `member/profile/page.tsx` | Static read-only contact info and preference list |

These pages currently contain many hardcoded English labels, dates, and values. New page work must follow the explicit locale and translation rules even if existing pages have not yet been migrated.

---

## 14. Data/API architecture: current versus planned

### Current state

`src/services/api-client.ts` is the only service file currently present:

```ts
export async function apiClient<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
```

It is a minimal generic fetch wrapper. It currently does not add the API base URL, authentication headers, retries, query serialization, response-envelope validation, or structured error types. Do not pretend it is a complete API layer.

### Planned service boundary

The planning docs describe a service interface between UI and data source:

```text
Page/component/hook
        ↓
feature or domain service interface
        ↓
mock implementation now / HTTP implementation later
        ↓
Express REST API
        ↓
MongoDB
```

When this is implemented, pages and hooks must import the selected service, not `mock-data` or raw `fetch` directly. A feature service should keep the same function signatures when switching from mock to HTTP.

Example target shape:

```ts
export interface DepositService {
  getMemberDeposits(memberId: string): Promise<Deposit[]>;
  getCurrentBalance(memberId: string): Promise<BalanceSummary>;
  recordDeposit(input: RecordDepositInput): Promise<Deposit>;
  correctDeposit(depositId: string, input: CorrectDepositInput): Promise<Deposit>;
}
```

The planned API contract uses:

```json
{ "success": true, "data": {} }
```

or:

```json
{
  "success": false,
  "error": { "code": "MEMBER_NOT_FOUND", "message": "..." }
}
```

Dates travel as ISO strings. Money travels as numbers in the chosen currency unit. Statuses travel as stable enum codes. The frontend formats and translates them.

### Money and date presentation

Use a locale-aware formatter at the presentation boundary:

```ts
export function formatAmount(amount: number, locale: 'bn' | 'en') {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount);
}
```

Before replacing `formatCurrency`, verify whether the product’s approved rule is Bangla or Latin numerals. The design document deliberately prefers Latin numerals for money even in Bangla UI, while `Intl('bn-BD')` may render localized digits. Do not change this globally without a product decision and visual QA.

---

## 15. Financial domain rules that code must respect

### Deposits

Members may deposit different amounts each month. There is no fixed monthly amount assumption. A balance is calculated from active, non-superseded deposit records; it is not a mutable running-total field that is overwritten each month.

A correction is append-only:

```text
original deposit → mark superseded
                 → create corrected deposit with correctionOf
                 → write audit log
```

Never edit or delete a financial deposit in place once real backend behavior exists.

### Shared assets

The recommended model is contribution-based ownership:

```text
member share %
  = member contribution basis / total contribution basis

member share value
  = share % × current asset value
```

The exact contribution basis is not final. Before building production asset logic, confirm whether it means lifetime deposits, deposits since acquisition, deposits unaffected by loans, and how departing members affect the denominator.

### Loans

Loan rules are deliberately not final. Do not hardcode interest/service-charge behavior, maximum loan formula, minimum membership duration, multiple active loans, tenure, guarantors, early repayment, default handling, initiation workflow, or grace period without committee answers.

### Auditability

Every real admin action affecting money or membership status must eventually create an audit record with actor, action, entity, before/after state, and timestamp. Mock UI actions may simulate the flow, but the demo must not be described as production secure.

---

## 16. PWA, caching, and mobile performance

### Actual current PWA state

`src/app/manifest.ts` defines a standalone manifest with `/bn` as the start URL, a theme color, background color, and SVG icon. `next.config.mjs` connects Serwist but sets `disable: true`. `src/app/sw.ts` has a minimal install/activate/fetch listener and currently fetches GET requests from the network without an offline cache strategy.

Therefore the current repository should be described as **PWA foundation present, offline support not implemented**.

### Safe offline boundary

Safe to cache or show offline:

```text
app shell
static UI
public landing content
previously viewed read-only data with a visible last-updated time
```

Must require connectivity:

```text
login
admin deposit entry or correction
loan submission
loan repayment recording
live balance/share calculation
any admin mutation
```

Do not queue an offline deposit correction for background sync. A financial action that is not confirmed by the backend must not look saved.

Service-worker cache should not blindly cache private API responses. The service worker should focus on static assets; data staleness belongs to the data layer and must be clearly labeled.

### Mobile performance rules

Use Server Components by default, keep client islands small, use `next/image` for actual image content, and use `next/font` for Inter and Hind Siliguri when the typography implementation is finalized. Test on a slow-4G profile. The product goal is meaningful content in under approximately three seconds on a mobile-throttled profile, measured rather than assumed.

---

## 17. Design workflow for a new page

Before writing JSX, define:

| Question | Required decision |
|---|---|
| Route | Exact URL and whether it is public, auth, member, or admin |
| Locale | How `[locale]` is received and how translations are loaded |
| Data | Mock data, service interface, or real API; never mix boundaries casually |
| Interaction | Which smallest components genuinely need Client Components |
| Mobile layout | What is visible first, how navigation behaves, how tables collapse |
| States | Loading, empty, error, populated, disabled, submitting, and success states |
| Permissions | Who can view or mutate the data |
| Formatting | Money, date, status, percentage, and last-updated rules |
| Translations | New keys in both `en.json` and `bn.json` |
| Accessibility | Labels, keyboard focus, touch targets, semantic headings, non-color status |

Recommended implementation order:

```text
1. Read the relevant docs file
2. Confirm route and scope
3. Create translation keys in both locale files
4. Create or use typed data shape
5. Build the Server Component page shell
6. Add the smallest Client Component islands
7. Add loading/empty/error states
8. Apply semantic CSS variables and responsive Tailwind layout
9. Test /bn and /en
10. Test light and dark theme
11. Test mobile width and keyboard focus
12. Run typecheck/build
```

Do not begin by copying a design screenshot into a large monolithic component. Extract repeated patterns into an appropriate shared component only after a second use exists or the component is a true app-wide primitive.

---

## 18. New file and folder rules

### New page

Place the page inside the existing route hierarchy:

```text
src/app/[locale]/<existing-area>/<page-name>/page.tsx
```

Do not create a new top-level routing tree. Do not create a duplicate `app/` or `pages/` directory.

### New reusable UI

Use:

```text
src/components/shared/<name>.tsx
```

for app-specific components reused by multiple domains. A future `src/components/ui/` folder may contain shadcn-style primitives, but it does not currently exist; do not import from it until created.

### New domain feature

The planning docs intend a feature-based structure such as:

```text
src/features/<domain>/
├── components/
├── hooks/
├── schemas/
├── types.ts
└── service.ts
```

This is planned, not current. Introduce it only as part of an explicitly approved feature/service-layer task. Do not create empty feature folders just to make the tree look like the planning document.

### New translations

Add the same namespace and keys to both:

```text
messages/en.json
messages/bn.json
```

Do not put translated text in a component-only file or create one translation file per component.

### New utility

Place general-purpose helpers under the relevant existing utility area:

```text
src/lib/utils/
```

Do not put business calculations into `cn.ts` or `currency.ts`. Financial calculations belong to a domain service/business-rule module once that layer exists.

---

## 19. Current known issues and how to treat them

These are verified observations from the current repository, not invitations to make unapproved broad changes:

| Issue | Current evidence | Safe treatment |
|---|---|---|
| Missing `@/lib/i18n/locales` module | `app-shell.tsx` imports it, but no matching tracked file exists | Resolve as a focused shared-shell/build issue before relying on the shell broadly |
| Existing pages are not fully localized | Most admin/member/auth pages contain literal English or Bangla strings | Migrate page by page; add matching translation keys; do not rewrite the whole tree at once |
| Existing pages use direct mock-data imports | Pages import `@/lib/mock-data` directly | Keep for current demo; introduce service boundary in a separate approved phase |
| Service layer is incomplete | Only generic `api-client.ts` exists | Do not invent missing `deposit-service.ts` etc. inside a page task |
| `api-client.ts` lacks base URL/auth/error envelope | It fetches the passed URL directly and throws a generic error | Improve only when API integration phase begins |
| PWA is disabled | `next.config.mjs` has `disable: true` | Do not enable until caching and financial-data safety rules are tested |
| Service worker uses `@ts-nocheck` | `src/app/sw.ts` begins with it | Review separately; do not copy this pattern |
| Root layout has recently changing locale behavior | `src/app/layout.tsx` calls `getLocale` | Keep root structure frozen; test before any root-layout changes |
| Hardcoded display values | Several pages contain literal dates, money, and labels | Replace during page-level localization/data work, not through a global blind search-and-replace |
| `t.raw` type assertions | Public page casts structured translation arrays manually | Keep until a typed translation/data strategy is approved; do not claim runtime validation exists |
| Current mock data mixes formatted strings and raw values | `adminStats`, `reportsSummary`, and notifications contain display strings | Treat as demo-only and normalize at the future service boundary |
| Docs and code route groups differ | Docs describe `(admin)`/`(member)` but code uses `admin`/`member` | This architecture guide records actual code paths; do not rename groups without explicit route migration approval |

---

## 20. Future backend and authentication boundary

The intended later architecture is:

```text
Next.js frontend
      ↓
service interfaces
      ↓
Node.js + Express + TypeScript REST API
      ↓
MongoDB
      ↓
server-side SMS provider
```

Credentials, password hashing, session secrets, database access, SMS keys, audit logs, rate limits, authorization, and registration pre-approval checks belong on trusted server-side infrastructure. The frontend can improve usability and validation but cannot be the security boundary.

The planned registration flow is:

```text
admin pre-approves phone/email
        ↓
member submits registration
        ↓
backend verifies pending pre-registration
        ↓
user/member records are linked
        ↓
pre-registration becomes claimed
        ↓
login is allowed
```

A future Google provider must use the same membership verification rule before a session is created. Do not add a second, drifting implementation of that rule.

---

## 21. Pre-development checklist for any AI or developer

Before changing code, the worker must answer:

1. Which exact page or component is being built?
2. Which existing files will change?
3. Which protected files will not change?
4. Is this Server Component or Client Component, and why?
5. What translation namespace and keys are required in both locale files?
6. What is the mobile-first layout behavior?
7. What happens in loading, empty, error, disabled, and success states?
8. Are amounts, dates, percentages, and statuses canonical and localized at display time?
9. Is the source data mock, service, or API, and is that boundary respected?
10. Does the page work at `/bn/...` and `/en/...` while preserving navigation context?
11. Does it work with `[data-theme='dark']`?
12. Does it preserve keyboard focus and touch target requirements?
13. Does it expose any private or stale financial data offline or in metadata?
14. Does it require a package/config/root-structure change? If yes, stop and ask permission.
15. Was the result verified with typecheck/build and without Git push?

### Required task-opening statement

A future worker should begin a task with a statement equivalent to:

```text
This task is page-level. I will change only <listed files>.
I will not change src/app/layout.tsx, src/app/[locale]/layout.tsx,
proxy.ts, src/i18n/routing.ts, src/i18n/request.ts, package.json,
next.config.mjs, or globals.css unless you explicitly approve it.
I will use the existing route structure, explicit locale translation calls,
semantic CSS tokens, and mobile-first layout rules.
```

If a protected file becomes necessary, the worker must pause and explain the architecture impact before proceeding.

---

## 22. Review and verification checklist

A page is not complete merely because it renders once. Verify:

| Area | Check |
|---|---|
| Route | Correct localized URL and no accidental unlocalized route |
| TypeScript | `npm run typecheck` passes or known existing errors are reported |
| Build | `npm run build` passes or the exact unrelated blocker is reported |
| i18n | Both `/bn` and `/en` show the correct translation file |
| Content | No new user-facing hardcoded strings |
| Navigation | Locale-aware links preserve context |
| Mobile | No horizontal overflow except intentionally scrollable tables |
| Dark mode | Surface, text, border, status, and focus contrast remain readable |
| Accessibility | Labels, headings, keyboard focus, semantic buttons, and touch targets are present |
| Financial display | Numeric API/mock values are formatted only at the display boundary |
| State handling | Loading, empty, error, disabled, and mutation feedback exist where relevant |
| Privacy | No private data in public content, metadata, or service-worker cache |
| Git safety | No commit/push/reset unless explicitly requested |

---

## 23. Source documents and references

The following repository documents were reviewed and should remain aligned with this guide:

| Document | Role |
|---|---|
| `README.md` | Docs-first policy and documentation index |
| `docs/architecture.md` | Intended system/service architecture and future backend swap |
| `docs/design.md` | Product naming, typography, design tokens, component rules, money formatting |
| `docs/i18n.md` | Locale routing, translation organization, language switcher, SEO implications |
| `docs/information-architecture.md` | Public, admin, and member page responsibilities |
| `docs/api-design.md` | Future API envelope, endpoint intent, money/date wire formats |
| `docs/authentication.md` | Pre-approval registration, roles, security boundary |
| `docs/database-design.md` | Planned entities and relationships |
| `docs/business-rules.md` | Deposit, correction, asset-share, and loan-rule constraints |
| `docs/client-questions.md` | Committee decisions that block final asset/loan logic |
| `docs/pwa.md` | Offline boundary, Serwist strategy, performance goals |
| `docs/seo.md` | Indexing, metadata, robots, sitemap, canonical/hreflang direction |
| `docs/project-roadmap.md` | Phase order and approval gates |

External technical references:

[1] [Next.js App Router documentation](https://nextjs.org/docs/app)  
[2] [Next.js `next/root-params` API](https://nextjs.org/docs/app/api-reference/functions/next-root-params)  
[3] [next-intl request configuration](https://next-intl.dev/docs/usage/configuration)  
[4] [next-intl routing setup](https://next-intl.dev/docs/routing/setup)  
[5] [Tailwind CSS v4 documentation](https://tailwindcss.com/docs)  
[6] [Creative Commons Attribution 4.0 license for the adapted Budget Genius visual reference](https://creativecommons.org/licenses/by/4.0/)

---

## Final baseline statement

SomitiKhata is currently a **Next.js 16.3.3 / React 19.2.8 / TypeScript 6.0.3 / Tailwind CSS 4.3.3 / next-intl 4.14.1 demo scaffold** with a localized route tree, a global light/dark token foundation, a shared client shell, static pages, and in-repository mock data. It is not yet the planned production Express/MongoDB financial platform.

The safest path from this baseline is to resolve only the explicitly approved current issues—especially the missing shared locale helper and any build blockers—then freeze the root structure. After that, new work should focus on **individual localized pages, feature components, content, states, and mobile-first design**, while preserving the existing route hierarchy, i18n contract, semantic CSS tokens, and future service-layer boundary.
