# SOMITIKHATA — Project Engineering Guide

> **Status:** Living project constitution / engineering context  
> **Project:** `somitikhata`  
> **Primary product:** Bengali/English cooperative money-management
> platform for Bottoli Cooperative Society, Lohagara.

------------------------------------------------------------------------

# 1. Purpose

This document is the single source of truth for the project’s
engineering architecture, coding conventions, UI rules, localization
rules, dependency contract, and future implementation decisions.

It is intended for:

- Human developers
- AI coding assistants
- Code reviewers
- Future maintainers

## Core rule

Code must not silently contradict this document.

If implementation requires an architectural change:

1.  Update this document first.
2.  Record what changed and why.
3.  Then update the implementation.

------------------------------------------------------------------------

# 2. Project Overview

`somitikhata` is a Bengali/English cooperative money-management platform
for Bottoli Cooperative Society, Lohagara.

The product is intended to support:

- Member management
- Monthly savings/deposits
- Loan management
- Member financial records
- Cooperative/shared assets
- Administrative operations
- Member dashboards
- Notifications
- Reporting
- Future financial summaries

Supported locales:

``` text
en
bn
```

Default locale:

``` text
bn
```

Locale-prefixed routes are used:

``` text
/bn
/en
/bn/member
/en/member
/bn/admin
/en/admin
```

------------------------------------------------------------------------

# 3. Technology Contract

## Frontend

| Technology      |    Version |
|-----------------|-----------:|
| Next.js         |  `^16.3.3` |
| React           |  `^19.2.8` |
| React DOM       |  `^19.2.8` |
| TypeScript      |   `^6.0.3` |
| Tailwind CSS    |   `^4.3.3` |
| next-intl       |  `^4.14.1` |
| TanStack Query  | `^5.102.8` |
| TanStack Table  |   `^9.2.4` |
| Zod             |   `^4.5.4` |
| React Hook Form |  `^7.87.0` |
| NextAuth        | `^4.24.15` |
| Serwist         |  `^9.5.12` |
| date-fns        |   `^4.4.0` |
| lucide-react    |  `^1.37.0` |
| Recharts        |  `^3.10.1` |
| clsx            |   `^2.1.1` |
| tailwind-merge  |   `^3.6.0` |

## Backend direction

``` text
Node.js
Express
MongoDB
Mongoose
JWT
```

## Dependency rule

Do not casually:

- install packages
- remove packages
- replace packages
- upgrade packages
- downgrade packages
- introduce another UI framework

Ask for approval before adding a new dependency unless the task
explicitly authorizes it.

Prefer the existing project stack.

------------------------------------------------------------------------

# 4. Current Project Structure

The currently known project structure is:

``` text
somitikhata/
├── app/
│   ├── layout.tsx
│   ├── fonts.ts
│   ├── globals.css
│   ├── manifest.ts
│   ├── sw.ts
│   ├── loading.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   └── [locale]/
│       ├── layout.tsx
│       ├── loading.tsx
│       ├── error.tsx
│       ├── not-found.tsx
│       ├── (public)/
│       │   └── page.tsx
│       ├── admin/
│       │   └── layout.tsx
│       └── member/
│           └── layout.tsx
├── messages/
│   ├── en.json
│   └── bn.json
├── src/
│   ├── proxy.ts
│   ├── i18n/
│   │   ├── routing.ts
│   │   ├── request.ts
│   │   └── navigation.ts
│   ├── components/
│   │   ├── shared/
│   │   │   └── page-container.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── env.ts
│   │   ├── api-error.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── currency.ts
│   └── services/
├── public/
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

------------------------------------------------------------------------

# 5. Important Route Architecture — Public Homepage

The public homepage is intentionally located at:

``` text
app/[locale]/(public)/page.tsx
```

The `(public)` folder is a **Next.js Route Group**.

A route group is organizational only and does not appear in the URL.

Therefore:

``` text
app/[locale]/(public)/page.tsx
```

maps to:

``` text
/bn
/en
```

It does **not** map to:

``` text
/bn/public
/en/public
```

This is intentional and must be preserved.

------------------------------------------------------------------------

# 6. App Router Architecture

The project uses the Next.js App Router.

## Root application layer

The root `app/` layer contains global infrastructure:

- Global CSS
- Fonts
- PWA manifest
- Service worker
- Global loading
- Global error handling
- Global not-found handling

## Locale application layer

``` text
app/[locale]/
```

is the localized application boundary.

It is responsible for:

- validating the locale
- generating locale-specific metadata
- loading translations
- providing `NextIntlClientProvider`
- setting the HTML language
- applying font variables

## Route groups

Route groups such as:

``` text
(public)
```

exist for organization and layout composition.

They must not be treated as URL segments.

------------------------------------------------------------------------

# 7. Layout Architecture

The project intentionally uses the locale layout as the HTML document
owner.

There is no separate `app/layout.tsx` file. The locale layout is the
application root because every user-facing route is below `[locale]`.

## Locale layout

File:

``` text
app/[locale]/layout.tsx
```

Responsibilities:

- `<html>`
- `<body>`
- locale validation
- localized metadata
- translation loading
- `NextIntlClientProvider`
- font variables

------------------------------------------------------------------------

# 8. Internationalization Architecture

Internationalization is mandatory.

The project uses:

``` text
next-intl
```

Locales:

``` text
en
bn
```

Default:

``` text
bn
```

Locale prefix:

``` text
always
```

Translation files:

``` text
messages/
├── en.json
└── bn.json
```

User-facing text should normally come from translation messages.

Do not hardcode localized UI text inside components when that text
should be translated.

------------------------------------------------------------------------

# 9. Locale Fallback Rule

The request-level i18n configuration intentionally falls back to Bengali
when the requested locale is invalid or unavailable.

This is an intentional product behavior.

Do not change this to strict rejection without an explicit requirement.

The architecture distinguishes:

- request-level fallback
- valid locale route rendering
- resource-level `notFound()`

------------------------------------------------------------------------

# 10. Navigation Rule

The project has locale-aware navigation utilities:

``` text
src/i18n/navigation.ts
```

Use:

``` ts
import { Link } from '@/i18n/navigation';
```

for localized application routes whenever appropriate.

Do not default to raw:

``` ts
next/link
```

when the route should preserve locale-aware navigation.

------------------------------------------------------------------------

# 11. Server Component Rule

Server Components are the default.

Use a Client Component only when necessary, such as:

- browser APIs
- React state
- effects
- event-driven interactions
- client-only libraries
- TanStack Query hooks

Do not convert an entire page to a Client Component because one small
child needs client-side interaction.

Prefer:

``` text
Server Page
├── Server UI
└── Client Interactive Component
```

------------------------------------------------------------------------

# 12. JSX Coding Rule

## Critical project rule

Do not write JSX/UI markup before a component’s `return`.

Before `return`, a component may contain:

- constants
- calculations
- derived values
- data transformations
- hooks
- helper functions
- configuration

UI markup must exist inside the returned JSX tree.

Preferred:

``` tsx
export default function Example() {
  const title = 'Example';
  const items = getItems();

  return (
    <section>
      <h1>{title}</h1>
    </section>
  );
}
```

Do not create detached JSX statements before `return`.

------------------------------------------------------------------------

# 13. Component Architecture

Current component structure:

``` text
src/components/
├── shared/
│   └── page-container.tsx
└── ui/
```

## `shared/`

For application-wide reusable components.

Examples:

- PageContainer
- shared navigation
- footer
- global layout primitives

## `ui/`

For reusable low-level UI primitives.

Examples:

- Button
- Input
- Card
- Dialog
- Badge
- Table primitives

Do not create a shared component merely because it is theoretically
reusable.

Feature-specific components should remain close to the feature/page
until genuine reuse exists.

------------------------------------------------------------------------

# 14. Service Layer

Current directory:

``` text
src/services/
```

This is a reserved service/integration layer.

It is **not automatically defined as the API folder**.

Depending on the final architecture, it may contain:

- API integrations
- authentication integrations
- notification integrations
- external service adapters
- domain service adapters

Do not invent a service architecture before it is needed.

------------------------------------------------------------------------

# 15. TanStack Query Architecture

TanStack Query is part of the project’s technology contract.

It is intended for server/API state such as:

- fetching
- caching
- refetching
- mutations
- invalidation
- synchronization

It should not replace ordinary local UI state.

Local UI state examples:

- modal visibility
- selected tab
- temporary input state
- dropdown state

## Current status

The exact query-hook/query-key folder architecture has not yet been
finalized.

Therefore, future query conventions must be documented when introduced
rather than pretending they already exist.

------------------------------------------------------------------------

# 16. API State Requirements

Every API-backed UI must deliberately handle appropriate states:

- loading
- success
- empty
- error
- retry
- mutation pending
- mutation success
- mutation error
- unauthorized
- forbidden
- session expiration where applicable

Never implement only the happy path.

A data page should not become a blank screen while loading or after an
error.

------------------------------------------------------------------------

# 17. Backend Architecture Direction

The planned backend architecture is:

``` text
Frontend
   ↓
HTTP API
   ↓
Express
   ↓
Mongoose
   ↓
MongoDB
```

Authentication direction:

``` text
User
 ↓
Frontend
 ↓
Authentication API
 ↓
JWT authentication
 ↓
Protected backend routes
```

The exact endpoint contract, schema contract, authentication
implementation, and authorization model must be documented when
finalized.

Do not invent an API contract before the backend actually defines it.

------------------------------------------------------------------------

# 18. API Error Model

Current file:

``` text
src/lib/api-error.ts
```

Current model:

``` ts
export type ApiErrorDetails = {
  code?: string;
  message: string;
  status: number;
  details?: unknown;
};
```

The project uses an `ApiError` class to normalize API failures on the
frontend.

Future API integrations should map backend failures into a predictable
error model.

Important error categories include:

- validation
- authentication
- authorization
- not found
- conflict
- rate limit
- server error
- network error

Never show raw technical error objects directly to users.

------------------------------------------------------------------------

# 19. Authentication and Authorization

Backend authentication is intended to use JWT.

The frontend currently has NextAuth as a dependency.

The final authentication architecture is not yet fully finalized in this
document.

Do not assume:

- token storage strategy
- final session implementation
- final middleware authorization
- commented auth code is active

## Security boundary

Frontend authorization checks are for UX.

Backend authorization is the actual security boundary.

The backend must validate:

- identity
- role
- permissions
- resource ownership
- sensitive mutations

A hidden or disabled button is not security.

------------------------------------------------------------------------

# 20. Environment Variables

Current `.env.example`:

``` env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK_API=true
AUTH_SECRET=replace-with-a-secure-secret
NEXTAUTH_URL=http://localhost:3000
```

Environment validation is handled by:

``` text
src/lib/env.ts
```

Rules:

- Never commit `.env`
- Never expose server secrets through `NEXT_PUBLIC_*`
- Add new variables to `.env.example`
- Document new variables
- Validate variables through the environment layer
- Never hardcode secrets

The current optional environment values are intentional.

------------------------------------------------------------------------

# 21. Styling System

The project uses Tailwind CSS v4.

The design system uses semantic CSS variables exposed through
Tailwind’s:

``` css
@theme inline
```

Use semantic classes such as:

``` text
bg-app-primary
text-app-text
text-app-text-muted
bg-app-surface
bg-app-surface-muted
border-app-border
```

New code should not copy arbitrary raw colors from existing components.

------------------------------------------------------------------------

# 22. Current Design Tokens

Semantic tokens:

``` text
app-primary
app-primary-hover
app-secondary
app-background
app-surface
app-surface-muted
app-border
app-text
app-text-muted
app-focus
max-w-app-wide
```

Current raw values:

``` text
primary: #0f6b4f
primary-hover: #0c5a42
secondary: #1e3a5f
background: #f7f8f7
surface: #ffffff
surface-muted: #eef2ef
border: #e3e6e4
text: #111827
text-muted: #5b6660
success: #1a8a5f
warning: #b8860b
error: #b3261e
info: #2563eb
disabled: #9ca3af
focus-ring: rgba(15, 107, 79, 0.4)
```

Do not introduce new semantic colors without intentionally updating the
design system.

------------------------------------------------------------------------

# 23. Typography

Current fonts:

- Inter
- Hind Siliguri

English:

``` text
--font-en
```

Bengali:

``` text
--font-bn
```

The document language determines the body font.

Do not introduce another font without a design-system decision.

------------------------------------------------------------------------

# 24. Responsive Design

The application is mobile-first.

Build for:

1.  mobile
2.  tablet
3.  desktop

Rules:

- avoid horizontal overflow
- use responsive grids
- preserve important actions on mobile
- avoid tiny text
- ensure navigation works on narrow screens
- give tables an intentional mobile strategy
- use practical touch targets

------------------------------------------------------------------------

# 25. Accessibility

Accessibility is a first-class requirement.

Use:

- semantic HTML
- correct heading hierarchy
- proper labels
- keyboard navigation
- visible focus states
- meaningful button/link labels
- appropriate ARIA attributes
- adequate contrast
- accessible status/error messaging

Use native HTML semantics before adding ARIA.

Interactive controls should generally have touch targets around 44px or
larger where practical.

------------------------------------------------------------------------

# 26. Accessibility + i18n

Accessibility text is user-facing text.

Therefore labels such as:

``` text
navigationLabel
mobileNavigationLabel
openMenuLabel
closeMenuLabel
```

should be translated.

Do not hardcode English accessibility labels into Bengali UI.

------------------------------------------------------------------------

# 27. Financial Data Rules

This is a financial-management application.

Therefore:

- Do not casually use floating-point arithmetic for financial
  calculations.
- Define an authoritative backend monetary representation.
- Validate financial input.
- Do not trust frontend totals.
- Recalculate authoritative financial totals on the backend.
- Preserve auditability for financial mutations.
- Validate permissions before financial mutations.
- Keep financial display formatting consistent.

The exact MongoDB monetary representation must be finalized as part of
backend architecture.

------------------------------------------------------------------------

# 28. Currency Formatting

Current utility:

``` text
src/lib/utils/currency.ts
```

provides BDT formatting.

Supported locales:

``` text
en
bn
```

English formatting uses:

``` text
en-US
```

Bengali formatting uses:

``` text
bn-BD
```

Currency:

``` text
BDT
```

Use the shared formatter rather than manually constructing currency
strings throughout the UI.

------------------------------------------------------------------------

# 29. PWA Architecture

Current PWA files:

``` text
app/manifest.ts
app/sw.ts
```

The manifest defines:

- application name
- short name
- description
- start URL
- scope
- standalone display
- theme color
- background color
- icons

The current service worker provides a minimal lifecycle/fetch
foundation.

## Important consistency check

`next.config.mjs` currently references:

``` text
src/app/sw.ts
```

while the known service-worker source is:

``` text
app/sw.ts
```

This must be verified before production service-worker generation is
enabled.

Do not silently change this path.

------------------------------------------------------------------------

# 30. SEO and Metadata

Locale-specific metadata is generated in:

``` text
app/[locale]/layout.tsx
```

Public pages should have meaningful metadata.

Localized routes should provide localized metadata where appropriate.

Use:

- meaningful title
- meaningful description
- semantic headings
- appropriate page-specific metadata

------------------------------------------------------------------------

# 31. Loading Architecture

Global loading boundary:

``` text
app/loading.tsx
```

Locale loading boundary:

``` text
app/[locale]/loading.tsx
```

Use loading boundaries to prevent blank experiences during navigation or
server rendering.

Loading UI should use project design tokens.

------------------------------------------------------------------------

# 32. Error Architecture

Global error boundary:

``` text
app/global-error.tsx
```

Locale error boundary:

``` text
app/[locale]/error.tsx
```

Errors should:

- communicate that something went wrong
- avoid exposing internal technical information
- provide retry when possible
- be accessible
- use localized messaging where the locale boundary supports it

Do not treat normal missing resources as generic application errors.

------------------------------------------------------------------------

# 33. Not-Found Architecture

Global fallback:

``` text
app/not-found.tsx
```

Locale-aware fallback:

``` text
app/[locale]/not-found.tsx
```

Use:

``` ts
notFound();
```

for valid routes where a requested resource does not exist.

Do not add:

``` text
admin/not-found.tsx
member/not-found.tsx
```

unless domain-specific UX is genuinely required.

------------------------------------------------------------------------

# 34. Route Naming

Routes should represent domain concepts.

Preferred examples:

``` text
member
admin
profile
savings
loans
assets
reports
settings
notifications
```

Avoid:

``` text
page1
screen
abc
test
data
```

Locale is always the first route segment.

Public homepage:

``` text
/[locale]
```

Implementation:

``` text
app/[locale]/(public)/page.tsx
```

------------------------------------------------------------------------

# 35. File Naming

Prefer lowercase kebab-case filenames:

``` text
page-container.tsx
api-error.ts
currency.ts
navigation.ts
```

React component names use PascalCase:

``` text
PageContainer
```

Functions and variables use camelCase:

``` text
formatCurrency
getPublicEnv
```

------------------------------------------------------------------------

# 36. Feature Placement

## Route

Use:

``` text
app/[locale]/...
```

## Reusable primitive

Use:

``` text
src/components/ui/
```

## Shared application UI

Use:

``` text
src/components/shared/
```

## Feature-specific UI

Keep it near the feature/page.

## Generic utility

Use:

``` text
src/lib/utils/
```

## Environment/configuration

Use:

``` text
src/lib/
```

## Integration/service

Use:

``` text
src/services/
```

when responsibility fits that layer.

## API/server state

Use the finalized TanStack Query convention once established.

Do not create speculative architecture just to make the folder tree look
“enterprise”.

------------------------------------------------------------------------

# 37. Adding a New Feature

Use this workflow:

## Step 1 — Identify domain

Examples:

``` text
Members
Savings
Loans
Assets
Notifications
Reports
```

## Step 2 — Identify ownership

Determine:

``` text
public
member
admin
```

## Step 3 — Define data contract

Define:

- request shape
- response shape
- validation
- permissions
- error behavior

## Step 4 — Define server/client boundary

Default to Server Component.

Introduce Client Components only when required.

## Step 5 — Reuse existing UI

Use existing shared components and tokens.

## Step 6 — Add translations

Update both:

``` text
messages/en.json
messages/bn.json
```

## Step 7 — Implement API states

Handle:

- loading
- success
- empty
- error
- retry
- mutation states
- authorization states

## Step 8 — Verify responsive UI

Test:

- mobile
- tablet
- desktop

## Step 9 — Verify accessibility

Test:

- keyboard
- focus
- labels
- semantic structure
- screen-reader meaning

## Step 10 — Update this guide

If the feature introduces a permanent architectural pattern, document
it.

------------------------------------------------------------------------

# 38. Adding a New Route

When creating a route:

1.  Determine whether it is public/member/admin.
2.  Place it under `[locale]`.
3.  Use route groups appropriately.
4.  Add metadata when needed.
5.  Add loading/error handling when needed.
6.  Add translations.
7.  Use locale-aware navigation.
8.  Do not expose route-group names in URLs.

------------------------------------------------------------------------

# 39. Adding a New Translation

When adding UI text:

1.  Choose the correct namespace.
2.  Add the English key.
3.  Add the Bengali key.
4.  Keep message structures compatible.
5.  Use `getTranslations()` in Server Components.
6.  Use `useTranslations()` in Client Components where appropriate.
7.  Localize accessibility labels.

------------------------------------------------------------------------

# 40. Adding a Shared Component

Before creating a shared component, ask:

> Is this genuinely reusable across unrelated features?

If not, keep it feature-local.

If yes:

1.  Give it one clear responsibility.
2.  Put it in the appropriate shared/ui directory.
3.  Keep the API small.
4.  Avoid business-specific logic in generic UI.
5.  Make it accessible.
6.  Make it responsive.
7.  Use semantic design tokens.

------------------------------------------------------------------------

# 41. API Integration Workflow

When an API becomes available:

1.  Define endpoint contract.
2.  Define request schema.
3.  Define response schema.
4.  Define error contract.
5.  Define authentication requirement.
6.  Define authorization requirement.
7.  Implement integration layer.
8.  Connect TanStack Query.
9.  Implement loading.
10. Implement empty.
11. Implement error.
12. Implement retry.
13. Implement mutation state.
14. Invalidate relevant queries.
15. Add translations.
16. Test unauthorized/forbidden behavior.

Never bind UI to an undocumented backend response shape.

------------------------------------------------------------------------

# 42. Mock API Rules

Current environment supports:

``` env
NEXT_PUBLIC_USE_MOCK_API=true
```

Mock API behavior exists to support frontend development before the real
backend is available.

Mock data should:

- resemble real API responses
- support realistic loading
- support empty states
- support errors
- support mutation behavior where needed

Mocks must not become the source of truth for production business rules.

------------------------------------------------------------------------

# 43. Security Rules

Never:

- expose secrets
- trust frontend financial totals
- trust frontend roles
- trust frontend ownership claims
- log sensitive authentication information
- commit `.env`
- render unsafe HTML without a justified sanitization strategy

Validate all untrusted external input.

Use Zod or the backend’s validation layer as appropriate.

------------------------------------------------------------------------

# 44. Performance Rules

Prefer:

- Server Components
- streaming/loading boundaries
- optimized images
- minimal client JavaScript
- stable query caching
- minimal unnecessary re-renders
- appropriate code splitting

Avoid:

- unnecessary Client Components
- unnecessary global state
- repeated requests
- unnecessary dependencies
- huge client-side data processing when server-side processing is more
  appropriate

------------------------------------------------------------------------

# 45. Current Public Homepage

The public homepage is:

``` text
app/[locale]/(public)/page.tsx
```

It is a Server Component.

The current implementation uses:

``` ts
getTranslations({ locale, namespace: 'HomePage' })
```

and locale-aware:

``` ts
Link
```

It also uses:

``` text
PageContainer
PublicNavbar
Footer
```

The page contains the public product sections including:

- hero
- how it works
- features
- trust information
- FAQ
- CTA
- footer

Structured translation data is read using `t.raw()` for areas such as:

``` text
features
faq
steps
trustPoints
```

The existing homepage is a reference implementation.

However, future components should use semantic design tokens rather than
copying raw color values from the current homepage.

------------------------------------------------------------------------

# 46. Current File Contents

The following sections contain the exact current file contents that were
supplied as part of the project context.

## `app/[locale]/layout.tsx`

``` tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { hindSiliguri, inter } from "../fonts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "bn") {
    return {
      title: "বটতলী সমবায় — লোহাগাড়া",
      description:
        "লোহাগাড়া বটতলী ব্যবসায়ী কল্যাণ সমবায় সমিতির সদস্য, সঞ্চয়, ঋণ ও যৌথ সম্পদ ব্যবস্থাপনার ডিজিটাল প্ল্যাটফর্ম।",
    };
  }

  return {
    title: "Bottoli Cooperative — Lohagara",
    description:
      "Digital savings, loan, and shared-asset management platform for Bottoli Business Welfare Cooperative Society, Lohagara.",
  };
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
    <html
      lang={locale}
      className={`${inter.variable} ${hindSiliguri.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

------------------------------------------------------------------------

## `src/proxy.ts`

``` ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { sessionCookieName } from '@/lib/auth/constants';

export function proxy(request: NextRequest) {
  const response = createMiddleware(routing)(request);
  // const pathname = request.nextUrl.pathname;
  // const privateRoute = /^\/(?:en|bn)\/(?:member|admin)(?:\/|$)/.test(pathname);

  // if (privateRoute && !request.cookies.has(sessionCookieName)) {
  //   const locale = pathname.split('/')[1];
  //   return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  // }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### Note

The authentication redirect logic is commented out and therefore not
active.

The current known tree does not show:

``` text
src/lib/auth/constants.ts
```

Do not invent that file. Verify its actual existence before modifying
the import.

------------------------------------------------------------------------

## `src/i18n/routing.ts`

``` ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'bn',
  localePrefix: 'always',
});
```

------------------------------------------------------------------------

## `src/i18n/request.ts`

``` ts
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

The project intentionally falls back to the default locale rather than
rejecting malformed/missing locale input.

------------------------------------------------------------------------

## `src/i18n/navigation.ts`

``` ts
import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

------------------------------------------------------------------------

## `app/fonts.ts`

``` ts
import { Hind_Siliguri, Inter } from 'next/font/google';

export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const hindSiliguri = Hind_Siliguri({
  variable: '--font-hind-siliguri',
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  display: 'swap',
  preload: false,
});
```

------------------------------------------------------------------------

## `app/globals.css`

``` css
@import 'tailwindcss';

@theme inline {
  --color-app-primary: var(--color-primary);
  --color-app-primary-hover: var(--color-primary-hover);
  --color-app-secondary: var(--color-secondary);
  --color-app-background: var(--color-background);
  --color-app-surface: var(--color-surface);
  --color-app-surface-muted: var(--color-surface-muted);
  --color-app-border: var(--color-border);
  --color-app-text: var(--color-text);
  --color-app-text-muted: var(--color-text-muted);
  --color-app-focus: var(--color-focus-ring);
  --max-width-app-wide: 75rem;
}

:root {
  color-scheme: light;
  --font-en: var(--font-inter), 'Inter', 'Noto Sans', system-ui, sans-serif;
  --font-bn: var(--font-hind-siliguri), 'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif;
  /* existing color tokens remain unchanged */
  --color-primary: #0f6b4f;
  --color-primary-hover: #0c5a42;
  --color-secondary: #1e3a5f;
  --color-background: #f7f8f7;
  --color-surface: #ffffff;
  --color-surface-muted: #eef2ef;
  --color-border: #e3e6e4;
  --color-text: #111827;
  --color-text-muted: #5b6660;
  --color-success: #1a8a5f;
  --color-warning: #b8860b;
  --color-error: #b3261e;
  --color-info: #2563eb;
  --color-focus-ring: rgba(15, 107, 79, 0.4);
  --color-disabled: #9ca3af;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-en);
}

html[lang='bn'] body {
  font-family: var(--font-bn);
}

html[lang='en'] body {
  font-family: var(--font-en);
}

body {
  line-height: 1.5;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

button,
input,
select,
textarea {
  font: inherit;
}

:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

------------------------------------------------------------------------

## `app/manifest.ts`

``` ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/bn',
    name: 'লোহাগাড়া বটতলী ব্যবসায়ী কল্যাণ সমবায় সমিতি লিঃ',
    short_name: 'বটতলী সমবায়',
    description: 'লোহাগাড়া বটতলী ব্যবসায়ী কল্যাণ সমবায় সমিতির সদস্য, সঞ্চয়, ঋণ ও যৌথ সম্পদ ব্যবস্থাপনার ডিজিটাল প্ল্যাটফর্ম।',
    start_url: '/bn',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F8F7',
    theme_color: '#0F6B4F',
    icons: [
      {
        src: '/branding/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/branding/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/branding/icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/branding/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
```

------------------------------------------------------------------------

## `app/sw.ts`

``` ts
// @ts-nocheck

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(fetch(event.request));
});
```

------------------------------------------------------------------------

## `app/loading.tsx`

``` tsx
export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-app-background px-4"
    >
      <div className="flex flex-col items-center">
        <div
          aria-hidden="true"
          className="h-9 w-9 animate-spin rounded-full border-4 border-app-border border-t-app-primary"
        />
        <p className="mt-4 text-sm font-medium text-app-text-muted">
          Loading...
        </p>
      </div>
    </main>
  );
}
```

------------------------------------------------------------------------

## `app/[locale]/loading.tsx`

``` tsx
export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen bg-app-background"
    >
      <div className="mx-auto w-full max-w-app-wide px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="space-y-2">
            <div className="h-7 w-40 rounded-lg bg-app-surface-muted" />
            <div className="h-4 w-64 max-w-full rounded bg-app-surface-muted" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-28 rounded-2xl bg-app-surface-muted" />
            <div className="h-28 rounded-2xl bg-app-surface-muted" />
            <div className="h-28 rounded-2xl bg-app-surface-muted" />
          </div>
          <div className="h-64 rounded-2xl bg-app-surface-muted" />
        </div>
      </div>
    </main>
  );
}
```

------------------------------------------------------------------------

## `src/components/shared/page-container.tsx`

``` tsx
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils/cn';

type PageContainerProps = ComponentPropsWithoutRef<'div'> & {
  size?: 'content' | 'wide' | 'full';
};

const sizeClasses = {
  content: 'max-w-3xl',
  wide: 'max-w-app-wide',
  full: 'max-w-none',
} as const;

export function PageContainer({
  className,
  size = 'wide',
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

export type { PageContainerProps };
```

------------------------------------------------------------------------

## `src/lib/env.ts`

``` ts
import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_USE_MOCK_API: z.enum(['true', 'false']).default('true'),
});

const serverEnvSchema = publicEnvSchema.extend({
  AUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
  });
}

export function getServerEnv() {
  const env = serverEnvSchema.parse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  });
  return env;
}
```

------------------------------------------------------------------------

## `src/lib/api-error.ts`

``` ts
export type ApiErrorDetails = {
  code?: string;
  message: string;
  status: number;
  details?: unknown;
};

export class ApiError extends Error {
  readonly code?: string;
  readonly status: number;
  readonly details?: unknown;

  constructor({ code, message, status, details }: ApiErrorDetails) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
```

------------------------------------------------------------------------

## `src/lib/utils/cn.ts`

``` ts
import { clsx, type ClassValue } from 'clsx';

import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

------------------------------------------------------------------------

## `src/lib/utils/currency.ts`

``` ts
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

------------------------------------------------------------------------

## `next.config.mjs`

``` js
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

### Known issue to verify

The configured Serwist source is:

``` text
src/app/sw.ts
```

but the supplied current service-worker file is:

``` text
app/sw.ts
```

This is a consistency check, not an instruction to silently modify the
project.

------------------------------------------------------------------------

## `postcss.config.mjs`

``` js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

------------------------------------------------------------------------

## `tsconfig.json`

``` json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": [
      "dom",
      "dom.iterable",
      "webworker",
      "esnext"
    ],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

------------------------------------------------------------------------

## `package.json`

``` json
{
  "name": "somitikhata",
  "version": "1.0.0",
  "description": "This `docs/` folder is the single source of truth for the project before any application code is written. Every architectural and design decision lives here first. Code should never contradict these documents — if it needs to, the document gets updated first, in a separate commit, with the reason noted.",
  "main": "index.js",
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@hookform/resolvers": "^5.9.1",
    "@serwist/next": "^9.5.12",
    "@tanstack/react-query": "^5.102.8",
    "@tanstack/react-table": "^9.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.4.0",
    "lucide-react": "^1.37.0",
    "next": "^16.3.3",
    "next-auth": "^4.24.15",
    "next-intl": "^4.14.1",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-hook-form": "^7.87.0",
    "recharts": "^3.10.1",
    "tailwind-merge": "^3.6.0",
    "zod": "^4.5.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^26.4.0",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.5",
    "eslint": "^9.39.5",
    "eslint-config-next": "^16.3.3",
    "postcss": "^8.5.26",
    "tailwindcss": "^4.3.3",
    "typescript": "^6.0.3"
  }
}
```

------------------------------------------------------------------------

## `.env.example`

``` env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK_API=true
AUTH_SECRET=replace-with-a-secure-secret
NEXTAUTH_URL=http://localhost:3000
```

------------------------------------------------------------------------

## `.gitignore`

``` gitignore
node_modules
.next
out
coverage
npm-debug.log*
.env
.env.local
.env.*.local
.DS_Store
*.tsbuildinfo
```

------------------------------------------------------------------------

# 47. Translation Message Structure

The current message architecture follows namespaces.

Example:

``` json
{
  "HomePage": {
    "site": {
      "name": "বটতলী সমবায়",
      "tagline": "লোহাগাড়া বটতলী ব্যবসায়ী কল্যাণ সমবায় সমিতির ডিজিটাল সঞ্চয়, ঋণ ও সদস্য ব্যবস্থাপনা।"
    },
    "nav": {
      "howItWorks": "কীভাবে কাজ করে",
      "features": "ফিচার",
      "faq": "প্রশ্ন",
      "login": "লগইন",
      "register": "একাউন্ট তৈরি",
      "language": "English",
      "navigationLabel": "প্রধান নেভিগেশন",
      "mobileNavigationLabel": "মোবাইল প্রধান নেভিগেশন",
      "openMenuLabel": "নেভিগেশন মেনু খুলুন",
      "closeMenuLabel": "নেভিগেশন মেনু বন্ধ করুন",
      "shortName": "বটতলী সমবায়",
      "registration": "রেজিঃ নং- ৭৬৪৬/৯৯",
      "legalName": "লোহাগাড়া বটতলী ব্যবসায়ী কল্যাণ সমবায় সমিতি লিঃ",
      "location": "লোহাগাড়া, চট্টগ্রাম"
    }
  }
}
```

The exact message set can grow as features are implemented.

Both locale files should maintain compatible structures.

------------------------------------------------------------------------

# 48. Current vs Future Architecture

## Current

Confirmed current architecture includes:

- Next.js App Router
- `[locale]`
- `(public)` route group
- public homepage
- `admin` route foundation
- `member` route foundation
- next-intl
- Tailwind v4
- semantic design tokens
- PageContainer
- environment validation
- ApiError
- currency utilities
- PWA foundation
- loading/error/not-found boundaries

## Future / Reserved

Do not treat these as finalized current files:

- feature-specific query hooks
- API client architecture
- query-key registry
- domain type directories
- permission utilities
- finalized session helpers
- finalized JWT transport
- audit logging
- notification adapters
- backend folder structure
- finalized financial transaction model

Introduce them only when implementation requires them and document their
exact location.

------------------------------------------------------------------------

# 49. Current Consistency Checks

The following items should be verified rather than silently changed.

## Serwist path

Config:

``` text
src/app/sw.ts
```

Known file:

``` text
app/sw.ts
```

## Proxy authentication import

Current proxy imports:

``` text
@/lib/auth/constants
```

but that file is not shown in the known project tree.

Verify before modifying.

## Unused imports

`src/proxy.ts` currently imports:

``` ts
NextResponse
sessionCookieName
```

while the related redirect code is commented out.

Do not silently redesign the auth flow merely to remove the imports.

## Lint script

Current package script:

``` json
"lint": "next lint"
```

Verify compatibility with the installed Next.js version before treating
this as the final lint workflow.

------------------------------------------------------------------------

# 50. AI Coding Assistant Constitution

Any AI assistant working on this project must:

## Before coding

Inspect:

- relevant existing files
- existing architecture
- current design tokens
- translations
- package.json
- shared components
- route structure

Do not invent files simply because they are conventional.

## During coding

Must:

- preserve architecture
- use existing dependencies
- use existing design tokens
- use next-intl
- prefer Server Components
- handle API states
- keep JSX inside return
- avoid premature abstraction
- avoid unnecessary packages
- ask before installing dependencies

## After coding

Check:

- TypeScript
- lint
- translation coverage
- accessibility
- responsive behavior
- loading
- empty
- error
- retry
- mutation states
- authorization
- architectural consistency

------------------------------------------------------------------------

# 51. AI Must Not Assume

The AI must not assume that:

- `src/services/` is automatically the API directory
- every page needs `'use client'`
- every feature needs a global component
- TanStack Query folder conventions are already finalized
- NextAuth is the finalized authentication architecture
- JWT storage strategy is finalized
- commented authentication code is active
- raw colors in the homepage are the future design-system standard
- `(public)` becomes part of the URL
- missing data is always an application error
- frontend permission checks are security
- mock API behavior equals production behavior
- undocumented backend response shapes are stable

------------------------------------------------------------------------

# 52. Architecture Change Protocol

If a new requirement conflicts with this guide:

``` text
Requirement
    ↓
Architecture review
    ↓
Update documentation
    ↓
Implement
    ↓
Verify
```

Do not use a hidden workaround that leaves the documentation incorrect.

------------------------------------------------------------------------

# 53. Definition of Done

A feature is complete when applicable:

- functionality works
- TypeScript passes
- linting passes
- translations exist
- loading exists
- empty state exists
- error state exists
- retry exists where useful
- mutation state exists where applicable
- authorization is enforced
- responsive behavior works
- accessibility is acceptable
- design tokens are used
- no unnecessary dependency was introduced
- documentation is updated if architecture changed

------------------------------------------------------------------------

# 54. Final Engineering Principle

The objective is not simply to make the next feature work.

The objective is to make every new feature feel like it belongs to the
same system.

Every implementation should preserve:

``` text
Architecture
    +
Consistency
    +
Security
    +
Accessibility
    +
Localization
    +
Maintainability
    +
Performance
```

When a new implementation does not fit the existing architecture, change
the architecture deliberately and document the change first.
