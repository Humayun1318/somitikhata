# SomitiKhata (web app)

The web app of **SomitiKhata**, the digital ledger and membership system of BKS Lohagara, a
Bangladeshi cooperative savings society (*somiti*). Office staff manage members, savings, the
society's accounts, loans, the year-end and reports; members see their own savings, loans and
membership. Bangla first, English available.

This repository is the **frontend** (Next.js). The REST API is a separate repository:
[Humayun1318/bottolisomobai-server](https://github.com/Humayun1318/bottolisomobai-server)
(private).

## Contents

- [Links](#links)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture at a glance](#architecture-at-a-glance)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How the app talks to the API](#how-the-app-talks-to-the-api)
- [Quality checks](#quality-checks)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security notes](#security-notes)
- [Documentation index](#documentation-index)
- [Contributing](#contributing)
- [License](#license)

## Links

| What | Where |
|---|---|
| Live app | <https://somitikhata.vercel.app> |
| Backend API | <https://apibottolisomobai.vercel.app> (from the backend repository's settings; **needs confirmation**) |
| API reference | Swagger UI at `<backend>/api-docs` (local: `http://localhost:5000/api-docs`; production only with credentials) and `docs/openapi.yaml` in the backend repository |
| Frontend repository | <https://github.com/Humayun1318/somitikhata> |
| Backend repository | <https://github.com/Humayun1318/bottolisomobai-server> (private) |
| Backend documentation | [README](https://github.com/Humayun1318/bottolisomobai-server#readme) and `docs/` of the backend repository |

## Features

Implemented and connected to the API:

- **Public site:** home page, login, a "how to become a member" page (there is no online
  sign-up: the office opens memberships), localized 404, `robots.txt`, `sitemap.xml`, share cards.
- **Sign-in:** member number, staff ID or email; forced first password change; session kept
  with HttpOnly cookies and silent refresh.
- **Office area (`/admin`)**, for admins and the super admin:
  - Dashboard: members, balances, cash and bank, the year's flows, loans, year-end status.
  - Members: list with search, filters, sort and pagination; add (with first nominee), edit,
    status, nominees, documents (photo, NID, signature), login-account reset.
  - Collections: member passbook, cash book, samiti entries (income, expense, asset,
    liability, transfers), ledger heads, opening balances, reversals.
  - Loans: applications, approval, disbursement, installment collection.
  - Year-end: service charge, depreciation, dividend, profit appropriation (super admin runs).
  - Reports: receipts & payments, trial balance, income & expenditure, balance sheet, dividend
    list; printable.
  - Admins (super admin creates and manages them), settings, profile with photo.
- **Member area (`/member`):** dashboard, savings (passbook), loans, membership record with
  nominees and documents, profile.

Shown as "coming soon" because the API does not support them yet: online deposit request,
online loan application, pending online member applications, member settings.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 with semantic design tokens (`src/app/globals.css`) |
| i18n | next-intl 4: `bn` (default) and `en`, locale always in the URL |
| Server state | TanStack Query 5 |
| HTTP | axios (one instance, cookies, automatic refresh) |
| Forms | react-hook-form + Zod 4 (`@hookform/resolvers`) |
| Icons | lucide-react |
| Fonts | Inter, Hind Siliguri (`next/font/google`) |
| PWA | Serwist configured but **disabled** (`disable: true` in `next.config.mjs`) |
| Quality | ESLint 9 (`eslint-config-next`), `tsc --noEmit` |

## Architecture at a glance

```text
Browser
  └─ Next.js app (this repo)
       ├─ public pages: static, server-rendered per locale
       └─ /admin, /member: static shell + client components
             └─ TanStack Query hooks → feature api.ts → httpKit (axios, withCredentials)
                   └─ SomitiKhata API (separate origin, sets HttpOnly cookies)
```

- The auth cookies belong to the **API's origin**, so the Next.js server never sees them. Route
  protection happens in the browser (`AuthGate`), and the **API is the real security boundary**.
- `src/proxy.ts` (Next.js middleware) only does locale routing.

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | **20.9 or newer** (required by Next.js 16) |
| npm | bundled with Node |
| Backend API | running locally ([backend setup](https://github.com/Humayun1318/bottolisomobai-server#getting-started)) or a reachable deployment |

### Setup

```bash
git clone https://github.com/Humayun1318/somitikhata.git
cd somitikhata
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>; it redirects to `/bn`.

`.env.local` (see [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The backend must allow this origin: its `FRONTEND_URL` must contain `http://localhost:3000`.
Sign in with the backend's super admin (staff ID and password from the backend's `.env`), or a
member account created by the office (first password = the member's phone number).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (`eslint .`) |
| `npm run typecheck` | `tsc --noEmit` |

There is no automated test suite in this repository.

## Project structure

```text
src/
├── app/                       # routing only: layouts, pages, error/loading/not-found, SEO routes
│   ├── [locale]/
│   │   ├── (public)/page.tsx          # home
│   │   ├── (auth)/login, register     # sign-in pages
│   │   ├── (dashboard)/admin/...      # office area (AuthGate, DashboardShell)
│   │   ├── (dashboard)/member/...     # member area (AuthGate, DashboardShell)
│   │   ├── [...rest]/page.tsx         # unknown URL → localized 404
│   │   ├── layout.tsx, error.tsx, not-found.tsx
│   ├── globals.css, fonts.ts, manifest.ts, robots.ts, sitemap.ts, sw.ts
├── features/<name>/           # everything for one feature: api, query-keys, types, schemas, hooks, components
├── components/ui/             # primitives: Button, Input, Dialog, SelectMenu, ...
├── components/shared/         # app-wide pieces: PageHeader, Money, Pagination, list states, toasts, ...
├── components/layout/         # public navbar and footer
├── lib/                       # http (axios + refresh), query (TanStack setup), env, money, dates, metadata, ...
├── providers/app-providers.tsx
├── i18n/                      # next-intl routing, navigation, request config, message loading
├── types/                     # API envelope, pagination, address
└── proxy.ts                   # locale routing (Next.js middleware)
messages/<locale>/<area>.json  # translations, one file per area, same keys in en and bn
public/branding/               # logos, icons, share image
```

## How the app talks to the API

- One axios instance, `httpKit` (`src/lib/http/http-kit.ts`), with `baseURL` =
  `NEXT_PUBLIC_API_BASE_URL` and `withCredentials: true`. Never call `fetch`/axios directly.
- Each feature has an `api.ts` of plain async functions that unwrap the API envelope
  (`{ statusCode, success, message, data }`).
- Reads are `useQuery` hooks, writes are `useMutation` hooks, in the feature's `hooks/`, with keys
  from the feature's `query-keys.ts`.
- A 401 triggers one token refresh and one retry; if the refresh fails the user is sent to sign in.
- Money arrives as **paisa**; it is displayed with `<Money>` / `formatPaisa()`. Request bodies send
  **taka**.

Details: [docs/API.md](docs/API.md) and [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

Run all three before a pull request. There is no CI workflow in the repository.

## Deployment

The live app is on Vercel (<https://somitikhata.vercel.app>). The repository has no
`vercel.json`; Vercel's Next.js defaults apply. Set `NEXT_PUBLIC_API_BASE_URL` and
`NEXT_PUBLIC_SITE_URL` in the Vercel project's environment variables, and add the deployed origin
to the backend's `FRONTEND_URL`. More: [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md#deployment).

## Troubleshooting

| Symptom | Fix |
|---|---|
| The app fails with a Zod error about `NEXT_PUBLIC_API_BASE_URL` | Set it to a full URL including `/api/v1` |
| Every request fails with a network/CORS error | The backend is not running, or its `FRONTEND_URL` does not include this app's origin |
| Sign-in succeeds but the next page goes back to login | Cookies are not stored: check `FRONTEND_URL` on the backend, HTTPS in production, and that the browser allows the API's cookies |
| `403 Request origin is not allowed` on save | The backend's `FRONTEND_URL` does not list this origin |
| Text shows a raw key like `Members.title` | The key is missing in `messages/<locale>/…json` (or the namespace is not sent to the client on a public page) |
| Canonical/sitemap URLs show `localhost` in production | Set `NEXT_PUBLIC_SITE_URL` |

More in [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md#troubleshooting).

## Security notes

- The app never reads, stores or sends a token; the API sets HttpOnly cookies.
- Route guards in the browser decide only what to show. Every permission is enforced by the API.
- Only `NEXT_PUBLIC_*` variables reach the browser; never put a secret in one (the Cloudinary
  secret and JWT secrets belong to the backend only).
- Security headers (`X-Frame-Options: DENY`, `nosniff`, referrer and permissions policy) are set in
  `next.config.mjs`. A Content-Security-Policy is not set (it depends on each deployment's API
  origin).
- Signed-in pages are `noindex` and excluded in `robots.txt`.

## Documentation index

| Document | Read it for |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Structure, rendering, routing, layouts, providers, data flow |
| [DESIGN.md](docs/DESIGN.md) | Design tokens, typography, components, UI states, accessibility, i18n |
| [API.md](docs/API.md) | API client, feature API pattern, query keys, caching, invalidation |
| [AUTHENTICATION.md](docs/AUTHENTICATION.md) | Sign-in, session restore, refresh, guards, roles |
| [ERROR_HANDLING.md](docs/ERROR_HANDLING.md) | `ApiError`, error mappers, toasts, error pages |
| [UTILITIES.md](docs/UTILITIES.md) | Every helper, hook and shared component |
| [ENVIRONMENT.md](docs/ENVIRONMENT.md) | Environment variables |
| [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) | Conventions, feature rules, adding features/pages/translations, deployment, troubleshooting |
| [AI_DEVELOPER_GUIDE.md](docs/AI_DEVELOPER_GUIDE.md) | Rules for AI assistants (summary in [AGENTS.md](AGENTS.md)) |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Branches, commits, pull requests |

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## License

**Needs confirmation.** The repository has no `LICENSE` file and `package.json` has no `license`
field, so no license has been granted. The repository is public; that alone does not permit
reuse.
