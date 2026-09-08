# SomitiKhata Project Development Guide

**Status:** Active engineering contract
**Repository:** `somitikhata`
**Reviewed:** 2026-09-08
**Product:** Bilingual savings, loan, and shared-asset management frontend for Bottoli Business Welfare Cooperative Society, Lohagara

This document is the implementation guide for human developers and AI coding assistants. It describes the repository as it exists today, distinguishes implemented code from planned architecture, and defines the rules for future work.

## 1. Authority and Scope

Use documentation and code in this order of authority:

1. The current source tree and configuration determine what exists and what can be imported.
2. This guide determines how new code must be written inside that current structure.
3. If present, documents under `docs/` define intended product behavior, business rules, API contracts, design direction, and roadmap. They do not make planned files or features implemented. The current worktree does not contain `docs/`.
4. `PROJECT_ARCHITECTURE.md`, `README.md`, and `SomitiKhata — Complete Architecture and Development Guide.md` provide context only when they exist; claims that contradict the source tree must be treated as planned or stale until verified.

When code and documentation disagree, do not silently choose a new architecture. Record the discrepancy, update the relevant documentation when the decision is approved, and keep the implementation change focused.

### Current status

This is a Next.js-only frontend/demo scaffold with a production-oriented foundation. The public landing page and locale infrastructure are active. Login now calls a same-origin backend proxy, and member/admin routes have frontend session and role guards, but persistence, backend integration, JWT lifecycle, and backend authorization depend on the external Express service. Do not present mock values as real financial data.

The planned Express API, MongoDB database, Auth.js flow, feature services, and production PWA caching strategy are not implemented in this repository. The current foundation includes the verified locale-owned document boundary, shared route shell/stat/status components, lazy environment validation, a typed REST client with structured errors, and global loading/error/not-found boundaries. These foundations do not themselves provide authentication or backend security.

## 2. Non-negotiable Rules

- Read this guide and the relevant files before changing code.
- Preserve the existing App Router and locale route structure for normal page work.
- Do not move or delete `src/app/[locale]/layout.tsx`, change `src/proxy.ts`, or alter the root layout architecture for a page-only task.
- Do not add dependencies, upgrade versions, replace libraries, or edit dependency files without explicit approval.
- Use the exact installed package baseline documented below.
- Reuse existing components and utilities before creating equivalents.
- Keep user-facing text in both translation catalogs; do not hard-code new UI copy in JSX.
- Do not invent financial, loan, eligibility, correction, or asset-share rules. When planning documents are restored, use `docs/business-rules.md` and `docs/client-questions.md`; until then, stop and request the missing business-rule source.
- Treat all current mock values as demonstration fixtures.
- Do not expose private member/admin data through public routes, metadata, indexing, or caches.
- Preserve Server Component boundaries. Add a small Client Component island when interaction requires it instead of converting an entire page.
- Every asynchronous or interactive workflow needs intentional loading, error, empty, success, retry, and disabled states where applicable.
- Keep component logic before `return`; keep JSX declarative.
- Do not perform unrelated refactors during a feature task.
- Do not commit, push, reset, or modify remotes unless explicitly requested.

## 3. Exact Technology Baseline

Versions below are the direct dependency versions resolved in `package-lock.json` on the review date. `package.json` uses caret ranges, so the lockfile is part of the reproducible baseline.

| Area | Package | Resolved version | Current status |
|---|---|---:|---|
| Framework | `next` | `16.3.3` | Installed and used with App Router |
| UI runtime | `react` | `19.2.8` | Installed and used |
| UI runtime | `react-dom` | `19.2.8` | Installed and used |
| Language | `typescript` | `6.0.3` | Installed with strict checking |
| Styling | `tailwindcss` | `4.3.3` | Installed and used |
| Tailwind integration | `@tailwindcss/postcss` | `4.3.3` | Installed and used |
| CSS processing | `postcss` | `8.5.26` | Installed |
| i18n | `next-intl` | `4.14.1` | Installed and active |
| Icons | `lucide-react` | `1.37.0` | Installed; used by public navigation |
| Class composition | `clsx` | `2.1.1` | Used by `cn()` |
| Tailwind merging | `tailwind-merge` | `3.6.0` | Used by `cn()` |
| Variant helper | `class-variance-authority` | `0.7.1` | Installed; no verified active shared primitive |
| Forms | `react-hook-form` | `7.87.0` | Installed; not used by the active public page |
| Form adapter | `@hookform/resolvers` | `5.9.1` | Installed; not used by the active public page |
| Validation | `zod` | `4.5.4` | Installed; not used by the active public page |
| Server state | `@tanstack/react-query` | `5.102.8` | Installed; no provider or active query usage |
| Tables | `@tanstack/react-table` | `9.2.4` | Installed; not used by reviewed pages |
| Charts | `recharts` | `3.10.1` | Installed; not used by reviewed pages |
| Dates | `date-fns` | `4.4.0` | Installed; not used by reviewed pages |
| Authentication | `next-auth` | `4.24.15` | Installed; authentication is not implemented |
| PWA | `@serwist/next` | `9.5.12` | Configured but disabled |
| Types | `@types/node` | `26.4.0` | Installed |
| Types | `@types/react` | `19.2.18` | Installed |
| Types | `@types/react-dom` | `19.2.5` | Installed |
| Linting | `eslint` | `9.39.5` | Installed |
| Next lint config | `eslint-config-next` | `16.3.3` | Installed |

### Package policy

Future development **MUST use these currently installed package versions unless a developer explicitly approves a dependency/version change**. If a required package is absent, do not install it automatically. Ask for permission first. The same applies to upgrading, downgrading, replacing, or removing an existing package.

### Scripts

```text
npm run dev       -> next dev
npm run build     -> next build
npm run start     -> next start
npm run lint      -> next lint
npm run typecheck -> tsc --noEmit
```

The `lint` script uses `next lint`; verify compatibility with Next.js 16 before changing tooling. No test script or test configuration is currently present.

## 4. Actual Configuration and Core Implementations

This section records the relevant current code, not merely filenames. The snippets are intentionally limited to the architectural portions of each file; the source files remain authoritative.

### `tsconfig.json`

The current compiler configuration is:

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "webworker", "esnext"],
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
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

Strict checking, bundler resolution, JSON imports, isolated modules, the React JSX transform, and the `@/*` alias are deliberate project constraints. Do not weaken `strict`, add broad `any`, or add `@ts-nocheck` to application code. The `webworker` library exists for `src/app/sw.ts`.

### `next.config.mjs`

The current configuration composes Serwist with next-intl:

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

`disable: true` means no production service worker is generated. `reactStrictMode: true` is active. The `turbopack` object is empty and is not a custom optimization. Locale behavior belongs in `src/proxy.ts` and `src/i18n/routing.ts`, not in this file.

### `postcss.config.mjs`

Tailwind CSS v4 is connected through the PostCSS plugin:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Do not add a Tailwind v3 configuration file or v3 directives.

### `src/proxy.ts`

The current proxy only handles next-intl locale routing:

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

It excludes API paths, Next internals, and paths containing file extensions. It does not authenticate users or protect member/admin routes. Add auth checks only when the backend JWT contract and redirect behavior are implemented and documented.

### i18n configuration and provider

`src/i18n/routing.ts` is the locale policy source:

```ts
export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'bn',
  localePrefix: 'always',
});
```

`src/i18n/request.ts` validates the requested locale and dynamically loads `../../messages/${activeLocale}.json`. `src/i18n/navigation.ts` exports `Link`, `redirect`, `usePathname`, `useRouter`, and `getPathname` from `createNavigation(routing)`.

The locale layout currently performs the provider boundary:

```tsx
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
```

There are no other providers in the current source tree: no React Query provider, session provider, global state provider, or theme provider. Do not import one or assume one exists. The dynamic `[locale]/layout.tsx` owns global CSS, `<html>`, and `<body>` so the route parameter directly controls document language and font selection. There is no separate top-level `src/app/layout.tsx` because every application route is below `[locale]`.

### `PageContainer` and shared components

The actual `PageContainer` implementation is:

```tsx
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
```

Use `PageContainer` for shared page width and horizontal padding. Do not create a second global wrapper. The existing `AppShell` is a Client Component with `variant`, optional `locale`, optional `title`, `children`, and optional `actions`; it owns the public header or member/admin sidebar, locale toggle, and static navigation. It currently imports the legacy `@/lib/i18n/locales` helper, so that dependency must be resolved before changing or adopting the shell for production. `StatCard` accepts `title`, `value`, optional `meta`, and optional `icon`, and uses the established card treatment. `StatusBadge` accepts a display `label` and uses the existing Tailwind status classes; do not replace its styling with a second token system without a design-system decision.

### Tailwind and global CSS implementation

`src/app/globals.css` begins with:

```css
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
```

The file defines the light semantic tokens documented in the Tailwind section, applies `var(--font-en)` by default, switches to `var(--font-bn)` for `html[lang='bn']`, sets `box-sizing: border-box`, inherits fonts for form controls, and preserves `:focus-visible`. There is no dark-theme token block or theme provider in the current project. New code must use the existing semantic tokens rather than repeating page-specific hex values.

### Environment and API foundation

`src/lib/env.ts` currently validates:

```ts
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_USE_MOCK_API: z.enum(['true', 'false']).default('true'),
});
```

`getServerEnv()` additionally accepts optional `AUTH_SECRET` and `NEXTAUTH_URL`; the current opaque backend-cookie flow does not use `AUTH_SECRET` in the frontend. `NEXT_PUBLIC_USE_MOCK_API` is currently parsed but not used to select a mock service; do not describe mock switching as implemented.

The API client supports all five REST methods, relative or absolute URLs, JSON request bodies, `credentials: 'include'`, JSON/text response parsing, and `ApiError` for non-2xx responses. It does not yet implement JWT refresh, schema validation, retries, or a service selector.

## 5. Architecture Blueprint

### Runtime shape

```text
Browser
  -> Next.js App Router
  -> next-intl locale proxy
  -> src/app/[locale]/layout.tsx
  -> Server Components and small Client Components
  -> messages/*.json, mock fixtures, or the current fetch wrapper

Future, not currently implemented:
  -> service boundary
  -> Express API
  -> database
```

```text
src/
├── app/                         Route entry points, layouts, metadata, global CSS, PWA files
│   ├── layout.tsx               Global CSS wrapper; returns children
│   ├── [locale]/                Required `en` or `bn` URL segment
│   │   ├── layout.tsx            Locale validation, metadata, messages provider
│   │   ├── (public)/             Public route group; group name is absent from URL
│   │   ├── (auth)/               Login/register route group; currently presentational
│   │   ├── member/               Member demo routes; not protected
│   │   └── admin/                Admin demo routes; not protected
│   ├── globals.css               Tailwind v4 import and semantic CSS tokens
│   ├── fonts.ts                  Inter and Hind Siliguri font definitions
│   ├── manifest.ts               Web app manifest
│   └── sw.ts                     Pass-through service worker source; no caching strategy
├── components/
│   ├── branding/                 Brand-specific reusable components
│   ├── shared/                   Cross-route layout and display components
│   └── ui/                       Reserved for reusable primitives; currently empty
├── features/                    Reserved by the planned architecture; currently empty
├── i18n/                        Active next-intl routing and request configuration
├── images/                      Legacy/source image assets; no verified active imports
├── lib/
│   ├── auth/                    Reserved for auth helpers; currently empty
│   ├── mock-data/                Demo fixtures used by member/admin scaffold
│   └── utils/                   Small shared utilities
├── services/                    API boundary; currently only `api-client.ts`
└── proxy.ts                     Locale middleware/proxy entry point
```

### Target production structure

The following is the approved direction for production work. It is a target boundary, not an inventory of files that currently exist:

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   └── (protected)/
│   │       ├── layout.tsx
│   │       ├── unauthorized/page.tsx
│   │       ├── member/
│   │       └── admin/
│   ├── api/                  Optional same-origin BFF/auth proxy routes
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── robots.ts             Add only when SEO policy is approved
│   └── sitemap.ts            Add only when public URL inventory is approved
├── components/
│   ├── branding/
│   ├── shared/
│   └── ui/
├── features/<domain>/        Domain components, schemas, types, and services
├── hooks/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── errors/
│   ├── env/
│   └── utils/
├── providers/
├── services/
├── types/
└── i18n/
```

Introduce these boundaries incrementally and only when a real feature requires them. Do not create empty folders or migrate every current page in one unrelated refactor. Member/admin URLs can remain unchanged when route groups are parenthesized around them.

### Directory rules

- `src/app/**`: route pages, route layouts, route-local components, metadata, and route-specific loading/error files when needed. Do not place general utilities here.
- `src/components/shared/**`: components reused across multiple feature areas or routes. Do not put route-specific business workflows here.
- `src/components/branding/**`: reusable organization identity and logo presentation.
- `src/components/ui/**`: reusable visual primitives only after confirming a primitive is genuinely shared. Do not create duplicate page-specific wrappers here.
- `src/features/<feature>/components/**`: use only when a feature implementation is intentionally introduced and the structure is approved. The directories exist in the current tree but contain no verified implementation.
- `src/lib/utils/**`: pure helpers with no route rendering. Reuse existing helpers before adding one.
- `src/lib/mock-data/**`: temporary demo/reference data only. Never use it as a production persistence layer.
- `src/services/**`: request/service boundary. Extend the current API strategy deliberately; do not add parallel clients.
- `src/i18n/**`: locale configuration and locale-aware navigation only.
- `messages/**`: translation catalogs with matching key structures.
- `public/**`: browser-served static assets. Do not store secrets or private member data.
- `docs/**`: product, business, architecture, design, API, SEO, PWA, and roadmap decisions.

## 6. Route and Layout Contract

### Route tree and URLs

```text
src/app/[locale]/
├── (public)/page.tsx              /bn and /en
├── (auth)/login/page.tsx          /bn/login and /en/login
├── (auth)/register/page.tsx       /bn/register and /en/register
├── member/dashboard/page.tsx      /bn/member/dashboard
├── member/deposits/page.tsx       /bn/member/deposits
├── member/loans/page.tsx          /bn/member/loans
├── member/assets/page.tsx         /bn/member/assets
├── member/profile/page.tsx        /bn/member/profile
├── admin/dashboard/page.tsx       /bn/admin/dashboard
├── admin/members/page.tsx         /bn/admin/members
├── admin/deposits/page.tsx        /bn/admin/deposits
├── admin/loans/page.tsx           /bn/admin/loans
├── admin/assets/page.tsx          /bn/admin/assets
├── admin/reports/page.tsx         /bn/admin/reports
└── admin/settings/page.tsx        /bn/admin/settings
```

The same paths exist under `/en`. `bn` is the default locale and `localePrefix: 'always'` means locale prefixes are required. `(public)` and `(auth)` are route groups and do not appear in URLs. `member` and `admin` are ordinary route segments and do appear in URLs.

There is no `src/app/page.tsx`. Unprefixed route behavior is handled by `src/proxy.ts` and next-intl. Do not add a second root redirect page without an approved route decision.

The current global boundaries are `src/app/loading.tsx`, `src/app/global-error.tsx`, and `src/app/not-found.tsx`. Locale routes additionally use `src/app/[locale]/loading.tsx`, `src/app/[locale]/error.tsx`, and `src/app/[locale]/not-found.tsx`. `src/app/[locale]/unauthorized/page.tsx` provides the localized forbidden state. The `(private)` route-group policy is defined in `src/app/[locale]/(private)/layout.tsx`; the existing `member/layout.tsx` and `admin/layout.tsx` enforce it for every descendant route while preserving the existing URLs.

### Layout responsibilities

- `src/app/[locale]/layout.tsx` imports `globals.css`, validates the locale, generates locale params, creates localized metadata, loads messages with `getMessages({ locale })`, applies the font variables, renders `<html lang={locale}>` and `<body>`, and provides `NextIntlClientProvider`. It is the root document layout because every application route is below `[locale]`.
- Do not add another `<html>` or `<body>` inside pages or feature components. Keep the document boundary in `[locale]/layout.tsx` unless the route architecture is deliberately migrated and verified.
- Do not introduce `next/root-params` or move the document shell without a separate architecture migration and build verification.

### Proxy and navigation

`src/proxy.ts` creates the next-intl middleware using `src/i18n/routing.ts`. Its matcher excludes API routes, Next internals, and paths containing a file extension. It also redirects localized `member` and `admin` paths to the matching login route when the opaque `somiti_session` cookie is absent. Server layouts still validate the session and role; the proxy is not the backend authorization boundary.

Use `Link`, `redirect`, `usePathname`, and `useRouter` from `src/i18n/navigation.ts` for localized internal navigation. A locale switch should preserve the current pathname where possible.

## 7. Server and Client Components

Server Components are the default.

Use a Server Component for route params, server translation loading, metadata, static/read-only rendering, and server-side data access that does not require browser interaction. New localized server pages should receive `params: Promise<{ locale: string }>` and use:

```tsx
const { locale } = await params;
const t = await getTranslations({ locale, namespace: 'Feature' });
```

Use a small Client Component for `useState`, event handlers, browser APIs, controlled forms, theme changes, interactive filtering/sorting/pagination, charts, tables, drawers/modals, or client-side query hooks. Put `'use client'` only at the smallest boundary that needs it.

Do not convert an entire page to a Client Component because one button or form is interactive. Pass server-loaded data into a client island through typed props.

The repository currently has no React Query provider, session provider, global state provider, or server-action implementation. Do not assume any of these exist.

## 8. Components and Reuse

Before creating a component, search `src/components`, `src/app`, and the relevant feature directory for an existing solution.

| Component | Location | Purpose and rule |
|---|---|---|
| `BrandLogo` | `src/components/branding/brand-logo.tsx` | Presents the organization logo. Reuse it for brand identity instead of embedding image markup repeatedly. |
| `AppShell` | `src/components/shared/app-shell.tsx` | Shared member/admin/public shell with navigation, title, actions, and `PageContainer`. It is currently a compatibility shell for static screens, not an authentication boundary. |
| `PageContainer` | `src/components/shared/page-container.tsx` | Shared page-width and horizontal padding wrapper. Use it instead of recreating page-width wrappers. |
| `StatCard` | `src/components/shared/stat-card.tsx` | Shared summary/stat display for dashboard-style content. Parents provide translated labels and formatted values. |
| `StatusBadge` | `src/components/shared/status-badge.tsx` | Shared status presentation. It currently styles the incoming label; production feature work should move toward stable status codes plus translated labels. |
| `PublicNavbar` | `src/app/[locale]/(public)/_components/public-navbar.tsx` | Responsive public navigation, menu state, and locale switching. Keep public navigation behavior here rather than duplicating it in the page. |
| `Footer` | `src/app/[locale]/(public)/_components/footer.tsx` | Public organization footer. It is a Client Component because it uses `useTranslations`. |

The `src/components/ui/` and `src/features/*/components/` directories are currently empty/reserved. Do not populate them merely to match a planned architecture. Add a component there only when the implementation genuinely needs a shared or approved feature boundary.

There is no verified shared button, input, form, modal, dialog, table, or empty-state primitive. The route-state files added during the foundation work are baseline boundaries, not replacements for shared UI primitives. Add another component only when an existing component cannot satisfy the responsibility and repeated usage justifies it.

## 9. Utilities and Data Conventions

### `cn()`

`src/lib/utils/cn.ts` exports `cn(...inputs)`, combining `clsx` and `tailwind-merge`. Use it when conditional class composition or Tailwind conflict resolution is needed. Do not write another class-merging helper or use it for unrelated data transformations.

### Currency

`src/lib/utils/currency.ts` defines the `Locale` type and `formatCurrency`/`formatShortCurrency`. Use these helpers for new currency presentation rather than manually concatenating symbols or localized digits. The short formatter currently uses `en-US`; do not assume it is suitable for Bangla output without verifying or extending it deliberately.

Keep API/mock values canonical where possible: numeric amounts, stable status codes, and ISO dates. Translate labels and format values at the presentation boundary. Do not make a service return only a preformatted string such as `৳৫,০০০ টাকা`.

### Mock data and API client

`src/lib/mock-data/index.ts` contains demo fixtures for the static member/admin screens. It is not a database and must not be used to imply persistence.

`src/services/api-client.ts` is now a typed generic REST wrapper. It supports `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`, resolves relative URLs against `NEXT_PUBLIC_API_BASE_URL`, sends JSON bodies, includes browser credentials, parses JSON/text responses, and throws `ApiError` from `src/lib/api-errors.ts` for non-2xx responses. It does not yet refresh JWTs, validate response schemas, choose mock versus HTTP services, or implement a backend response envelope. Add those behaviors only when the Express contract is available.

`src/lib/env.ts` lazily validates public environment variables with Zod and exposes `getServerEnv()` for server-only configuration. The current frontend does not sign or verify JWTs, so `AUTH_SECRET` is accepted for future server auth work but is not required by this backend-session proxy.

## 10. Data Fetching and API Strategy

### Current implementation

The active public page reads translated content from `messages/*.json`; it does not call a backend. Member/admin pages import demo fixtures directly. Login/register pages have no real submission or persistence. No API route, Express server, database, mutation layer, cache policy, or authentication header strategy exists in this repository.

The intended future boundary is:

```text
Page or Client Component
  -> approved service function
  -> API client
  -> Express backend
  -> database
  -> typed response
  -> UI state
```

Do not implement a new Server Action, API route, query library, or service layer without an approved architecture decision. When a real API is introduced, document request validation, response types, auth transport, cache/revalidation, error mapping, and mutation invalidation before wiring a feature.

### Required request behavior for future API work

- Validate inputs at the boundary with the approved schema strategy.
- Keep secrets server-side; `NEXT_PUBLIC_*` values are browser-visible.
- Use typed request and response shapes.
- Treat non-2xx responses as failures and map them to user-safe messages.
- Never expose stack traces, tokens, or private records in UI errors.
- Define how stale data is revalidated after mutations.
- Do not use mock fixtures as a silent fallback for failed production requests.

## 11. Loading, Error, Empty, Success, and Disabled States

Every async feature must specify these states before implementation:

| State | Required behavior |
|---|---|
| Initial loading | Reserve the final layout shape with a skeleton or intentional loading UI; avoid layout jumps. |
| Background loading | Preserve usable current data and show a small non-disruptive pending indicator where appropriate. |
| Submit/loading | Disable the submitting control, prevent duplicate submission, and expose progress to assistive technology when needed. |
| Validation error | Show field-level, translated messages adjacent to the relevant field and retain safe user input. |
| API error | Show a concise translated explanation and a retry or recovery action when possible. |
| Network failure | Distinguish unavailable service from invalid input; do not show raw exceptions. |
| Empty state | Explain what is empty and provide a relevant next action; never show only `No data`. |
| Success | Confirm the completed action and update or revalidate affected UI. |
| Disabled state | Explain unavailable actions through state and accessible labeling, not color alone. |

Global loading, error, global-error, and not-found boundaries now exist under `src/app`. There is no shared feature-level empty or success component yet. Add a shared primitive only when the same behavior is needed in multiple screens.

## 12. Forms and Validation

`react-hook-form`, `zod`, and `@hookform/resolvers` are installed for the intended form architecture, but the reviewed active public implementation does not yet use them for real submission. Login and registration screens are presentational and do not establish an implemented form contract.

When production forms are introduced:

- Use the approved React Hook Form plus Zod stack rather than adding another library.
- Keep schemas in a feature-appropriate location and share the schema or equivalent rules with server validation when possible.
- Validate on the client for immediate feedback and on the server/API as the authoritative check.
- Use translated labels and messages in both catalogs.
- Keep event handlers and mutation logic above JSX.
- Disable duplicate submits and render success/error outcomes intentionally.
- Never log passwords, tokens, or sensitive financial data.

Do not treat a presentational form as authentication.

## 13. Internationalization

### Active implementation

The project uses `next-intl` `4.14.1`.

- Supported locales: `en` and `bn`.
- Default locale: `bn`.
- Locale prefixes: always required.
- Translation files: `messages/en.json` and `messages/bn.json`.
- Routing policy: `src/i18n/routing.ts`.
- Request config: `src/i18n/request.ts`.
- Locale-aware navigation: `src/i18n/navigation.ts`.
- Provider and locale validation: `src/app/[locale]/layout.tsx`.

The public home page uses `getTranslations({ locale, namespace: 'HomePage' })`. Client components use `useTranslations` through `NextIntlClientProvider`. Follow this explicit-locale pattern in new Server Components; do not assume route inference.

### Translation rules

- Add every new user-facing key to both catalogs with identical structure.
- Use feature/page namespaces, for example `Deposits`, `Loans`, or `MemberProfile`, rather than one catalog per component.
- Translate headings, buttons, navigation, labels, statuses, validation, loading, empty, error, and success text.
- Do not translate user-entered names, IDs, phone numbers, notes, or canonical API codes.
- Keep stable codes such as `pending` in data and map them to localized labels at the UI boundary.
- Use `src/i18n/navigation.ts` for internal links.
- Test long Bangla labels and both locale routes after adding copy.

Only the public page is meaningfully localized today. Auth/member/admin screens still contain hard-coded strings and should be localized when they are actively implemented, not copied as the preferred pattern.

## 14. Tailwind and Design System

The project uses Tailwind CSS `4.3.3` through `@import 'tailwindcss';` in `src/app/globals.css` and `@tailwindcss/postcss` in `postcss.config.mjs`. Do not add Tailwind v3 configuration or directives without approval.

### Tokens

`globals.css` defines Tailwind v4 theme aliases and semantic CSS variables:

- Primary: `#0f6b4f`; hover: `#0c5a42`
- Secondary: `#1e3a5f`
- Background: `#f7f8f7`; surface: `#ffffff`; muted surface: `#eef2ef`
- Border: `#e3e6e4`
- Text: `#111827`; muted text: `#5b6660`
- Success: `#1a8a5f`; warning: `#b8860b`; error: `#b3261e`; info: `#2563eb`
- Focus ring: `rgba(15, 107, 79, 0.4)`
- Disabled: `#9ca3af`
- App max width token: `75rem`

Use semantic aliases such as `bg-app-surface`, `text-app-text`, or CSS variable references rather than repeating hard-coded colors. Existing public code still contains hard-coded hex values; do not expand that pattern in new work. There is currently no implemented `[data-theme='dark']` token block or verified theme switcher. Do not document or build dark mode as if it exists.

### Styling rules

- Use Tailwind utilities for layout and spacing.
- Use existing semantic tokens for theme-sensitive colors.
- Keep spacing on the existing 4px-based rhythm: 4, 8, 12, 16, 24, 32, 48, 64px.
- Preserve visible `:focus-visible` outlines.
- Keep practical mobile touch targets at least 44px.
- Pair status color with text or an icon; never rely on color alone.
- Keep tables scrollable on narrow screens; do not truncate financial values.
- Use restrained borders, surfaces, and shadows consistent with the existing record-oriented visual language.
- Do not introduce arbitrary CSS where an existing token or utility is sufficient.
- Use `lucide-react` icons where an icon is needed; do not add an icon library.
- The current public page uses emoji and hard-coded colors in places; this is existing debt, not a new standard.

### Fonts

`src/app/fonts.ts` loads Inter and Hind Siliguri with `next/font/google`. `globals.css` applies the font according to `html[lang='en']` or `html[lang='bn']`. Test Bangla text with realistic labels and line lengths; do not reduce type size merely to compensate for script metrics.

## 15. JSX and Component Coding Style

Component files should follow this order:

1. Imports
2. Types
3. Constants
4. Component declaration
5. State and hooks
6. Data fetching
7. Derived values
8. Event handlers
9. Helper functions
10. Focused, declarative JSX return

Keep calculations, transformations, condition-heavy expressions, query/mutation setup, and event handlers above `return`. Avoid large inline `.map()` preparation, repeated formatting, and business logic directly in JSX when it can be named before rendering. Keep keys stable and meaningful.

Use double or single quotes consistently with the surrounding file. Preserve existing formatting and avoid unrelated reformatting.

## 16. Naming and File Conventions

Follow the conventions visible in the repository:

- React component files: kebab-case, for example `page-container.tsx`, `brand-logo.tsx`.
- React component names: PascalCase, for example `PageContainer` and `BrandLogo`.
- Route files: Next conventions such as `page.tsx`, `layout.tsx`, `manifest.ts`, and `sw.ts`.
- Folders: lower-case route/feature names; route groups use parentheses.
- Functions and variables: camelCase.
- Constants: descriptive camelCase unless a true module constant convention requires otherwise.
- Types: PascalCase; use explicit prop types near the component unless a type is shared.
- Hooks: `use...` naming and Client Components only when hooks require it.
- Utilities: descriptive camelCase exports in `src/lib/utils`.
- API functions: name by operation and domain; keep them behind the approved service boundary.
- Translation keys: stable, descriptive, namespace-based camelCase keys matching both JSON files.
- URL segments: lower-case and locale-aware.

Do not create a new naming convention for one feature.

## 17. TypeScript Rules

- `strict: true` is required; do not weaken it.
- Avoid `any`, `@ts-ignore`, and `@ts-nocheck` in application code. The existing service-worker `@ts-nocheck` is legacy and not a template.
- Type component props, route params, service inputs, and API responses.
- Prefer narrow unions and explicit types for locale/status codes.
- Handle `null` and `undefined` deliberately rather than asserting them away.
- Keep canonical data types separate from display strings.
- Use `type` or `interface` according to the nearest established code; do not create an artificial project-wide migration.
- Do not weaken compiler settings to silence a feature error.
- Run `npm run typecheck` after TypeScript changes.

The `@/*` alias resolves to `src/*`. Prefer it for absolute imports when consistent with the surrounding file.

## 18. Accessibility

Every new UI must use semantic HTML and consider:

- Correct heading order and landmark elements.
- Real `<button>` elements for actions and links for navigation.
- Associated labels for every form control.
- Keyboard operation and visible focus states.
- Accessible names for icon-only buttons and meaningful `aria-*` attributes only when semantic HTML is insufficient.
- Error messages associated with fields and announced where necessary.
- Adequate contrast and non-color status indicators.
- Mobile touch targets and non-overlapping content.
- Menu/dialog focus behavior when those patterns are introduced.

Do not add ARIA attributes that duplicate or contradict native semantics.

## 19. SEO and Next.js Conventions

The localized layout currently provides locale-specific `title` and `description` metadata. Public pages should remain Server Components and SEO-friendly.

Before adding public content, consult `docs/seo.md` when that planning document is present; otherwise define and approve the SEO policy before adding indexing behavior. Verify:

- A meaningful localized title and description.
- Semantic headings and content structure.
- Correct locale URLs and internal links.
- No private member/admin content in public metadata.
- Open Graph, robots, and sitemap behavior only where actually implemented and approved.

There are no verified `robots.ts` or `sitemap.ts` files in the current tree. Do not claim those mechanisms are active or create them as an incidental page change.

## 20. Performance

Server Components are the default performance boundary. Keep client islands small, avoid shipping query/table/chart libraries to routes that do not use them, use `next/font` and `next/image` for actual assets, and keep static public content renderable without client JavaScript. Use `PageContainer` and stable grid/flex constraints to prevent layout shifts. Financial tables must remain readable on narrow screens rather than hiding values.

Before production release, measure the public and authenticated flows on mobile throttling, inspect bundle impact after adding client dependencies, verify image dimensions and loading behavior, and test slow or failed API responses. The current repository has no performance budget, RUM, or load-test configuration; do not claim measured targets.

## 21. Authentication, Authorization, and Security

`next-auth` is installed but intentionally not used. The current frontend authentication boundary uses an opaque `somiti_session` HttpOnly cookie issued by the backend through `src/app/api/auth/login/route.ts`. `src/lib/auth/session.ts` forwards that cookie to the backend `/auth/me` endpoint, validates the returned user shape, and enforces `member` or `admin` roles. `src/app/api/auth/logout/route.ts` clears the cookie. JWT issuance, refresh, rotation, revocation, password hashing, and authorization remain backend responsibilities.

Until an approved auth implementation exists:

- Member/admin routes are protected by the proxy cookie check and server-side layouts, but backend authorization remains authoritative.
- Do not add private data to mock public content.
- Keep secrets out of source and client-visible variables.
- Treat `.env.example` as documentation only; real `.env` files are ignored.
- Never log passwords, tokens, or sensitive financial records.
- Validate and authorize every future mutation on the server/API, not only in the browser.
- Follow `docs/authentication.md` only when that planning document is present; the current frontend contract is the opaque-cookie and `/auth/me` flow described above.

The approved production direction is short-lived access tokens with refresh tokens in `HttpOnly`, `Secure`, appropriately scoped `SameSite` cookies. Never place sensitive JWTs in `localStorage`. The backend remains the authorization authority; Next.js route protection is an additional UX boundary, not a substitute for API authorization.

Because cookie-based authentication is planned, the final backend/BFF design must also define CSRF protection, origin checks, CORS policy, refresh-token rotation/revocation, rate limiting, secure logout, and 401/403 handling before mutations are enabled.

## 22. Production Quality Checklist

Before considering a feature complete, verify:

- The implementation uses the correct existing route and directory.
- Existing components and utilities were reused where appropriate.
- Server/Client boundaries are minimal and intentional.
- All user-facing text is translated in `en.json` and `bn.json`.
- Types are strict and no unnecessary `any` was added.
- Loading, validation, API error, empty, success, retry, and disabled states are handled.
- Financial values are canonical in data and correctly formatted in the UI.
- Accessibility, keyboard navigation, focus, labels, contrast, and semantics work.
- Mobile and desktop layouts do not overlap, truncate, or require desktop-only actions.
- No private data is exposed to public pages, metadata, or caches.
- No dependency or version changed without approval.
- No duplicate component, utility, service, or translation mechanism was introduced.
- Public pages retain metadata and semantic structure.
- `npm run typecheck` passes; run `npm run build` for route/config changes.
- Any lint-script incompatibility or unrelated pre-existing error is reported rather than hidden.

## 23. Required Workflow for New Features

1. Read this guide and any relevant planning documents that are present in `docs/`.
2. State the intended scope and files before editing.
3. Inspect the nearest existing route, component, utility, and data path.
4. Identify reusable components and avoid duplicates.
5. Choose the correct route/module and preserve the locale segment.
6. Decide the smallest Server/Client boundary.
7. Determine whether the feature is currently mock/demo or requires an approved API contract.
8. Define types, validation, and business-rule references.
9. Define loading, error, empty, success, retry, and disabled behavior.
10. Add matching English and Bangla translation keys.
11. Implement logic above the JSX return and keep the UI declarative.
12. Implement responsive and accessible behavior.
13. Run focused validation, then `npm run typecheck` and any relevant build/lint command.
14. Review the diff for duplication, dependency changes, route changes, hard-coded text, and unrelated refactoring.
15. Update this guide or the relevant planning document when the approved architecture changes.

## 24. Instructions for Future AI Assistants

Before changing code, AI **MUST**:

1. Read `PROJECT_DEVELOPMENT_GUIDE.md`.
2. Inspect the relevant existing files and current route.
3. Verify which claimed components, services, providers, and libraries actually exist.
4. Reuse existing components/utilities.
5. Follow the installed package versions.
6. Preserve the current App Router and locale architecture.
7. Avoid unnecessary dependencies and duplicate abstractions.
8. Preserve Server/Client boundaries.
9. Follow the current API/data strategy instead of inventing a parallel one.
10. Follow translation catalog and localized navigation conventions.
11. Handle all relevant UI states.
12. Maintain accessibility and responsive behavior.
13. Keep component logic before JSX.
14. Avoid unrelated refactoring.
15. Run focused validation after editing.

If a requested feature conflicts with this guide or with the existing implementation, explain the conflict and ask for permission before introducing a new architectural pattern. Ask before installing a package or changing a package version. If a shared component solves the problem, use it rather than creating an equivalent.

## 25. Important File Responsibilities

| File or directory | Responsibility |
|---|---|
| `package.json` | Dependency ranges and project scripts. Change only with approval. |
| `package-lock.json` | Resolved dependency baseline. Keep synchronized with approved dependency changes. |
| `next.config.mjs` | next-intl and Serwist integration; Serwist is currently disabled; React strict mode is enabled. |
| `postcss.config.mjs` | Tailwind CSS v4 PostCSS plugin configuration. |
| `tsconfig.json` | Strict TypeScript compiler settings, aliases, Next plugin, and webworker typings. |
| `README.md` | Documentation index and docs-first policy. |
| `PROJECT_ARCHITECTURE.md` | Historical high-level architecture document; currently absent from the worktree. |
| `src/app/loading.tsx` | Global baseline loading boundary with an accessible status message. |
| `src/app/global-error.tsx` | Last-resort document-level error boundary. |
| `src/app/not-found.tsx` | Root-safe not-found page linking to the default localized route. |
| `src/app/[locale]/(private)/layout.tsx` | Shared private-route policy module used by member/admin route layouts. |
| `src/app/[locale]/member/layout.tsx` | Server-side member session and role guard for all member descendants. |
| `src/app/[locale]/admin/layout.tsx` | Server-side admin session and role guard for all admin descendants. |
| `src/app/[locale]/unauthorized/page.tsx` | Localized forbidden-access page. |
| `src/app/[locale]/layout.tsx` | Locale validation, localized metadata, document language, and message provider. |
| `src/app/[locale]/loading.tsx` | Locale loading boundary for localized application routes. |
| `src/app/[locale]/error.tsx` | Locale error boundary with localized messaging and retry behavior. |
| `src/app/[locale]/not-found.tsx` | Locale-aware not-found page. |
| `src/app/[locale]/(public)/page.tsx` | Active public landing page composition. |
| `src/app/[locale]/(public)/_components/public-navbar.tsx` | Public navigation, mobile menu, and locale switch behavior. |
| `src/app/[locale]/(public)/_components/footer.tsx` | Localized public footer and organization information. |
| `src/app/globals.css` | Tailwind import, CSS variables, typography, baseline styles, and focus outline. |
| `src/app/fonts.ts` | Inter and Hind Siliguri font definitions. |
| `src/app/manifest.ts` | Web app manifest metadata and branding icon references. |
| `src/app/sw.ts` | Current pass-through service worker source; no caching strategy. |
| `src/proxy.ts` | next-intl locale proxy, route matcher, and missing-session redirect for localized member/admin paths. |
| `src/app/api/auth/login/route.ts` | Same-origin login proxy to the backend `/auth/login` endpoint; forwards the opaque session cookie. |
| `src/app/api/auth/logout/route.ts` | Clears the frontend session cookie. |
| `src/lib/auth/constants.ts` | Shared opaque session-cookie name used by proxy, server session, and auth routes. |
| `src/lib/auth/session.ts` | Server-only `/auth/me` lookup and role-aware redirect guard. |
| `src/i18n/routing.ts` | Single source for locales, default locale, and locale prefix policy. |
| `src/i18n/request.ts` | Resolves the active locale and loads the matching message JSON. |
| `src/i18n/navigation.ts` | Locale-aware navigation helpers. |
| `messages/en.json` | English message catalog. |
| `messages/bn.json` | Bangla message catalog with matching key structure. |
| `src/components/branding/brand-logo.tsx` | Reusable brand logo presentation. |
| `src/components/shared/page-container.tsx` | Shared page width and padding wrapper. |
| `src/components/shared/app-shell.tsx` | Existing Client Component shell for public/member/admin screens with locale toggle and static navigation; it is not an auth boundary and currently depends on the missing legacy `@/lib/i18n/locales` helper. |
| `src/components/shared/stat-card.tsx` | Shared statistic display. |
| `src/components/shared/status-badge.tsx` | Shared status badge presentation. |
| `src/lib/env.ts` | Lazy Zod validation for public/server environment variables. |
| `src/lib/api-errors.ts` | Structured `ApiError` type for non-2xx API responses. |
| `src/lib/mock-data/index.ts` | Temporary member/admin demo fixtures. |
| `src/lib/utils/cn.ts` | `clsx` plus `tailwind-merge` class helper. |
| `src/lib/utils/currency.ts` | Locale-aware BDT formatting helpers. |
| `src/services/api-client.ts` | Typed REST request wrapper with JSON bodies, credentials, base URL resolution, and structured errors; not yet a complete backend service layer. |
| `public/branding/` | Static logos, favicon, PWA, and maskable branding assets. |
| `docs/` | Intended location for business rules, architecture, API, auth, design, i18n, SEO, PWA, information architecture, roadmap, and client decisions; currently absent from the worktree. |

## 26. Architectural Decisions and Known Gaps

- **Locale-prefixed App Router:** `next-intl` centralizes locale routing and message loading so public and future protected pages can share bilingual URLs.
- **Explicit locale loading:** the locale layout passes `locale` to `getMessages`; Server Components should pass it to `getTranslations`. This avoids hidden locale assumptions in the current hierarchy.
- **Server-first rendering:** static and read-heavy content stays on the server; interaction is isolated to Client Components to limit browser JavaScript.
- **Semantic CSS tokens:** global variables provide a consistent financial-record visual language and a future theme boundary, although only light tokens are currently implemented.
- **Docs-first financial rules:** savings, loan, correction, and asset-share behavior must be decided in documentation before production persistence is built.
- **Mock-first prototype:** local fixtures let the public/demo experience be reviewed before backend coupling. Fixtures are not a substitute for an API or database.
- **Serwist disabled:** service-worker caching is deliberately inactive until offline safety and data sensitivity are defined. Never cache private financial data casually.

Known repository gaps that must remain visible:

- No backend, database, or domain service layer exists in this repository; auth proxy routes and frontend guards now exist but require the external backend.
- Backend JWT lifecycle and authorization are not implemented here.
- No React Query provider or global state provider.
- No shared form, table, or empty-state system; global loading/error/not-found boundaries now exist.
- Auth/member/admin screens contain hard-coded strings and demo content.
- No verified robots, sitemap, test configuration, or test script.
- Serwist is configured but disabled; `sw.ts` has no caching strategy.
- The previous planning documents are currently deleted in the worktree; this guide and the current source tree are the available architectural references until those documents are restored or replaced.

## 27. Do Not Over-engineer

Use the simplest architecture that fits the existing project. Do not introduce new abstractions without a real repeated responsibility. Do not add libraries for small problems, duplicate utility layers, unnecessary global state, broad Client Components, parallel API wrappers, unnecessary folders, or design-system primitives that are used once.

The best default is a small, typed change in the nearest existing module, with translated copy, a deliberate state model, focused validation, and no unrelated cleanup.
